# RateHawk API Integration - Implementation Guide

## Overview

This is a production-ready Node.js/TypeScript API server that integrates with the Emerging Travel Group (ETG) API v3 (RateHawk API) for comprehensive hotel booking solutions.

## Features Implemented

### ✅ Core Functionality

- **3-Step Search Workflow**
  - Step 1: Initial search (by region, hotel IDs, or geo-location)
  - Step 2: Hotel details (hotelpage) with 1-hour caching
  - Step 3: Rate verification (mandatory prebook)

- **3-Step Booking Workflow**
  - Step 1: Create booking form with retry logic
  - Step 2: Finish booking initiation
  - Step 3: Status polling (1-second intervals) with webhook support

- **Post-Booking Operations**
  - Order information retrieval
  - Booking cancellation with retry logic

### ✅ Technical Components

- **Authentication**: HTTP Basic Auth with secure credential management
- **Retry Logic**: Endpoint-specific retry strategies per ETG guidelines
- **Error Handling**: Distinguishes retryable vs terminal errors
- **Validation**: Comprehensive request validation with Zod schemas
- **Caching**: Redis-based caching for hotelpage (1 hour TTL)
- **Logging**: Winston-based structured logging for certification
- **Database**: PostgreSQL with proper indexing for bookings and logs

## Architecture

```
src/
├── config/           # Configuration and connection management
├── controllers/      # Request handlers
├── services/         # Business logic
├── repositories/     # Database access layer
├── middleware/       # Express middleware
├── routes/           # API route definitions
├── types/            # TypeScript type definitions
└── utils/            # Utility functions and validators
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 12
- Redis >= 6

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure your `.env` file with:
   - ETG API credentials (KEY_ID and API_KEY)
   - Database connection details
   - Redis connection details

4. Set up the database:
```bash
npm run db:setup
```

5. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Search Endpoints

#### Search by Region
```http
POST /api/v1/search/region
Content-Type: application/json

{
  "region_id": 123,
  "checkin": "2024-12-01",
  "checkout": "2024-12-05",
  "residency": "US",
  "language": "en",
  "guests": [
    {
      "adults": 2,
      "children": [7]
    }
  ]
}
```

#### Search by Hotel IDs
```http
POST /api/v1/search/hotels
Content-Type: application/json

{
  "ids": ["hotel_123", "hotel_456"],
  "checkin": "2024-12-01",
  "checkout": "2024-12-05",
  "residency": "US",
  "language": "en",
  "guests": [{"adults": 2, "children": []}]
}
```

#### Search by Geo Location
```http
POST /api/v1/search/geo
Content-Type: application/json

{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "radius": 5000,
  "checkin": "2024-12-01",
  "checkout": "2024-12-05",
  "residency": "US",
  "language": "en",
  "guests": [{"adults": 2, "children": []}]
}
```

#### Get Hotel Details
```http
POST /api/v1/search/hotelpage
Content-Type: application/json

{
  "id": "hotel_123",
  "checkin": "2024-12-01",
  "checkout": "2024-12-05",
  "residency": "US",
  "language": "en",
  "guests": [{"adults": 2, "children": []}]
}
```

#### Prebook Rate (Mandatory)
```http
POST /api/v1/search/prebook
Content-Type: application/json

{
  "hash": "h-abc123...",
  "price_increase_percent": 5
}
```

### Booking Endpoints

#### Create Booking
```http
POST /api/v1/booking
Content-Type: application/json

{
  "book_hash": "p-abc123...",
  "hotel_id": "hotel_123",
  "checkin": "2024-12-01",
  "checkout": "2024-12-05",
  "total_amount": 500.00,
  "currency": "USD",
  "user": {
    "email": "customer@example.com",
    "phone": "+1234567890"
  },
  "holder": {
    "name": "John",
    "surname": "Doe"
  },
  "guests": [
    {
      "name": "John",
      "surname": "Doe",
      "is_child": false
    }
  ],
  "language": "en",
  "payment_type": "deposit"
}
```

#### Get Booking
```http
GET /api/v1/booking/{orderId}
```

#### Cancel Booking
```http
POST /api/v1/booking/{orderId}/cancel
```

### Webhook Endpoint

```http
POST /api/v1/webhook/booking-status
Content-Type: application/json

{
  "partner_order_id": "ETG-123456-abc",
  "order_id": "etg_order_123",
  "status": "confirmed"
}
```

## Key Implementation Details

### Hash Transformation Tracking
- Hotelpage returns: `book_hash: "h-..."`
- Prebook accepts: `book_hash: "h-..."` as input
- Prebook returns: `book_hash: "p-..."` for booking

### Retry Logic
- **Booking Form**: Retry on `timeout`, `unknown`, 5xx errors
- **Booking Finish**: Retry on `timeout`, `unknown`, `booking_form_expired`
- **Status Polling**: Continue on `processing`, `timeout`, `unknown`
- **Cancellation**: Retry once on `timeout`

### Validation Rules
- Max 30 nights per stay
- Check-in within 730 days
- Max 6 adults per room
- Max 4 children (≤17 years) per room
- Max 9 rooms per booking
- Max 300 hotel IDs per search

### Caching Strategy
- Hotelpage: 1 hour TTL (configurable)
- Search results: Optional caching
- Prebook: **NO CACHING** (critical)

## Testing

### Run Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm test:coverage
```

### Sandbox Testing
Use test hotels for sandbox testing:
- `test_hotel_do_not_book`
- `test_hotel`

## Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

## Certification Requirements

### Pre-Certification Checklist
- [x] All required endpoints implemented
- [x] Prebook step implemented (mandatory)
- [x] Error handling follows ETG guidelines
- [x] Retry logic implemented per endpoint
- [x] Status polling implemented
- [x] Webhook support implemented
- [x] Comprehensive logging for API calls
- [x] Database schema with audit trails

### Required Documentation
1. API documentation (this file + OpenAPI spec)
2. Booking logs (stored in `booking_logs` table)
3. Workflow diagram
4. Test results from sandbox

### Logging for Certification
All API interactions are logged to:
- File logs: `logs/combined.log` and `logs/error.log`
- Database: `booking_logs` table with full request/response

Export logs for certification:
```sql
SELECT * FROM booking_logs 
WHERE created_at >= '2024-01-01' 
ORDER BY created_at DESC;
```

## Security Considerations

- API credentials stored in environment variables
- IP whitelisting required (configure with ETG)
- Rate limiting headers monitored
- HTTPS required for production
- Webhook secret validation recommended

## Monitoring

- Health check endpoint: `GET /api/v1/health`
- Structured logging with Winston
- Request/response logging for debugging
- Error tracking with stack traces

## Support

For ETG API issues:
- Technical: [email protected]
- Support: [email protected]

## License

ISC
