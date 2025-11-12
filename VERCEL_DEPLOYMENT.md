# Vercel Deployment Guide

This guide explains how to deploy both the backend (Node.js + Express) and frontend (Vite.js) to Vercel.

## Quick Links

- 📋 [Environment Variables Reference](./ENVIRONMENT_VARIABLES.md)
- 🚀 [Quick Deploy Guide](./QUICK_DEPLOY.md)
- 🔄 [Migration from Local to Vercel](./backend/MIGRATION_TO_VERCEL.md)

## Architecture Overview

- **Backend**: Serverless Node.js functions running Express on Vercel
- **Frontend**: Static site built with Vite and deployed to Vercel
- **Database**: Vercel Postgres (managed PostgreSQL)
- **Cache**: Vercel KV (Upstash Redis)

## Prerequisites

1. A Vercel account ([sign up here](https://vercel.com/signup))
2. Vercel CLI installed: `npm i -g vercel`
3. ETG API credentials (Key ID and API Key)

## Backend Deployment

### Step 1: Create Vercel Postgres Database

1. Go to your Vercel dashboard
2. Navigate to the Storage tab
3. Click "Create Database" → Select "Postgres"
4. Choose a database name (e.g., `etgapi-db`)
5. Select a region close to your users
6. Click "Create"

After creation, Vercel will automatically provide these environment variables:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### Step 2: Create Vercel KV (Redis) Database

1. In your Vercel dashboard, go to Storage
2. Click "Create Database" → Select "KV"
3. Choose a database name (e.g., `etgapi-redis`)
4. Select a region
5. Click "Create"

Vercel will provide these environment variables:
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

### Step 3: Set Up Database Schema

The database schema needs to be initialized. You have two options:

#### Option A: Using Vercel CLI (Recommended)
```bash
# Connect to your Vercel Postgres database
vercel env pull .env.local

# Run migrations using the connection string
cd backend
npm install
npx ts-node database/setup.ts
```

#### Option B: Manual SQL Execution
1. Go to Vercel Dashboard → Your Database → "Query"
2. Copy and paste the contents of `backend/database/migrations/001_initial_schema.sql`
3. Execute the SQL

### Step 4: Configure Backend Environment Variables

In your Vercel project settings, add these environment variables:

#### Required ETG API Configuration
```
NODE_ENV=production
ETG_BASE_URL=https://api.worldota.net
ETG_KEY_ID=your_key_id_here
ETG_API_KEY=your_api_key_here
ETG_USER_AGENT=ETGApi/1.0.0
```

#### Database Configuration (Auto-configured by Vercel)
These are automatically set when you link Vercel Postgres:
- `POSTGRES_URL` - Auto-set by Vercel
- `POSTGRES_PRISMA_URL` - Auto-set by Vercel

#### Redis Configuration (Auto-configured by Vercel)
These are automatically set when you link Vercel KV:
- `KV_URL` - Auto-set by Vercel
- `KV_REST_API_URL` - Auto-set by Vercel

#### Optional Configuration (with defaults)
```
CACHE_TTL_HOTELPAGE=3600
CACHE_TTL_SEARCH=1800
BOOKING_TIMEOUT=120
PREBOOK_TIMEOUT=60
SEARCH_TIMEOUT=30
LOG_LEVEL=info
WEBHOOK_SECRET=your_webhook_secret_here
```

### Step 5: Deploy Backend

```bash
cd backend
vercel --prod
```

Or link it to a Git repository:
1. Push your code to GitHub
2. Go to Vercel Dashboard → "Add New Project"
3. Import your repository
4. Set Root Directory to `backend`
5. Click "Deploy"

After deployment, note your backend URL (e.g., `https://your-backend.vercel.app`)

### Step 6: Link Database to Project

If you haven't already:
```bash
cd backend
vercel link
vercel env pull
```

Then in Vercel Dashboard:
1. Go to your backend project settings
2. Navigate to "Storage"
3. Click "Connect Store"
4. Select your Postgres database
5. Select your KV database

## Frontend Deployment

### Step 1: Configure Frontend Environment Variables

In your Vercel frontend project settings, add:

```
VITE_API_BASE_URL=https://your-backend.vercel.app/api/v1
```

Replace `your-backend.vercel.app` with your actual backend URL from the backend deployment.

### Step 2: Update vercel.json (if using API proxy)

Edit `frontend/vercel.json` and replace the backend URL:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend.vercel.app/api/:path*"
    }
  ]
}
```

### Step 3: Deploy Frontend

```bash
cd frontend
vercel --prod
```

Or via Git:
1. Go to Vercel Dashboard → "Add New Project"
2. Import your repository
3. Set Root Directory to `frontend`
4. Add environment variable: `VITE_API_BASE_URL`
5. Click "Deploy"

## Deployment Structure

```
/
├── backend/                  # Express API (Serverless)
│   ├── api/
│   │   └── index.ts         # Serverless entry point
│   ├── src/
│   │   ├── app.ts           # Express app configuration
│   │   └── ...
│   ├── vercel.json          # Vercel backend config
│   └── package.json
│
└── frontend/                # Vite frontend (Static)
    ├── src/
    ├── dist/                # Build output
    ├── vercel.json          # Vercel frontend config
    └── package.json
```

## Important Notes

### Backend Serverless Considerations

1. **Cold Starts**: First request may be slower (2-5 seconds). Subsequent requests are fast.
2. **Execution Time Limit**: Vercel has a 10-second timeout for Hobby plan, 60 seconds for Pro.
3. **Connection Pooling**: The code automatically uses Vercel Postgres connection pooling.
4. **No Persistent State**: Each request may run in a different instance.

### Database Migrations

After initial setup, you can run migrations:

```bash
# Pull environment variables locally
vercel env pull .env.local

# Run migrations
cd backend
npm run db:setup
```

Or execute SQL directly in Vercel Dashboard → Database → Query tab.

### Redis/Cache

The backend automatically detects Vercel KV and uses it instead of a traditional Redis instance. All existing Redis commands work seamlessly.

### Webhook Configuration

For booking status webhooks:

1. Get your backend URL from Vercel
2. Set `WEBHOOK_URL` environment variable to: `https://your-backend.vercel.app/api/v1/webhook/booking-status`
3. Set `WEBHOOK_SECRET` to a secure random string
4. Configure this URL in your ETG dashboard

## Monitoring and Logs

View logs and monitoring:
1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments" → Select a deployment
4. View "Functions" tab for serverless logs
5. View "Runtime Logs" for real-time logging

## Troubleshooting

### Database Connection Issues
- Verify `POSTGRES_URL` is set in environment variables
- Check database is in the same region as your function
- Ensure database schema is initialized

### Redis Connection Issues
- Verify `KV_URL` is set in environment variables
- Check KV store is linked to your project

### API Not Responding
- Check function logs in Vercel Dashboard
- Verify environment variables are set
- Check for cold start delays (first request)

### CORS Issues
- Backend already includes CORS middleware
- Verify frontend URL is correct
- Check browser console for specific errors

## Local Development

For local development, continue using the traditional setup:

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

Use `.env` files for local environment variables. The code automatically detects whether it's running on Vercel or locally.

## Deployment Checklist

- [ ] Vercel Postgres database created and schema initialized
- [ ] Vercel KV (Redis) created and linked
- [ ] Backend environment variables configured
- [ ] Backend deployed to Vercel
- [ ] Backend URL noted
- [ ] Frontend environment variable set with backend URL
- [ ] Frontend vercel.json updated with backend URL
- [ ] Frontend deployed to Vercel
- [ ] Test API endpoints
- [ ] Test search functionality
- [ ] Test booking functionality
- [ ] Configure webhooks if needed

## Support

For Vercel-specific issues:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel KV Docs](https://vercel.com/docs/storage/vercel-kv)

For application issues, refer to the main README.md and backend/frontend documentation.
