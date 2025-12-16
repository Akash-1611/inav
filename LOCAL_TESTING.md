# Local Testing Guide

This guide will help you test the frontend and backend locally.

## Option 1: Using Docker (Recommended - Easiest)

This is the simplest way to test everything locally.

### Prerequisites
- Docker Desktop installed and running
- Docker Compose installed

### Steps

1. **Start all services:**
   ```bash
   docker-compose up --build
   ```

2. **Wait for services to start** (first time may take a few minutes)

3. **Verify services are running:**
   ```bash
   docker-compose ps
   ```

4. **Check logs if needed:**
   ```bash
   docker-compose logs -f
   ```

5. **Access the services:**
   - **Backend API:** http://localhost:3000
   - **Frontend Expo:** http://localhost:19000
   - **Database:** localhost:5432

6. **Test Backend API:**
   ```bash
   # Health check
   curl http://localhost:3000/health

   # Get all customers
   curl http://localhost:3000/api/customers

   # Create a payment
   curl -X POST http://localhost:3000/api/payments \
     -H "Content-Type: application/json" \
     -d "{\"account_number\": \"ACC001\", \"payment_amount\": 15000}"

   # Get payment history
   curl http://localhost:3000/api/payments/ACC001
   ```

7. **Test Frontend:**
   - Open http://localhost:19000 in your browser
   - Scan QR code with Expo Go app on your phone
   - Or press `i` for iOS simulator / `a` for Android emulator

8. **Stop services:**
   ```bash
   docker-compose down
   ```

---

## Option 2: Native Local Development (More Control)

This option runs backend and frontend natively on your machine, with database in Docker.

### Step 1: Start Database with Docker

```bash
# Start only the database
docker-compose up db -d

# Or manually:
docker run -d \
  --name payment_db \
  -e POSTGRES_DB=payment_collection \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine
```

### Step 2: Set Up Backend

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   # Create .env file
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
   ```

4. **Seed the database:**
   ```bash
   npm run seed
   ```

5. **Start the backend server:**
   ```bash
   npm run dev
   ```

   Backend will run on http://localhost:3000

6. **Test backend in another terminal:**
   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3000/api/customers
   ```

### Step 3: Set Up Frontend

1. **Open a new terminal and navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   # Create .env file
   echo "EXPO_PUBLIC_API_URL=http://localhost:3000/api" > .env
   ```

   **Important for physical devices:** If testing on a physical device, replace `localhost` with your computer's IP address:
   ```bash
   # Find your IP address:
   # Windows: ipconfig
   # Mac/Linux: ifconfig or ip addr
   
   # Then set:
   echo "EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:3000/api" > .env
   ```

4. **Start Expo:**
   ```bash
   npm start
   ```

5. **Run on device:**
   - **iOS Simulator:** Press `i`
   - **Android Emulator:** Press `a`
   - **Physical Device:** Scan QR code with Expo Go app
   - **Web Browser:** Press `w` (limited functionality)

---

## Testing Checklist

### Backend Testing

- [ ] Health check endpoint works: `GET /health`
- [ ] Get all customers: `GET /api/customers`
- [ ] Create payment: `POST /api/payments`
- [ ] Get payment history: `GET /api/payments/:account_number`
- [ ] Error handling (invalid account number, etc.)

### Frontend Testing

- [ ] App loads without errors
- [ ] Customer list displays correctly
- [ ] Loan details show all fields
- [ ] Payment form accepts input
- [ ] Payment submission works
- [ ] Payment confirmation appears
- [ ] Payment history displays correctly
- [ ] Navigation between screens works
- [ ] Pull-to-refresh works

### Integration Testing

- [ ] Frontend can fetch customers from backend
- [ ] Frontend can submit payments
- [ ] Frontend can fetch payment history
- [ ] Error messages display correctly
- [ ] Loading states work properly

---

## Common Issues and Solutions

### Issue: Backend can't connect to database

**Solution:**
```bash
# Check if database is running
docker ps

# Check database logs
docker logs payment_collection_db

# Restart database
docker-compose restart db
```

### Issue: Frontend can't connect to backend

**Solution:**
1. Verify backend is running: `curl http://localhost:3000/health`
2. Check `EXPO_PUBLIC_API_URL` in frontend `.env`
3. For physical devices, use your computer's IP instead of localhost
4. Check CORS settings in backend

### Issue: Port already in use

**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

### Issue: Database seed fails

**Solution:**
```bash
# Drop and recreate database
docker-compose down -v
docker-compose up db -d
cd backend
npm run seed
```

### Issue: Expo can't find module

**Solution:**
```bash
cd frontend
rm -rf node_modules
npm install
```

### Issue: Backend dependencies missing

**Solution:**
```bash
cd backend
rm -rf node_modules
npm install
```

---

## Quick Test Commands

### Test Backend API

```bash
# Health check
curl http://localhost:3000/health

# Get all customers
curl http://localhost:3000/api/customers | json_pp

# Create payment
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{"account_number": "ACC001", "payment_amount": 15000}' | json_pp

# Get payment history
curl http://localhost:3000/api/payments/ACC001 | json_pp
```

### Test Database

```bash
# Connect to database
docker exec -it payment_collection_db psql -U postgres -d payment_collection

# Run SQL queries
SELECT * FROM customers;
SELECT * FROM payments;
```

---

## Development Tips

1. **Backend Hot Reload:** Use `npm run dev` (nodemon) for auto-restart
2. **Frontend Hot Reload:** Expo automatically reloads on save
3. **Database Changes:** Restart backend after schema changes
4. **Clear Cache:** 
   - Frontend: `expo start -c`
   - Backend: Restart server

---

## Next Steps

Once local testing is successful:
1. Test all features thoroughly
2. Check error scenarios
3. Test on different devices/simulators
4. Review the code
5. Prepare for deployment

