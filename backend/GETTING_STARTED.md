# Getting Started with RateHawk API Integration

## Quick Start Guide

### 1. Prerequisites

Ensure you have the following installed:
- **Node.js** >= 18.0.0
- **PostgreSQL** >= 12
- **Redis** >= 6
- **npm** or **yarn**

### 2. Installation

```bash
# Install dependencies
npm install
```

### 3. Configuration

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# ETG API Credentials (obtain from your ETG manager)
ETG_KEY_ID=your_key_id_here
ETG_API_KEY=your_api_key_here

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=etgapi
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 4. Database Setup

```bash
# Create the database
createdb etgapi

# Run migrations
npm run db:setup
```

### 5. Start Development Server

```bash
npm run dev
```

The server will start on http://localhost:3000

### 6. Test the API

```bash
# Health check
curl http://localhost:3000/api/v1/health

# Expected response:
# {"status":"ok","timestamp":"2024-11-12T18:00:00.000Z"}
```

## API Endpoints Overview

### Search Endpoints

- `POST /api/v1/search/region` - Search hotels by region
- `POST /api/v1/search/hotels` - Search specific hotels (max 300 IDs)
- `POST /api/v1/search/geo` - Search hotels by geographic location
- `POST /api/v1/search/hotelpage` - Get detailed hotel information
- `POST /api/v1/search/prebook` - Verify rate availability (mandatory before booking)

### Booking Endpoints

- `POST /api/v1/booking` - Create a new booking (handles all 3 steps)
- `GET /api/v1/booking/:orderId` - Get booking details
- `POST /api/v1/booking/:orderId/cancel` - Cancel a booking

### Webhook Endpoint

- `POST /api/v1/webhook/booking-status` - Receive booking status updates from ETG

## Example Requests

### 1. Search Hotels by Region

```bash
curl -X POST http://localhost:3000/api/v1/search/region \
  -H "Content-Type: application/json" \
  -d '{
    "region_id": 6127,
    "checkin": "2024-12-01",
    "checkout": "2024-12-05",
    "residency": "US",
    "language": "en",
    "guests": [{"adults": 2, "children": []}]
  }'
```

### 2. Get Hotel Details

```bash
curl -X POST http://localhost:3000/api/v1/search/hotelpage \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test_hotel",
    "checkin": "2024-12-01",
    "checkout": "2024-12-05",
    "residency": "US",
    "language": "en",
    "guests": [{"adults": 2, "children": []}]
  }'
```

### 3. Prebook Rate (Mandatory)

```bash
curl -X POST http://localhost:3000/api/v1/search/prebook \
  -H "Content-Type: application/json" \
  -d '{
    "hash": "h-abc123...",
    "price_increase_percent": 5
  }'
```

### 4. Create Booking

```bash
curl -X POST http://localhost:3000/api/v1/booking \
  -H "Content-Type: application/json" \
  -d '{
    "book_hash": "p-abc123...",
    "hotel_id": "test_hotel",
    "checkin": "2024-12-01",
    "checkout": "2024-12-05",
    "total_amount": 500.00,
    "currency": "USD",
    "user": {
      "email": "test@example.com",
      "phone": "+1234567890"
    },
    "holder": {
      "name": "John",
      "surname": "Doe"
    },
    "guests": [
      {"name": "John", "surname": "Doe", "is_child": false}
    ],
    "language": "en",
    "payment_type": "deposit"
  }'
```

## Testing with Sandbox

For sandbox testing, use these test hotels:
- `test_hotel_do_not_book`
- `test_hotel`

**Important:** Only use test hotels in sandbox environment. Real hotels should only be used in production.

## Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests with coverage
npm test:coverage

# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

## Project Structure

```
.
├── src/
│   ├── config/           # Configuration and connections
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── repositories/     # Database access
│   ├── middleware/       # Express middleware
│   ├── routes/           # API routes
│   ├── types/            # TypeScript types
│   ├── utils/            # Utilities and validators
│   └── __tests__/        # Test files
├── database/
│   ├── migrations/       # Database migration scripts
│   └── setup.ts          # Database setup script
├── .env.example          # Environment variables template
├── tsconfig.json         # TypeScript configuration
├── jest.config.js        # Jest testing configuration
└── IMPLEMENTATION.md     # Detailed implementation guide
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
pg_isready

# Test connection
psql -h localhost -U postgres -d etgapi
```

### Redis Connection Issues

```bash
# Check if Redis is running
redis-cli ping

# Expected response: PONG
```

### Port Already in Use

If port 3000 is already in use, change the `PORT` in your `.env` file:

```env
PORT=3001
```

## Next Steps

1. **Configure ETG Credentials**: Contact your ETG manager for sandbox and production API keys
2. **IP Whitelisting**: Provide your server IP to ETG for whitelisting
3. **Test in Sandbox**: Use test hotels to verify integration
4. **Implement Static Data Updates**: Set up cron jobs for hotel/region dumps
5. **Prepare for Certification**: Follow the Pre-certification Checklist in IMPLEMENTATION.md

## Support

For issues or questions:
- Check IMPLEMENTATION.md for detailed documentation
- Review the ETG API documentation
- Contact ETG support: [email protected]

## Security Notes

- Never commit `.env` file to version control
- Keep API credentials secure
- Use HTTPS in production
- Implement rate limiting for production use
- Validate webhook signatures in production
