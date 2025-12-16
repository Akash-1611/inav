#!/bin/bash

# Local Testing Script for Linux/Mac

echo "🚀 Payment Collection App - Local Testing Setup"
echo ""

# Check if Docker is running
echo "Checking Docker..."
if ! docker ps &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker."
    exit 1
fi
echo "✅ Docker is running"
echo ""

echo "Choose an option:"
echo "1. Start everything with Docker (Recommended)"
echo "2. Start only database with Docker, run backend/frontend natively"
echo "3. Exit"
echo ""

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🐳 Starting all services with Docker..."
        docker-compose up --build
        ;;
    2)
        echo ""
        echo "📦 Starting database only..."
        docker-compose up db -d
        
        echo ""
        echo "⏳ Waiting for database to be ready..."
        sleep 5
        
        echo ""
        echo "🔧 Setting up backend..."
        cd backend
        
        if [ ! -f .env ]; then
            echo "Creating .env file..."
            cat > .env << EOF
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=payment_collection
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:19006
EOF
        fi
        
        if [ ! -d node_modules ]; then
            echo "Installing backend dependencies..."
            npm install
        fi
        
        echo "Seeding database..."
        npm run seed
        
        echo ""
        echo "✅ Backend setup complete!"
        echo "Starting backend server in new terminal..."
        echo "Backend will run on http://localhost:3000"
        echo ""
        
        # Start backend in background or new terminal
        npm run dev &
        BACKEND_PID=$!
        
        cd ../frontend
        
        if [ ! -f .env ]; then
            echo "Creating .env file..."
            echo "EXPO_PUBLIC_API_URL=http://localhost:3000/api" > .env
        fi
        
        if [ ! -d node_modules ]; then
            echo "Installing frontend dependencies..."
            npm install
        fi
        
        echo ""
        echo "✅ Frontend setup complete!"
        echo "Starting Expo..."
        echo "Frontend will be available at http://localhost:19000"
        echo ""
        
        npm start
        
        # Cleanup on exit
        trap "kill $BACKEND_PID" EXIT
        ;;
    3)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid choice. Exiting..."
        exit 1
        ;;
esac

