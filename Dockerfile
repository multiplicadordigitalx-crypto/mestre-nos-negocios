FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache gcc musl-dev sqlite-dev git

# Copy entire whatsmeow-server directory
COPY whatsmeow-server/ ./

# Fetch latest whatsmeow and generate dependencies
# Let Go automatically resolve to the latest working version
RUN go get -u go.mau.fi/whatsmeow@latest && \
    go mod tidy && \
    go mod download && \
    go mod verify

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
