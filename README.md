# Payment Collection App

A production-ready mobile application for collecting payments from customers with personal loans. Built with React Native (Expo) for the frontend and Node.js/Express for the backend, with PostgreSQL database support.

## Features

### Frontend
- Display loan details for all customers (Account Number, Issue Date, Interest Rate, Tenure, EMI Due)
- Payment form to submit EMI payments
- Payment history view for each account
- Responsive and modern UI with React Native Paper
- Pull-to-refresh functionality

### Backend
- RESTful API with Express.js
- PostgreSQL database with optimized schema
- Support for both PostgreSQL and MySQL
- Comprehensive error handling
- CORS enabled for frontend integration

## Project Structure

```
nav/
├── backend/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── controllers/
│   │   ├── customerController.js
│   │   └── paymentController.js
│   ├── models/
│   │   ├── Customer.js
│   │   └── Payment.js
│   ├── routes/
│   │   ├── customerRoutes.js
│   │   └── paymentRoutes.js
│   ├── server.js                # Express server
│   ├── seed.js                  # Database seeding script
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── LoanCard.js
│   │   ├── screens/
│   │   │   ├── HomeScreen.js
│   │   │   ├── PaymentScreen.js
│   │   │   └── PaymentHistoryScreen.js
│   │   ├── services/
│   │   │   ├── customerService.js
│   │   │   └── paymentService.js
│   │   ├── config/
│   │   │   └── api.js
│   │   └── theme.js
│   ├── App.js
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- Expo CLI (for local frontend development)
- PostgreSQL (if running without Docker)

## Quick Start with Docker

1. **Clone the repository** (if applicable)

2. **Start all services with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

   This will:
   - Start PostgreSQL database
   - Build and start the backend server
   - Seed the database with sample data
   - Build and start the frontend (Expo)

3. **Access the services:**
   - Backend API: http://localhost:3000
   - Frontend: http://localhost:19000 (Expo DevTools)
   - Database: localhost:5432

## Local Development Setup

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials.

4. **Start PostgreSQL database** (if not using Docker):
   ```bash
   # Using Docker for database only
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

6. **Start the backend server:**
   ```bash
   npm run dev
   ```

   The backend will be available at http://localhost:3000

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API URL:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set `EXPO_PUBLIC_API_URL` to your backend URL.

4. **Start the Expo development server:**
   ```bash
   npm start
   ```

5. **Run on your device:**
   - Scan the QR code with Expo Go app (iOS/Android)
   - Or press `i` for iOS simulator, `a` for Android emulator

## API Endpoints

### Customers
- `GET /api/customers` - Get all customers with loan details

### Payments
- `POST /api/payments` - Create a new payment
  ```json
  {
    "account_number": "ACC001",
    "payment_amount": 15000.00
  }
  ```

- `GET /api/payments/:account_number` - Get payment history for an account

### Health Check
- `GET /health` - Server health check

## Database Schema

### Customers Table
- `id` (Primary Key)
- `account_number` (Unique)
- `issue_date` (Date)
- `interest_rate` (Decimal)
- `tenure` (Integer - months)
- `emi_due` (Decimal)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Payments Table
- `id` (Primary Key)
- `customer_id` (Foreign Key)
- `payment_date` (Timestamp)
- `payment_amount` (Decimal)
- `status` (Varchar)
- `created_at` (Timestamp)

## Environment Variables

### Backend (.env)
```env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=payment_collection
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:19006
```

### Frontend (.env)
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

## Deployment to AWS EC2

### Prerequisites
- AWS EC2 instance with Docker installed
- Security groups configured to allow:
  - Port 3000 (Backend API)
  - Port 19000-19002 (Expo)
  - Port 5432 (PostgreSQL - if external)

### Steps

1. **SSH into your EC2 instance:**
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-ip
   ```

2. **Install Docker and Docker Compose:**
   ```bash
   sudo yum update -y
   sudo yum install docker -y
   sudo service docker start
   sudo usermod -a -G docker ec2-user
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Clone or upload your project:**
   ```bash
   git clone <your-repo-url>
   cd nav
   ```

4. **Update environment variables:**
   - Edit `docker-compose.yml` or create `.env` files
   - Update `EXPO_PUBLIC_API_URL` in frontend to use EC2 public IP

5. **Start services:**
   ```bash
   docker-compose up -d --build
   ```

6. **Check logs:**
   ```bash
   docker-compose logs -f
   ```

### Using GitHub Actions for CI/CD

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS EC2

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /path/to/nav
            git pull
            docker-compose down
            docker-compose up -d --build
```

## Testing

### Test Backend API
```bash
# Get all customers
curl http://localhost:3000/api/customers

# Create payment
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{"account_number": "ACC001", "payment_amount": 15000}'

# Get payment history
curl http://localhost:3000/api/payments/ACC001
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify network connectivity in Docker

### Frontend Not Connecting to Backend
- Check `EXPO_PUBLIC_API_URL` in frontend `.env`
- Ensure backend is running and accessible
- Check CORS settings in backend

### Docker Issues
- Ensure Docker and Docker Compose are installed
- Check container logs: `docker-compose logs`
- Restart services: `docker-compose restart`

## License

ISC

## Author

Built for iNav Technologies Pvt. Ltd.

