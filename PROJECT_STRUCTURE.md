# Project Structure

Complete overview of the Payment Collection App project structure.

## Directory Structure

```
nav/
├── backend/                          # Node.js/Express Backend
│   ├── config/
│   │   └── database.js              # Database configuration (PostgreSQL/MySQL)
│   ├── controllers/
│   │   ├── customerController.js    # Customer API controllers
│   │   └── paymentController.js     # Payment API controllers
│   ├── models/
│   │   ├── Customer.js              # Customer data model
│   │   └── Payment.js               # Payment data model
│   ├── routes/
│   │   ├── customerRoutes.js        # Customer API routes
│   │   └── paymentRoutes.js         # Payment API routes
│   ├── .dockerignore                # Docker ignore file
│   ├── .env.example                 # Environment variables template
│   ├── .gitignore                   # Git ignore file
│   ├── Dockerfile                   # Backend Docker image
│   ├── package.json                 # Backend dependencies
│   ├── seed.js                      # Database seeding script
│   └── server.js                    # Express server entry point
│
├── frontend/                         # React Native Expo Frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── LoanCard.js          # Reusable loan card component
│   │   ├── screens/
│   │   │   ├── HomeScreen.js        # Main screen with loan list
│   │   │   ├── PaymentScreen.js     # Payment form screen
│   │   │   └── PaymentHistoryScreen.js  # Payment history screen
│   │   ├── services/
│   │   │   ├── customerService.js   # Customer API service
│   │   │   └── paymentService.js    # Payment API service
│   │   ├── config/
│   │   │   └── api.js               # Axios API configuration
│   │   └── theme.js                 # App theme configuration
│   ├── assets/                      # App assets (icons, images)
│   ├── .dockerignore                # Docker ignore file
│   ├── .gitignore                   # Git ignore file
│   ├── App.js                       # Main app component
│   ├── app.json                     # Expo configuration
│   ├── babel.config.js              # Babel configuration
│   ├── Dockerfile                   # Frontend Docker image
│   └── package.json                 # Frontend dependencies
│
├── .github/
│   └── workflows/
│       └── deploy.yml                # GitHub Actions CI/CD pipeline
│
├── .dockerignore                    # Root Docker ignore
├── .gitignore                       # Root Git ignore
├── docker-compose.yml               # Docker Compose configuration
├── README.md                        # Main project documentation
├── SETUP.md                         # Setup instructions
├── DEPLOYMENT.md                    # Deployment guide
├── PROJECT_STRUCTURE.md             # This file
├── start.sh                         # Quick start script (Linux/Mac)
└── start.bat                        # Quick start script (Windows)
```

## Backend Architecture

### API Endpoints

- `GET /api/customers` - Retrieve all customers with loan details
- `POST /api/payments` - Create a new payment
- `GET /api/payments/:account_number` - Get payment history for an account
- `GET /health` - Health check endpoint

### Database Models

**Customer Model:**
- `id` - Primary key
- `account_number` - Unique account identifier
- `issue_date` - Loan issue date
- `interest_rate` - Interest rate percentage
- `tenure` - Loan tenure in months
- `emi_due` - EMI amount due
- `created_at` - Record creation timestamp
- `updated_at` - Record update timestamp

**Payment Model:**
- `id` - Primary key
- `customer_id` - Foreign key to customers table
- `payment_date` - Payment transaction date
- `payment_amount` - Payment amount
- `status` - Payment status (completed, pending, etc.)
- `created_at` - Record creation timestamp

### Database Support

The backend supports both PostgreSQL and MySQL. Database type is configured via `DB_TYPE` environment variable.

## Frontend Architecture

### Navigation Structure

- **HomeScreen** - Displays list of all customers with loan details
- **PaymentScreen** - Form to submit EMI payments
- **PaymentHistoryScreen** - Shows payment history for a specific account

### Key Features

- React Navigation for screen navigation
- React Native Paper for UI components
- Axios for API calls
- Date formatting with date-fns
- Pull-to-refresh functionality
- Error handling and validation
- Responsive design

## Docker Configuration

### Services

1. **db** - PostgreSQL database container
2. **backend** - Node.js/Express API server
3. **frontend** - React Native Expo development server

### Volumes

- `postgres_data` - Persistent database storage

### Networks

- `payment_network` - Bridge network for service communication

## Environment Variables

### Backend (.env)

```env
DB_TYPE=postgres              # Database type: postgres or mysql
DB_HOST=localhost             # Database host
DB_PORT=5432                  # Database port
DB_NAME=payment_collection    # Database name
DB_USER=postgres              # Database user
DB_PASSWORD=postgres          # Database password
PORT=3000                     # Backend server port
NODE_ENV=development         # Environment mode
FRONTEND_URL=*                # CORS allowed origin
```

### Frontend (.env)

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

## Dependencies

### Backend

- **express** - Web framework
- **pg** - PostgreSQL client
- **mysql2** - MySQL client
- **dotenv** - Environment variables
- **cors** - CORS middleware
- **body-parser** - Request body parsing

### Frontend

- **expo** - Expo framework
- **react** - React library
- **react-native** - React Native framework
- **@react-navigation/native** - Navigation library
- **@react-navigation/stack** - Stack navigator
- **axios** - HTTP client
- **react-native-paper** - UI component library
- **date-fns** - Date formatting library

## Development Workflow

1. **Local Development:**
   - Run `docker-compose up` to start all services
   - Backend auto-reloads with nodemon
   - Frontend hot-reloads with Expo

2. **Database Seeding:**
   - Run `npm run seed` in backend directory
   - Or use Docker: `docker-compose exec backend npm run seed`

3. **Testing:**
   - Test API endpoints with curl or Postman
   - Test frontend with Expo Go app or emulator

4. **Deployment:**
   - Push to GitHub triggers CI/CD pipeline
   - Or manually deploy to EC2 using deployment guide

## File Naming Conventions

- **Components:** PascalCase (e.g., `LoanCard.js`)
- **Services:** camelCase (e.g., `customerService.js`)
- **Controllers:** camelCase (e.g., `customerController.js`)
- **Models:** PascalCase (e.g., `Customer.js`)
- **Routes:** camelCase (e.g., `customerRoutes.js`)
- **Config:** camelCase (e.g., `database.js`)

## Code Organization Principles

1. **Separation of Concerns:**
   - Models handle database operations
   - Controllers handle request/response logic
   - Routes define API endpoints
   - Services handle API calls in frontend

2. **Error Handling:**
   - Try-catch blocks in async functions
   - Proper error responses with status codes
   - User-friendly error messages

3. **Code Reusability:**
   - Reusable components (LoanCard)
   - Centralized API configuration
   - Shared theme configuration

4. **Security:**
   - Environment variables for sensitive data
   - Input validation
   - CORS configuration
   - SQL injection prevention (parameterized queries)

## Testing Strategy

### Backend Testing
- API endpoint testing with curl/Postman
- Database query testing
- Error scenario testing

### Frontend Testing
- Component rendering
- Navigation flow
- API integration
- Form validation

## Future Enhancements

Potential improvements:
- Unit and integration tests
- Authentication and authorization
- Payment gateway integration
- Push notifications
- Offline support
- Analytics and reporting
- Admin dashboard
- Multi-language support

