package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"go.mau.fi/whatsmeow"
	"go.mau.fi/whatsmeow/store/sqlstore"
	"go.mau.fi/whatsmeow/types"
	waLog "go.mau.fi/whatsmeow/util/log"
	_ "modernc.org/sqlite"
)

type Instance struct {
	Client    *whatsmeow.Client
	UserID    string
	Status    string
	QRCode    string
	Phone     string
	CreatedAt time.Time
}

var instances = make(map[string]*Instance)

func main() {
	// Load environment variables from parent directory
	if err := godotenv.Load("../.env"); err != nil {
		fmt.Println("⚠️ Note: Could not load ../.env file")
	}

	// Database connection
	dbLog := waLog.Stdout("Database", "INFO", true)
	var container *sqlstore.Container
	var err error

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL != "" {
		// PostgreSQL connection
		fmt.Println("🔌 Connecting to PostgreSQL...")
		container, err = sqlstore.New(context.Background(), "postgres", dbURL, dbLog)
	} else {
		// SQLite fallback
		fmt.Println("📂 Using SQLite storage...")
		container, err = sqlstore.New(context.Background(), "sqlite", "file:sessions/whatsmeow.db?_pragma=foreign_keys=1", dbLog)
	}

	if err != nil {
		panic(err)
	}

	app := fiber.New()

	// Middleware
	app.Use(cors.New())
	app.Use(logger.New())

	// Auth middleware
	apiKey := os.Getenv("WHATSMEOW_API_KEY")
	if apiKey == "" {
		log.Fatal("WHATSMEOW_API_KEY not set")
	}

	app.Use(func(c *fiber.Ctx) error {
		if c.Path() == "/health" || c.Path() == "/api/emails/send" {
			return c.Next()
		}

		auth := c.Get("Authorization")
		if auth != "Bearer "+apiKey {
			return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
		}
		return c.Next()
	})

	// Routes
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":    "healthy",
			"instances": len(instances),
			"timestamp": time.Now().Unix(),
		})
	})

	app.Post("/api/instances/create", func(c *fiber.Ctx) error {
		var body struct {
			UserID string `json:"userId"`
		}
		if err := c.BodyParser(&body); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
		}

		// Check existing
		if existing, ok := instances[body.UserID]; ok {
			if existing.Client.IsConnected() {
				return c.JSON(fiber.Map{
					"instanceId": body.UserID,
					"status":     "already_connected",
				})
			}
			existing.Client.Disconnect()
			delete(instances, body.UserID)
		}

		// Create new device
		deviceStore := container.NewDevice()
		clientLog := waLog.Stdout("Client", "INFO", true)
		client := whatsmeow.NewClient(deviceStore, clientLog)

		// Generate QR
		qrChan, _ := client.GetQRChannel(context.Background())
		client.Connect()

		// Wait for QR
		var qrCode string
		select {
		case evt := <-qrChan:
			if evt.Event == "code" {
				qrCode = evt.Code
			}
		case <-time.After(30 * time.Second):
			return c.Status(408).JSON(fiber.Map{"error": "QR timeout"})
		}

		instance := &Instance{
			Client:    client,
			UserID:    body.UserID,
			Status:    "qr_pending",
			QRCode:    qrCode,
			CreatedAt: time.Now(),
		}
		instances[body.UserID] = instance

		// Listen for connection
		go func() {
			for evt := range qrChan {
				if evt.Event == "success" {
					instance.Status = "connected"
					instance.QRCode = ""
					if client.Store.ID != nil {
						instance.Phone = client.Store.ID.User
					}
					break
				}
			}
		}()

		return c.JSON(fiber.Map{
			"instanceId": body.UserID,
			"qrCode":     qrCode,
			"status":     "qr_pending",
		})
	})

	app.Get("/api/instances/:userId/status", func(c *fiber.Ctx) error {
		userID := c.Params("userId")
		instance, ok := instances[userID]

		if !ok {
			return c.Status(404).JSON(fiber.Map{"status": "not_found"})
		}

		status := "disconnected"
		if instance.Client.IsConnected() {
			status = "connected"
		} else if instance.QRCode != "" {
			status = "qr_pending"
		}

		return c.JSON(fiber.Map{
			"status":    status,
			"qrCode":    instance.QRCode,
			"createdAt": instance.CreatedAt.Unix(),
			"phone":     instance.Phone,
		})
	})

	app.Post("/api/instances/:userId/send", func(c *fiber.Ctx) error {
		userID := c.Params("userId")
		var body struct {
			To      string `json:"to"`
			Message string `json:"message"`
		}

		if err := c.BodyParser(&body); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
		}

		instance, ok := instances[userID]
		if !ok || !instance.Client.IsConnected() {
			return c.Status(404).JSON(fiber.Map{"error": "Instance not connected"})
		}

		jid := types.NewJID(body.To, types.DefaultUserServer)
		// Send message would go here with proper proto
		_ = jid

		return c.JSON(fiber.Map{
			"success": true,
			"to":      body.To,
		})
	})

	// Email Proxy Route to fix CORS
	app.Post("/api/emails/send", func(c *fiber.Ctx) error {
		var body struct {
			To      string `json:"to"`
			Subject string `json:"subject"`
			Html    string `json:"html"`
		}

		if err := c.BodyParser(&body); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
		}

		// Get API Key (support both standard and Vite naming)
		apiKey := os.Getenv("RESEND_API_KEY")
		if apiKey == "" {
			apiKey = os.Getenv("VITE_RESEND_API_KEY")
		}

		if apiKey == "" {
			return c.Status(500).JSON(fiber.Map{"error": "Server missing RESEND_API_KEY"})
		}

		// Prepare Resend Request
		resendBody := map[string]interface{}{
			"from":    "Mestre nos Negocios <suporte@mestrenosnegocios.com>",
			"to":      []string{body.To},
			"subject": body.Subject,
			"html":    body.Html,
		}

		jsonBody, _ := json.Marshal(resendBody)

		req, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(jsonBody))
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to create request"})
		}

		req.Header.Set("Authorization", "Bearer "+apiKey)
		req.Header.Set("Content-Type", "application/json")

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to call Resend API"})
		}
		defer resp.Body.Close()

		// Read response
		var result map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&result)

		if resp.StatusCode >= 400 {
			return c.Status(resp.StatusCode).JSON(result)
		}

		return c.JSON(fiber.Map{
			"success": true,
			"id":      result["id"],
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}

	fmt.Printf("🚀 Whatsmeow server starting on port %s\n", port)
	log.Fatal(app.Listen(":" + port))
}
