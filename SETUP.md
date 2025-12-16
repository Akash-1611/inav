# Setup Guide

This guide provides step-by-step instructions for setting up the Payment Collection App.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Docker** and **Docker Compose** - [Download](https://www.docker.com/get-started)
- **Git** - [Download](https://git-scm.com/)
- **Expo Go App** (for mobile testing) - [iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)

## Option 1: Docker Setup (Recommended)

This is the easiest way to get started as it handles all dependencies automatically.

### Steps:

1. **Clone or navigate to the project directory:**
   ```bash
   cd nav
   ```

2. **Start all services:**
   ```bash
   docker-compose up --build
   ```

   This command will:
   - Pull PostgreSQL image
   - Build backend and frontend containers
   - Start database, backend, and frontend services
   - Automatically seed the database

3. **Wait for services to be ready:**
   - Backend: http://localhost:3000
   - Frontend Expo: http://localhost:19000
   - Database: localhost:5432

4. **Access the application:**
   - Open Expo DevTools in your browser (http://localhost:19000)
   - Scan QR code with Expo Go app on your phone
   - Or use an emulator/simulator

5. **Stop services:**
   ```bash
   docker-compose down
   ```

6. **View logs:**
   ```bash
   docker-compose logs -f
   ```

## Option 2: Local Development Setup

### Backend Setup

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment:**
   ```bash
   # Create .env file (copy from .env.example if needed)
   # Edit .env with your database credentials
   ```

4. **Start PostgreSQL (using Docker):**
   ```bash
   docker run -d \
     --name payment_db \
     -e POSTGRES_DB=payment_collection \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres \
     -p 5432:5432 \
     postgres:15-alpine
   ```

5. **Seed the database:**
   ```bash
   npm run seed
   ```

6. **Start the server:**
   ```bash
   npm run dev
   ```

   Server will run on http://localhost:3000

### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment:**
   ```bash
   # Create .env file
   echo "EXPO_PUBLIC_API_URL=http://localhost:3000/api" > .env
   ```

4. **Start Expo:**
   ```bash
   npm start
   ```

5. **Run on device:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app

## Testing the Setup

### Test Backend API

1. **Health check:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Get all customers:**
   ```bash
   curl http://localhost:3000/api/customers
   ```

3. **Create a payment:**
   ```bash
   curl -X POST http://localhost:3000/api/payments \
     -H "Content-Type: application/json" \
     -d '{"account_number": "ACC001", "payment_amount": 15000}'
   ```

4. **Get payment history:**
   ```bash
   curl http://localhost:3000/api/payments/ACC001
   ```

### Test Frontend

1. Open the app in Expo Go
2. You should see a list of customers with loan details
3. Tap "Make Payment" to test payment flow
4. Tap "History" to view payment history

## Common Issues and Solutions

### Issue: Database connection failed

**Solution:**
- Check if PostgreSQL is running: `docker ps`
- Verify database credentials in `.env`
- Ensure database container is healthy: `docker-compose ps`

### Issue: Frontend can't connect to backend

**Solution:**
- Check `EXPO_PUBLIC_API_URL` in frontend `.env`
- Ensure backend is running on port 3000
- For physical device, use your computer's IP address instead of localhost
  - Example: `EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api`

### Issue: Port already in use

**Solution:**
- Change ports in `docker-compose.yml` or `.env`
- Kill process using the port:
  - Windows: `netstat -ano | findstr :3000` then `taskkill /PID <pid> /F`
  - Mac/Linux: `lsof -ti:3000 | xargs kill`

### Issue: Docker build fails

**Solution:**
- Ensure Docker is running
- Clear Docker cache: `docker system prune -a`
- Rebuild: `docker-compose build --no-cache`

## Next Steps

- Review the [README.md](./README.md) for detailed documentation
- Check API endpoints in the README
- Customize the app for your needs
- Set up CI/CD pipeline (see GitHub Actions workflow)

## Support

For issues or questions, refer to:
- [Expo Documentation](https://docs.expo.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

