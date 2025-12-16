@echo off
REM Payment Collection App - Quick Start Script for Windows

echo Starting Payment Collection App...

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
where docker-compose >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Docker Compose is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Start services
echo Starting Docker containers...
docker-compose up --build -d

REM Wait for services to be ready
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check service status
echo Service Status:
docker-compose ps

echo.
echo Services started successfully!
echo.
echo Access points:
echo    - Backend API: http://localhost:3000
echo    - Frontend Expo: http://localhost:19000
echo    - Database: localhost:5432
echo.
echo View logs: docker-compose logs -f
echo Stop services: docker-compose down
pause

