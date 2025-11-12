# ETG API Integration - Architecture Documentation

## Overview

This is a full-stack application that integrates with the RateHawk ETG API v3 for hotel search and booking management. The application follows enterprise-grade design principles with a clear separation between backend and frontend.

## Repository Structure

```
ETGApi/
├── backend/                 # Node.js/TypeScript API server
│   ├── src/
│   │   ├── api/            # API client for ETG API
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── repositories/   # Data access layer
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── config/         # Configuration
│   │   └── types/          # TypeScript types
│   ├── database/           # Database setup and migrations
│   └── __tests__/          # Unit tests
├── frontend/               # React/TypeScript UI application
│   ├── src/
│   │   ├── api/           # HTTP client for backend API
│   │   ├── components/    # React components
│   │   ├── pages/         # Page-level components
│   │   ├── utils/         # Utility functions
│   │   └── types/         # TypeScript types
│   └── public/            # Static assets
├── prd.md                 # Product requirements document
└── README.md              # Main project README
```

## Technology Stack

### Backend

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Cache**: Redis
- **Logging**: Winston
- **Validation**: Zod
- **Testing**: Jest
- **HTTP Client**: Axios with retry logic

### Frontend

- **Library**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS v4
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Icons**: Lucide React
- **Date Utilities**: date-fns

## Architecture Patterns

### Backend Architecture

#### Layered Architecture

1. **Routes Layer** (`routes/`)
   - Defines API endpoints
   - Maps HTTP methods to controllers
   - Applies middleware (validation, error handling)

2. **Controller Layer** (`controllers/`)
   - Handles HTTP requests/responses
   - Delegates business logic to services
   - Manages request/response transformation

3. **Service Layer** (`services/`)
   - Contains business logic
   - Orchestrates data access and external API calls
   - Implements retry logic and error handling

4. **Repository Layer** (`repositories/`)
   - Data access abstraction
   - Database queries
   - Caching logic

5. **Middleware Layer** (`middleware/`)
   - Request validation
   - Error handling
   - Logging

#### Key Design Patterns

- **Dependency Injection**: Services injected into controllers
- **Repository Pattern**: Data access abstraction
- **Singleton Pattern**: Logger, database pool, Redis client
- **Retry Pattern**: Automatic retries for ETG API calls
- **Circuit Breaker Pattern**: Graceful handling of API failures

### Frontend Architecture

#### Component-Based Architecture

1. **Pages** (`pages/`)
   - Top-level route components
   - Orchestrate data fetching and state
   - Compose smaller components

2. **Components** (`components/`)
   - Reusable UI components
   - Organized by feature (search, booking, common)
   - Single responsibility principle

3. **API Layer** (`api/`)
   - Centralized HTTP client configuration
   - API endpoint definitions
   - Request/response transformations

4. **Utils** (`utils/`)
   - Helper functions
   - Formatters (currency, dates)
   - Validators

#### Key Design Patterns

- **Container/Presentational Pattern**: Separation of logic and UI
- **Custom Hooks**: Reusable stateful logic
- **React Query Pattern**: Server state management
- **Compound Components**: Complex UI components
- **Controlled Components**: Form management

## Data Flow

### Search Flow

```
User Input (SearchPage)
  ↓
Search Form Component
  ↓
TanStack Query Mutation
  ↓
API Client (Axios)
  ↓
Backend API (/api/v1/search/*)
  ↓
Search Controller
  ↓
Search Service
  ↓
ETG Client (with retry)
  ↓
ETG API v3
  ↓
Response Transform
  ↓
Hotel List Display
```

### Booking Flow

```
Rate Selection
  ↓
Prebook Modal (Rate Verification)
  ↓
Backend API (/api/v1/search/prebook)
  ↓
ETG API v3 Prebook
  ↓
Booking Form
  ↓
Backend API (/api/v1/booking)
  ↓
Booking Controller
  ↓
Booking Service (3-step process)
  ↓
1. Create Booking Form
2. Finish Booking
3. Poll Status / Webhook
  ↓
Database (PostgreSQL)
  ↓
Success Page
```

## API Integration

### ETG API v3 Endpoints Used

#### Search Endpoints
- `POST /api/b2b/v3/search/serp/region/` - Search by region
- `POST /api/b2b/v3/search/serp/hotels/` - Search by hotel IDs
- `POST /api/b2b/v3/search/serp/geo/` - Search by coordinates
- `POST /api/b2b/v3/search/hp/` - Get hotel page details
- `POST /api/b2b/v3/hotel/prebook` - Verify rate availability

#### Booking Endpoints
- `POST /api/b2b/v3/hotel/order/booking/form/` - Create booking form
- `POST /api/b2b/v3/hotel/order/booking/finish/` - Finish booking
- `POST /api/b2b/v3/hotel/order/booking/finish/status/` - Check status
- `POST /api/b2b/v3/hotel/order/info/` - Get booking details
- `POST /api/b2b/v3/hotel/order/cancel/` - Cancel booking

### Backend API Endpoints

#### Search
- `POST /api/v1/search/region` - Search hotels by region
- `POST /api/v1/search/hotels` - Search specific hotels
- `POST /api/v1/search/geo` - Search by location
- `POST /api/v1/search/hotelpage` - Get hotel details
- `POST /api/v1/search/prebook` - Verify rate

#### Booking
- `POST /api/v1/booking` - Create booking
- `GET /api/v1/booking/:orderId` - Get booking
- `POST /api/v1/booking/:orderId/cancel` - Cancel booking

#### Webhook
- `POST /api/v1/webhook/booking-status` - Receive status updates

## Security Considerations

### Backend Security

1. **Authentication**: HTTP Basic Auth with ETG API
2. **Environment Variables**: Credentials stored securely
3. **Input Validation**: Zod schemas for all inputs
4. **Error Handling**: No sensitive data in error responses
5. **Rate Limiting**: Respects ETG API rate limits
6. **CORS**: Configured for frontend access

### Frontend Security

1. **HTTPS**: Production must use HTTPS
2. **No Credentials**: API keys never in frontend code
3. **Input Validation**: Client-side validation for UX
4. **XSS Protection**: React's built-in XSS protection
5. **Environment Variables**: API URL in .env file

## Scalability Considerations

### Backend Scalability

1. **Stateless Design**: No session state (except database)
2. **Caching**: Redis for hotel page responses (1 hour)
3. **Connection Pooling**: PostgreSQL connection pool
4. **Async Operations**: Non-blocking I/O
5. **Horizontal Scaling**: Multiple instances behind load balancer

### Frontend Scalability

1. **Code Splitting**: Route-based code splitting
2. **Lazy Loading**: Images and components
3. **Caching**: React Query cache
4. **CDN Deployment**: Static assets on CDN
5. **Optimized Builds**: Tree shaking and minification

## Error Handling

### Backend Error Handling

1. **Try-Catch Blocks**: Consistent error catching
2. **Error Middleware**: Centralized error processing
3. **Retry Logic**: Automatic retries for transient failures
4. **Logging**: All errors logged with Winston
5. **User-Friendly Messages**: Clean error responses

### Frontend Error Handling

1. **Error Boundaries**: React error boundaries
2. **Query Error States**: TanStack Query error handling
3. **Toast Notifications**: User feedback for errors
4. **Retry Options**: User-triggered retries
5. **Fallback UI**: Graceful degradation

## Performance Optimization

### Backend Performance

1. **Database Indexing**: Proper indexes on booking tables
2. **Redis Caching**: Cache hotel page responses
3. **Connection Pooling**: Reuse database connections
4. **Compression**: Response compression middleware
5. **Request Timeouts**: Appropriate timeouts for ETG API

### Frontend Performance

1. **Code Splitting**: Lazy load routes
2. **Image Optimization**: Lazy loading images
3. **Memoization**: React.memo for components
4. **Query Deduplication**: React Query automatic
5. **Bundle Size**: Tree shaking, minification

## Deployment

### Backend Deployment

1. **Build**: `npm run build` (TypeScript → JavaScript)
2. **Environment**: Set production environment variables
3. **Database**: Run migrations
4. **Process Manager**: PM2 or similar
5. **Reverse Proxy**: Nginx

### Frontend Deployment

1. **Build**: `npm run build` (Vite production build)
2. **Static Hosting**: Serve `dist/` directory
3. **Environment**: Set VITE_API_BASE_URL
4. **CDN**: CloudFlare, Vercel, or Netlify
5. **Routing**: Configure for SPA routing

## Monitoring & Logging

### Backend Monitoring

- Winston logs to files and console
- Error tracking with stack traces
- Request/response logging
- Database query logging
- Redis connection monitoring

### Frontend Monitoring

- Browser console errors
- React Query DevTools (development)
- Network request monitoring
- Performance metrics
- User interaction tracking

## Testing Strategy

### Backend Testing

1. **Unit Tests**: Service layer logic
2. **Integration Tests**: API endpoints
3. **Validation Tests**: Input validation
4. **Error Handling Tests**: Error scenarios
5. **Coverage**: Target 80%+ coverage

### Frontend Testing

1. **Component Tests**: Individual components
2. **Integration Tests**: User flows
3. **E2E Tests**: Full booking flow
4. **Visual Regression**: UI consistency
5. **Accessibility**: WCAG compliance

## Future Enhancements

### Backend

- [ ] GraphQL API layer
- [ ] Webhook management UI
- [ ] Static data dump processing
- [ ] Hotel content caching
- [ ] Rate limiting middleware
- [ ] API versioning

### Frontend

- [ ] Progressive Web App (PWA)
- [ ] Offline support
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Advanced filters
- [ ] Price alerts
- [ ] Booking history export
- [ ] User accounts

## Maintenance

### Backend Maintenance

- Regular dependency updates
- Database backup strategy
- Log rotation
- Cache invalidation
- ETG API version updates

### Frontend Maintenance

- Dependency updates
- Browser compatibility testing
- Performance audits
- Accessibility audits
- Design system updates

## Documentation

- README files in backend/ and frontend/
- API documentation (this file)
- Code comments for complex logic
- Type definitions for contracts
- Setup and deployment guides
