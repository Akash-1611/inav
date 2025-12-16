# Local Testing Script for Windows PowerShell

Write-Host "🚀 Payment Collection App - Local Testing Setup" -ForegroundColor Green
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Choose an option:" -ForegroundColor Cyan
Write-Host "1. Start everything with Docker (Recommended)" -ForegroundColor White
Write-Host "2. Start only database with Docker, run backend/frontend natively" -ForegroundColor White
Write-Host "3. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🐳 Starting all services with Docker..." -ForegroundColor Cyan
        docker-compose up --build
    }
    "2" {
        Write-Host ""
        Write-Host "📦 Starting database only..." -ForegroundColor Cyan
        docker-compose up db -d
        
        Write-Host ""
        Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        
        Write-Host ""
        Write-Host "🔧 Setting up backend..." -ForegroundColor Cyan
        Set-Location backend
        
        if (-not (Test-Path ".env")) {
            Write-Host "Creating .env file..." -ForegroundColor Yellow
            @"
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=payment_collection
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:19006
"@ | Out-File -FilePath ".env" -Encoding utf8
        }
        
        if (-not (Test-Path "node_modules")) {
            Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
            npm install
        }
        
        Write-Host "Seeding database..." -ForegroundColor Yellow
        npm run seed
        
        Write-Host ""
        Write-Host "✅ Backend setup complete!" -ForegroundColor Green
        Write-Host "Starting backend server..." -ForegroundColor Cyan
        Write-Host "Backend will run on http://localhost:3000" -ForegroundColor White
        Write-Host ""
        
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"
        
        Set-Location ..
        
        Write-Host ""
        Write-Host "🔧 Setting up frontend..." -ForegroundColor Cyan
        Set-Location frontend
        
        if (-not (Test-Path ".env")) {
            Write-Host "Creating .env file..." -ForegroundColor Yellow
            "EXPO_PUBLIC_API_URL=http://localhost:3000/api" | Out-File -FilePath ".env" -Encoding utf8
        }
        
        if (-not (Test-Path "node_modules")) {
            Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
            npm install
        }
        
        Write-Host ""
        Write-Host "✅ Frontend setup complete!" -ForegroundColor Green
        Write-Host "Starting Expo..." -ForegroundColor Cyan
        Write-Host "Frontend will be available at http://localhost:19000" -ForegroundColor White
        Write-Host ""
        
        npm start
        
        Set-Location ..
    }
    "3" {
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "Invalid choice. Exiting..." -ForegroundColor Red
        exit 1
    }
}

