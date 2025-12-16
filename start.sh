#!/bin/bash

# Payment Collection App - Quick Start Script

echo "🚀 Starting Payment Collection App..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Start services
echo "📦 Starting Docker containers..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ Services started successfully!"
echo ""
echo "📍 Access points:"
echo "   - Backend API: http://localhost:3000"
echo "   - Frontend Expo: http://localhost:19000"
echo "   - Database: localhost:5432"
echo ""
echo "📝 View logs: docker-compose logs -f"
echo "🛑 Stop services: docker-compose down"

