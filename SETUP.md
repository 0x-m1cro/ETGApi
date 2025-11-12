# ETG API Integration - Complete Setup Guide

This guide will help you set up and run the complete hotel booking application with both backend and frontend.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18 or higher
- **PostgreSQL** 12 or higher
- **Redis** 6 or higher
- **npm** or **yarn**

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/0x-m1cro/ETGApi.git
cd ETGApi
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment Variables

```bash
cp ../.env.example .env
```

Edit `.env` and configure the following:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# ETG API Credentials
ETG_API_BASE_URL=https://api.worldota.net
ETG_API_KEY_ID=your_key_id_here
ETG_API_KEY=your_api_key_here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/etgapi
DB_HOST=localhost
DB_PORT=5432
DB_NAME=etgapi
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# CORS
CORS_ORIGIN=http://localhost:5173
```

#### Set Up Database

Create the PostgreSQL database:

```bash
createdb etgapi
```

Run migrations:

```bash
npm run db:setup
```

#### Start Backend Server

Development mode with hot reload:

```bash
npm run dev
```

Production mode:

```bash
npm run build
npm start
```

The backend API will be available at http://localhost:3000

### 3. Frontend Setup

#### Install Dependencies

```bash
cd ../frontend
npm install
```

#### Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

#### Start Frontend Server

Development mode:

```bash
npm run dev
```

The frontend will be available at http://localhost:5173

Production build:

```bash
npm run build
npm run preview
```

## Verify Installation

### Backend Health Check

```bash
curl http://localhost:3000/api/v1/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2025-11-12T18:00:00.000Z"
}
```

### Frontend Access

Open your browser and navigate to:

```
http://localhost:5173
```

You should see the hotel search page.

## Testing the Application

### Backend Tests

```bash
cd backend
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend
npm run lint
```

## Common Issues and Solutions

### Backend Issues

#### Database Connection Error

**Error**: `Connection to database failed`

**Solution**:
1. Ensure PostgreSQL is running: `sudo systemctl status postgresql`
2. Verify database credentials in `.env`
3. Check if database exists: `psql -l | grep etgapi`

#### Redis Connection Error

**Error**: `Redis connection error`

**Solution**:
1. Ensure Redis is running: `sudo systemctl status redis`
2. Verify Redis host and port in `.env`
3. Test connection: `redis-cli ping` (should return PONG)

#### ETG API Authentication Error

**Error**: `Unauthorized - Invalid credentials`

**Solution**:
1. Verify your ETG API credentials in `.env`
2. Ensure you're using the correct environment (sandbox vs production)
3. Check if your IP is whitelisted with ETG

### Frontend Issues

#### Cannot Connect to Backend

**Error**: Network error or CORS error

**Solution**:
1. Ensure backend is running on http://localhost:3000
2. Check `VITE_API_BASE_URL` in frontend `.env`
3. Verify CORS settings in backend configuration

#### Build Errors

**Error**: TypeScript or module errors

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Docker Setup (Optional)

### Using Docker Compose

Create a `docker-compose.yml` in the root directory:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: etgapi
      POSTGRES_USER: etguser
      POSTGRES_PASSWORD: etgpass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://etguser:etgpass@postgres:5432/etgapi
      REDIS_HOST: redis
      REDIS_PORT: 6379
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      VITE_API_BASE_URL: http://localhost:3000/api/v1
    depends_on:
      - backend

volumes:
  postgres_data:
```

Start all services:

```bash
docker-compose up -d
```

## Production Deployment

### Backend Deployment

1. **Build the application**:
   ```bash
   cd backend
   npm run build
   ```

2. **Set production environment variables**

3. **Run database migrations**:
   ```bash
   npm run db:setup
   ```

4. **Start with process manager**:
   ```bash
   pm2 start dist/index.js --name etg-api
   ```

5. **Set up reverse proxy** (Nginx example):
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Frontend Deployment

1. **Build the application**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to static hosting**:
   - **Vercel**: `vercel deploy`
   - **Netlify**: `netlify deploy --prod --dir=dist`
   - **Nginx**: Copy `dist/` to `/var/www/html`

3. **Configure environment variable**:
   Set `VITE_API_BASE_URL` to your production API URL

4. **Configure routing** for SPA:
   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```

## Monitoring

### Backend Logs

Logs are stored in `backend/logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only

View logs in real-time:
```bash
tail -f backend/logs/combined.log
```

### Application Metrics

Monitor the application health:
```bash
curl http://localhost:3000/api/v1/health
```

## Maintenance

### Database Backup

```bash
pg_dump etgapi > backup_$(date +%Y%m%d).sql
```

### Database Restore

```bash
psql etgapi < backup_20250112.sql
```

### Update Dependencies

Backend:
```bash
cd backend
npm update
npm audit fix
```

Frontend:
```bash
cd frontend
npm update
npm audit fix
```

## Development Workflow

### Making Changes

1. **Backend changes**:
   - Edit files in `backend/src/`
   - Tests auto-run if using `npm run test:watch`
   - Server auto-reloads with `npm run dev`

2. **Frontend changes**:
   - Edit files in `frontend/src/`
   - Browser auto-refreshes with HMR
   - Check console for errors

### Code Quality

Run linters:

```bash
# Backend
cd backend
npm run lint
npm run format

# Frontend
cd frontend
npm run lint
```

## Support

For issues and questions:

1. Check this guide for common solutions
2. Review the [Architecture Documentation](./ARCHITECTURE.md)
3. Check backend and frontend READMEs
4. Review the [PRD](./prd.md) for requirements

## Next Steps

After setup:

1. ✅ Verify backend health check
2. ✅ Access frontend UI
3. ✅ Test hotel search with test hotel IDs
4. ✅ Try the complete booking flow
5. ✅ Review the documentation

Happy coding! 🚀
