FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache gcc musl-dev sqlite-dev git

# Copy entire whatsmeow-server directory
COPY whatsmeow-server/ ./

# Generate go.sum and download dependencies
# (Now it has main.go to analyze which packages are needed)
RUN go mod tidy && go mod download && go mod verify

# Build
RUN CGO_ENABLED=1 GOOS=linux go build -ldflags="-s -w" -o whatsmeow-server .

# Runtime image
FROM alpine:latest

RUN apk add --no-cache ca-certificates sqlite-libs

WORKDIR /root/

COPY --from=builder /app/whatsmeow-server .

# Create sessions directory
RUN mkdir -p sessions

EXPOSE 3001

CMD ["./whatsmeow-server"]
