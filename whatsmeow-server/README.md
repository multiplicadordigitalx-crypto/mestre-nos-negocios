# Whatsmeow Multi-Tenant Server

WhatsApp integration server built with Go and Whatsmeow library.

## Features
- 🔐 Multi-tenant (multiple WhatsApp instances per server)
- 📱 QR Code authentication
- 💬 Send/receive messages
- 🔄 Session persistence with SQLite
- 🚀 Docker ready
- 🔒 API Key authentication

## Quick Start

### Local Development
```bash
cd whatsmeow-server
go mod download
go run main.go
```

### Environment Variables
```
WHATSMEOW_API_KEY=your-secret-key
PORT=3001
```

### Docker Build
```bash
docker build -t whatsmeow-server .
docker run -p 3001:3001 -e WHATSMEOW_API_KEY=your-key whatsmeow-server
```

## API Endpoints

### Health Check
```bash
GET /health
```

### Create Instance
```bash
POST /api/instances/create
{
  "userId": "user123"
}
```

### Get Status
```bash
GET /api/instances/:userId/status
```

### Send Message
```bash
POST /api/instances/:userId/send
{
  "to": "5511999999999",
  "message": "Hello!"
}
```

### Disconnect
```bash
POST /api/instances/:userId/disconnect
```

## Deploy to Render

1. Push to GitHub
2. Connect repository in Render
3. Render will auto-detect `render.yaml`
4. Set `WHATSMEOW_API_KEY` in dashboard
5. Deploy!

## Architecture

```
Frontend (Vercel)
    ↓
API Proxy (/api/whatsapp/proxy)
    ↓
Cloudflare Tunnel
    ↓
Whatsmeow Server (Render)
    ↓
WhatsApp
```

## License
MIT
