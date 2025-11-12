# Quick Deploy to Vercel

This is a condensed guide to get your application deployed to Vercel in minutes.

## Prerequisites

- Vercel account
- ETG API credentials (Key ID and API Key)

## Backend Deployment (5 steps)

### 1. Create Vercel Postgres Database
- Go to [Vercel Dashboard](https://vercel.com/dashboard) → Storage → Create Database
- Select "Postgres"
- Name it (e.g., `etgapi-db`) and create

### 2. Create Vercel KV (Redis)
- Storage → Create Database
- Select "KV"
- Name it (e.g., `etgapi-redis`) and create

### 3. Deploy Backend to Vercel
```bash
cd backend
vercel --prod
```

### 4. Link Storage to Backend Project
- Go to your backend project in Vercel Dashboard
- Settings → Storage → Connect Store
- Connect both Postgres and KV databases

### 5. Set Environment Variables
In Vercel Dashboard → Your Backend Project → Settings → Environment Variables, add:

```
ETG_KEY_ID=your_key_id_here
ETG_API_KEY=your_api_key_here
```

All other variables (database, Redis) are auto-configured when you linked storage.

### 6. Initialize Database Schema
```bash
# Pull environment variables
vercel env pull .env.local

# Run migrations
npm run db:setup
```

Or manually execute `backend/database/migrations/001_initial_schema.sql` in Vercel Dashboard → Database → Query.

**Note your backend URL** (e.g., `https://your-backend.vercel.app`)

## Frontend Deployment (2 steps)

### 1. Set Backend URL
Create environment variable in Vercel:
```
VITE_API_BASE_URL=https://your-backend.vercel.app/api/v1
```

### 2. Deploy Frontend
```bash
cd frontend
vercel --prod
```

## Alternative: Deploy via GitHub

1. Push your code to GitHub
2. Go to Vercel Dashboard → Add New Project
3. Import your repository

**For Backend:**
- Set Root Directory: `backend`
- Add environment variables as above
- Deploy

**For Frontend:**
- Set Root Directory: `frontend`
- Add `VITE_API_BASE_URL` environment variable
- Deploy

## Testing

After deployment:
1. Visit your frontend URL
2. Try searching for hotels
3. Check Vercel logs if issues occur

## Done! 🎉

Your application is now live on Vercel.

For detailed information, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
