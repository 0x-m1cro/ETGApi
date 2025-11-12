# Migration to Vercel Guide

This guide helps you migrate an existing local deployment to Vercel.

## Overview

The application now supports both traditional deployment (local PostgreSQL + Redis) and Vercel deployment (Vercel Postgres + Vercel KV). The code automatically detects which environment it's running in.

## Environment Detection

The application detects Vercel environment through:
- **Database**: Checks for `POSTGRES_URL` environment variable
- **Redis**: Checks for `KV_REST_API_URL` environment variable

When these variables are present, the application uses Vercel services. Otherwise, it uses traditional configuration.

## Migration Steps

### Step 1: Export Existing Data (Optional)

If you have important data in your local database:

```bash
# Export your PostgreSQL data
pg_dump -h localhost -U postgres -d etgapi > backup.sql

# For specific tables only:
pg_dump -h localhost -U postgres -d etgapi -t bookings -t booking_logs > backup.sql
```

### Step 2: Set Up Vercel Environment

Follow the [Vercel Deployment Guide](../VERCEL_DEPLOYMENT.md) to:
1. Create Vercel Postgres database
2. Create Vercel KV (Redis) store
3. Deploy backend and frontend
4. Link storage to your projects

### Step 3: Initialize Vercel Database

Run the database migrations on Vercel:

```bash
# Option A: Using local connection
vercel env pull .env.local
cd backend
npm run db:setup

# Option B: Manual SQL execution
# Go to Vercel Dashboard → Database → Query
# Paste contents of backend/database/migrations/001_initial_schema.sql
# Execute the SQL
```

### Step 4: Import Existing Data (Optional)

If you exported data in Step 1:

```bash
# Connect to Vercel Postgres
vercel env pull .env.local

# Import data (adjust connection string as needed)
psql $POSTGRES_URL < backup.sql
```

Or use Vercel Dashboard → Database → Query tab to execute INSERT statements.

### Step 5: Verify Migration

Test your deployed application:
1. Search for hotels
2. Check cached data is working
3. Create a test booking
4. Verify booking status tracking

## Key Differences

### Database Connection

**Local:**
```javascript
// Uses individual connection parameters
host: config.database.host,
port: config.database.port,
database: config.database.name,
user: config.database.user,
password: config.database.password,
```

**Vercel:**
```javascript
// Uses connection string with SSL
connectionString: process.env.POSTGRES_URL,
ssl: { rejectUnauthorized: false }
```

### Redis Connection

**Local:**
```javascript
// Uses individual connection parameters
new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
})
```

**Vercel:**
```javascript
// Uses connection URL with TLS
new Redis(process.env.KV_URL, {
  tls: { rejectUnauthorized: false }
})
```

## Rollback Plan

If you need to rollback to local deployment:

1. Remove Vercel environment variables: `POSTGRES_URL`, `KV_URL`
2. Ensure local `.env` has traditional database/Redis configuration
3. Application will automatically use local services

## Configuration Compatibility

All existing configuration options continue to work:
- ✅ ETG API credentials
- ✅ Cache TTL settings
- ✅ Timeout configurations
- ✅ Webhook settings
- ✅ Logging levels

## Troubleshooting

### Database Connection Issues

**Problem:** Can't connect to Vercel Postgres

**Solutions:**
- Verify `POSTGRES_URL` is set in Vercel project settings
- Check database is linked to your project
- Ensure database and serverless function are in the same region

### Redis Connection Issues

**Problem:** Can't connect to Vercel KV

**Solutions:**
- Verify `KV_URL` is set in Vercel project settings
- Check KV store is linked to your project
- Ensure TLS is enabled in Redis configuration

### Mixed Environment Issues

**Problem:** Some features work, others don't

**Solutions:**
- Ensure BOTH database and Redis are configured for Vercel
- Don't mix local and Vercel services
- Check environment variables in Vercel Dashboard

### Performance Issues

**Problem:** Slow response times

**Solutions:**
- Check for cold starts (first request is slower)
- Verify database and function are in same region
- Consider upgrading Vercel plan for better performance

## Best Practices

1. **Use Vercel Environments**: Set up separate environments for preview and production
2. **Monitor Logs**: Regularly check Vercel function logs for errors
3. **Database Backups**: Enable Vercel Postgres backups in dashboard
4. **Secrets Management**: Use Vercel environment variables, never commit secrets
5. **Testing**: Test thoroughly in preview deployments before promoting to production

## Support

For migration issues:
- Check [Vercel Deployment Guide](../VERCEL_DEPLOYMENT.md)
- Review [Vercel Documentation](https://vercel.com/docs)
- Check application logs in Vercel Dashboard

## Next Steps

After successful migration:
1. Set up custom domain
2. Configure Vercel Analytics
3. Enable monitoring and alerts
4. Set up CI/CD with GitHub integration
5. Configure webhook endpoints in ETG dashboard
