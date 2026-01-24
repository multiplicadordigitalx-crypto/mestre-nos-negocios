package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	_ "github.com/mattn/go-sqlite3"
	"go.mau.fi/whatsmeow"
	waProto "go.mau.fi/whatsmeow/binary/proto"
	"go.mau.fi/whatsmeow/store/sqlstore"
	"go.mau.fi/whatsmeow/types"
	waLog "go.mau.fi/whatsmeow/util/log"
	"google.golang.org/protobuf/proto"
)

type Instance struct {
	Client    *whatsmeow.Client
	UserID    string
	Status    string
	QRCode    string
	CreatedAt time.Time
}

var instances = make(map[string]*Instance)
var container *sqlstore.Container

func main() {
	// Initialize SQLite store
	dbLog := waLog.Stdout("Database", "INFO", true)
	container, err := sqlstore.New("sqlite3", "file:sessions/whatsmeow.db?_foreign_keys=on", dbLog)
	if err != nil {
		panic(err)
	}

	app := fiber.New(fiber.Config{
		BodyLimit: 10 * 1024 * 1024, // 10MB
	})

	// Middleware
	app.Use(cors.New())
	app.Use(logger.New())

	// Auth middleware
	app.Use(func(c *fiber.Ctx) error {
		apiKey := c.Get("Authorization")
		expectedKey := "Bearer " + os.Getenv("WHATSMEOW_API_KEY")
		
		if apiKey != expectedKey {
			return c.Status(401).JSON(fiber.Map{
				"error": "Unauthorized",
			})
		}
		return c.Next()
	})

	// Routes
	app.Get("/health", healthCheck)
	app.Post("/api/instances/create", createInstance)
	app.Get("/api/instances/:userId/status", getInstanceStatus)
	app.Post("/api/instances/:userId/send", sendMessage)
	app.Post("/api/instances/:userId/disconnect", disconnectInstance)
	app.Get("/api/instances", listInstances)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}

	log.Printf("🚀 Whatsmeow server starting on port %s", port)
	log.Fatal(app.Listen(":" + port))
}

func healthCheck(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"status":    "healthy",
		"instances": len(instances),
		"timestamp": time.Now().Unix(),
	})
}

func createInstance(c *fiber.Ctx) error {
	var body struct {
		UserID string `json:"userId"`
	}

	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Check if instance already exists
	if existing, ok := instances[body.UserID]; ok {
		if existing.Client.IsConnected() {
			return c.JSON(fiber.Map{
				"instanceId": body.UserID,
				"status":     "already_connected",
			})
		}
		// Cleanup old instance
		existing.Client.Disconnect()
		delete(instances, body.UserID)
	}

	// Create new device store
	deviceStore := container.NewDevice()
	clientLog := waLog.Stdout("Client", "INFO", true)
	client := whatsmeow.NewClient(deviceStore, clientLog)

	// Generate QR Code
	qrChan, err := client.GetQRChannel(context.Background())
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get QR channel"})
	}

	err = client.Connect()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to connect"})
	}

	// Wait for QR code
	var qrCode string
	select {
	case evt := <-qrChan:
		if evt.Event == "code" {
			qrCode = evt.Code
		}
	case <-time.After(30 * time.Second):
		return c.Status(408).JSON(fiber.Map{"error": "QR code timeout"})
	}

	// Store instance
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
				log.Printf("✅ Instance %s connected", body.UserID)
				break
			}
		}
	}()

	return c.JSON(fiber.Map{
		"instanceId": body.UserID,
		"qrCode":     qrCode,
		"status":     "qr_pending",
	})
}

func getInstanceStatus(c *fiber.Ctx) error {
	userID := c.Params("userId")
	instance, ok := instances[userID]

	if !ok {
		return c.Status(404).JSON(fiber.Map{
			"status": "not_found",
		})
	}

	connected := instance.Client.IsConnected()
	status := "disconnected"
	if connected {
		status = "connected"
	} else if instance.QRCode != "" {
		status = "qr_pending"
	}

	return c.JSON(fiber.Map{
		"status":    status,
		"qrCode":    instance.QRCode,
		"createdAt": instance.CreatedAt.Unix(),
	})
}

func sendMessage(c *fiber.Ctx) error {
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

	// Format phone number
	jid := types.NewJID(body.To, types.DefaultUserServer)

	// Send message
	_, err := instance.Client.SendMessage(context.Background(), jid, &waProto.Message{
		Conversation: proto.String(body.Message),
	})

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"to":      body.To,
	})
}

func disconnectInstance(c *fiber.Ctx) error {
	userID := c.Params("userId")
	instance, ok := instances[userID]

	if !ok {
		return c.Status(404).JSON(fiber.Map{"error": "Instance not found"})
	}

	instance.Client.Disconnect()
	delete(instances, userID)

	return c.JSON(fiber.Map{"success": true})
}

func listInstances(c *fiber.Ctx) error {
	list := make([]fiber.Map, 0)

	for userID, instance := range instances {
		list = append(list, fiber.Map{
			"userId":    userID,
			"status":    instance.Status,
			"connected": instance.Client.IsConnected(),
			"createdAt": instance.CreatedAt.Unix(),
		})
	}

	return c.JSON(fiber.Map{
		"instances": list,
		"total":     len(instances),
	})
}
