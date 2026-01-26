package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
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
var instanceLock sync.RWMutex

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
		instanceLock.RLock()
		count := len(instances)
		instanceLock.RUnlock()
		return c.JSON(fiber.Map{
			"status":    "healthy",
			"instances": count,
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
		instanceLock.Lock()
		if existing, ok := instances[body.UserID]; ok {
			if existing.Client.IsConnected() {
				instanceLock.Unlock()
				return c.JSON(fiber.Map{
					"instanceId": body.UserID,
					"status":     "already_connected",
				})
			}
			existing.Client.Disconnect()
			delete(instances, body.UserID)
		}
		instanceLock.Unlock()

		// Create new device
		deviceStore := container.NewDevice()
		clientLog := waLog.Stdout("Client", "INFO", true)
		client := whatsmeow.NewClient(deviceStore, clientLog)

		// Generate QR
		qrChan, _ := client.GetQRChannel(context.Background())

		err = client.Connect()
		if err != nil {
			fmt.Printf("❌ Connect error: %v\n", err)
			return c.Status(500).JSON(fiber.Map{"error": "Failed to connect to WA"})
		}

		// ANTI-GHOST CHECK
		if client.IsLoggedIn() {
			fmt.Printf("👻 GHOST SESSION DETECTED for %s! Force clearing...\n", body.UserID)
			client.Logout(context.Background())
			client.Store.Delete(context.Background())
			// Force disconnect
			client.Disconnect()

			// Recreate cleanly
			deviceStore = container.NewDevice()
			client = whatsmeow.NewClient(deviceStore, clientLog)
			qrChan, _ = client.GetQRChannel(context.Background())
			client.Connect()
		}

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

		instanceLock.Lock()
		instances[body.UserID] = instance
		instanceLock.Unlock()

		// Listen for connection
		go func() {
			for evt := range qrChan {
				if evt.Event == "success" {
					fmt.Printf("✅ Connection Event: Success for %s\n", body.UserID)
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

	app.Post("/api/instances/:userId/logout", func(c *fiber.Ctx) error {
		userID := c.Params("userId")

		instanceLock.Lock()
		instance, ok := instances[userID]
		if ok {
			delete(instances, userID)
		}
		instanceLock.Unlock()

		if ok {
			instance.Client.Disconnect()
			fmt.Printf("👋 Instance %s logged out and removed.\n", userID)
		}
		return c.JSON(fiber.Map{"status": "logged_out"})
	})

	app.Get("/api/instances/:userId/status", func(c *fiber.Ctx) error {
		userID := c.Params("userId")

		instanceLock.RLock()
		instance, ok := instances[userID]
		instanceLock.RUnlock()

		if !ok {
			return c.Status(404).JSON(fiber.Map{"status": "not_found"})
		}

		status := "disconnected"
		connected := instance.Client.IsConnected()
		loggedIn := instance.Client.IsLoggedIn()
		hasID := instance.Client.Store.ID != nil
		qr_len := len(instance.QRCode)

		// DEBUG LOGGING
		fmt.Printf("[DEBUG STATUS] User=%s | Connected=%v | LoggedIn=%v | HasID=%v | QR_Len=%d | CurrentStatus=%s\n",
			userID, connected, loggedIn, hasID, qr_len, instance.Status)

		// If we have a QR code, we are PENDING, regardless of transient connection state
		if instance.QRCode != "" {
			status = "qr_pending"
		} else if connected && loggedIn && hasID {
			status = "connected"
		}

		// Force sync logic output (Resolving the Paradox)
		if status == "connected" && instance.QRCode != "" {
			fmt.Println("⚠️ CRITICAL PARADOX DETECTED: Logic says connected but QR exists. Forcing qr_pending.")
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

		instanceLock.RLock()
		instance, ok := instances[userID]
		instanceLock.RUnlock()

		if !ok || !instance.Client.IsConnected() {
			return c.Status(404).JSON(fiber.Map{"error": "Instance not connected"})
		}

		jid := types.NewJID(body.To, types.DefaultUserServer)
		// Send message placeholder
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

		apiKey := os.Getenv("RESEND_API_KEY")
		if apiKey == "" {
			apiKey = os.Getenv("VITE_RESEND_API_KEY")
		}

		if apiKey == "" {
			return c.Status(500).JSON(fiber.Map{"error": "Server missing RESEND_API_KEY"})
		}

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

	fmt.Printf("____________________________________________________\n")
	fmt.Printf("🚀 WHATSMEOW SERVER v3.0 (PARADOX_FIX_ACTIVE)\n")
	fmt.Printf("⏰ Build Timestamp: %s\n", time.Now().Format(time.RFC3339))
	fmt.Printf("____________________________________________________\n")
	fmt.Printf("🚀 Server starting on port %s\n", port)
	log.Fatal(app.Listen(":" + port))
}
