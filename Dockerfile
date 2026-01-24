FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache gcc musl-dev sqlite-dev git

# Copy whatsmeow-server directory
COPY whatsmeow-server/go.mod ./

# Generate go.sum and download dependencies
RUN go mod tidy && go mod download

# Copy source
COPY whatsmeow-server/ ./

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
