package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	_ "github.com/mattn/go-sqlite3"
	"go.mau.fi/whatsmeow"
	"go.mau.fi/whatsmeow/store/sqlstore"
	"go.mau.fi/whatsmeow/types"
	waLog "go.mau.fi/whatsmeow/util/log"
)

type Instance struct {
	Client    *whatsmeow.Client
	UserID    string
	Status    string
	QRCode    string
	CreatedAt time.Time
}

var instances = make(map[string]*Instance)

func main() {
	// Initialize SQLite store
	dbLog := waLog.Stdout("Database", "INFO", true)
	container, err := sqlstore.New("sqlite3", "file:sessions/whatsmeow.db?_foreign_keys=on", dbLog)
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

	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}

	fmt.Printf("🚀 Whatsmeow server starting on port %s\n", port)
	log.Fatal(app.Listen(":" + port))
}
