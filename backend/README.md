# ETG API - Backend

Production-ready Node.js/TypeScript API server for integrating with Emerging Travel Group (ETG) API v3 (RateHawk) for comprehensive hotel booking solutions.

## Features

✅ **3-Step Search Workflow** - Region/Hotels/Geo search → Hotelpage details → Mandatory prebook verification

✅ **3-Step Booking Workflow** - Booking form → Finish booking → Status polling with webhook support

✅ **Complete API Coverage** - All required ETG endpoints implemented with proper retry logic

✅ **Production Ready** - TypeScript, PostgreSQL, Redis, Winston logging, comprehensive error handling

✅ **ETG Certified** - Follows all ETG integration guidelines and best practices

## Quick Start

### Deploy to Vercel

See [Vercel Deployment Guide](../VERCEL_DEPLOYMENT.md) for deploying to Vercel with serverless functions.

### Local Development

```bash
cd backend
npm install
cp ../.env.example .env  # Configure your ETG credentials
npm run db:setup         # Initialize database
npm run dev              # Start development server
```

See [GETTING_STARTED.md](./GETTING_STARTED.md) for detailed setup instructions.

## Documentation

- [Getting Started Guide](./GETTING_STARTED.md) - Quick setup and basic usage
- [Implementation Guide](./IMPLEMENTATION.md) - Comprehensive API documentation and architecture

## API Endpoints

- `POST /api/v1/search/region` - Search hotels by region
- `POST /api/v1/search/hotels` - Search specific hotels (max 300)
- `POST /api/v1/search/geo` - Search by geo-location
- `POST /api/v1/search/hotelpage` - Get hotel details (cached 1 hour)
- `POST /api/v1/search/prebook` - Verify rate (mandatory, no caching)
- `POST /api/v1/booking` - Create booking
- `GET /api/v1/booking/:orderId` - Get booking details
- `POST /api/v1/booking/:orderId/cancel` - Cancel booking
- `POST /api/v1/webhook/booking-status` - Webhook for ETG updates

## Tech Stack

- **Node.js** 18+ with TypeScript
- **Express.js** for API server
- **PostgreSQL** for data persistence
- **Redis** for caching
- **Winston** for logging
- **Zod** for validation
- **Jest** for testing

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run vercel-build` - Build for Vercel deployment
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## License

ISC
