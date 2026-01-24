FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache gcc musl-dev sqlite-dev

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY . .

# Build
RUN CGO_ENABLED=1 GOOS=linux go build -o whatsmeow-server .

# Runtime image
FROM alpine:latest

RUN apk add --no-cache ca-certificates sqlite-libs

WORKDIR /root/

COPY --from=builder /app/whatsmeow-server .

# Create sessions directory
RUN mkdir -p sessions

EXPOSE 3001

CMD ["./whatsmeow-server"]
