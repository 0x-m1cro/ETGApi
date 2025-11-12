# Environment Variables Reference

Complete reference for all environment variables used in the application.

## Backend Environment Variables

### Required for All Deployments

#### ETG API Configuration
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `ETG_BASE_URL` | Yes | ETG API base URL | `https://api.worldota.net` |
| `ETG_KEY_ID` | Yes | Your ETG API key ID | `your_key_id` |
| `ETG_API_KEY` | Yes | Your ETG API key | `your_api_key` |
| `ETG_USER_AGENT` | No | User agent for API requests | `ETGApi/1.0.0` |

### Local Development

#### Server Configuration
| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `NODE_ENV` | No | Environment mode | `development` |
| `PORT` | No | Server port | `3000` |

#### Database Configuration (PostgreSQL)
| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `DB_HOST` | No | Database host | `localhost` |
| `DB_PORT` | No | Database port | `5432` |
| `DB_NAME` | No | Database name | `etgapi` |
| `DB_USER` | No | Database user | `postgres` |
| `DB_PASSWORD` | No | Database password | `postgres` |

#### Redis Configuration
| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `REDIS_HOST` | No | Redis host | `localhost` |
| `REDIS_PORT` | No | Redis port | `6379` |
| `REDIS_PASSWORD` | No | Redis password | *(empty)* |

### Vercel Deployment

#### Database Configuration (Auto-configured)
When you link Vercel Postgres to your project, these are automatically set:

| Variable | Auto-Set | Description |
|----------|----------|-------------|
| `POSTGRES_URL` | Yes | Connection string for pooled connections |
| `POSTGRES_PRISMA_URL` | Yes | Optimized connection string for Prisma |
| `POSTGRES_URL_NON_POOLING` | Yes | Direct connection string (migrations) |
| `POSTGRES_USER` | Yes | Database username |
| `POSTGRES_HOST` | Yes | Database host |
| `POSTGRES_PASSWORD` | Yes | Database password |
| `POSTGRES_DATABASE` | Yes | Database name |

**Note:** The application uses `POSTGRES_URL` and ignores `DB_*` variables on Vercel.

#### Redis Configuration (Auto-configured)
When you link Vercel KV to your project, these are automatically set:

| Variable | Auto-Set | Description |
|----------|----------|-------------|
| `KV_URL` | Yes | Redis connection URL |
| `KV_REST_API_URL` | Yes | REST API endpoint |
| `KV_REST_API_TOKEN` | Yes | REST API token |
| `KV_REST_API_READ_ONLY_TOKEN` | Yes | Read-only REST API token |

**Note:** The application uses `KV_URL` and ignores `REDIS_*` variables on Vercel.

### Optional Configuration (All Environments)

#### Cache Configuration
| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `CACHE_TTL_HOTELPAGE` | No | Hotel page cache TTL (seconds) | `3600` |
| `CACHE_TTL_SEARCH` | No | Search results cache TTL (seconds) | `1800` |

#### Timeout Configuration
| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `SEARCH_TIMEOUT` | No | Search request timeout (seconds) | `30` |
| `PREBOOK_TIMEOUT` | No | Prebook request timeout (seconds) | `60` |
| `BOOKING_TIMEOUT` | No | Booking request timeout (seconds) | `120` |

#### Webhook Configuration
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `WEBHOOK_SECRET` | No | Secret for webhook verification | `your_secret_here` |
| `WEBHOOK_URL` | No | Your webhook endpoint URL | `https://your-backend.vercel.app/api/v1/webhook/booking-status` |

#### Logging Configuration
| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `LOG_LEVEL` | No | Logging level | `info` |

**Available log levels:** `error`, `warn`, `info`, `debug`

## Frontend Environment Variables

### Required

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_BASE_URL` | Yes | Backend API base URL | `http://localhost:3000/api/v1` (local)<br>`https://your-backend.vercel.app/api/v1` (production) |

## Environment Files

### Local Development

**Backend:** `/backend/.env`
```env
NODE_ENV=development
PORT=3000

# ETG API
ETG_BASE_URL=https://api.worldota.net
ETG_KEY_ID=your_key_id_here
ETG_API_KEY=your_api_key_here

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=etgapi
DB_USER=postgres
DB_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

**Frontend:** `/frontend/.env`
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### Vercel Deployment

Configure in Vercel Dashboard → Project Settings → Environment Variables:

**Backend (Manually Set):**
```
ETG_KEY_ID=your_key_id_here
ETG_API_KEY=your_api_key_here
NODE_ENV=production
```

**Backend (Auto-configured by linking storage):**
- `POSTGRES_URL` - Set when you link Vercel Postgres
- `KV_URL` - Set when you link Vercel KV

**Frontend:**
```
VITE_API_BASE_URL=https://your-backend.vercel.app/api/v1
```

## Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` for templates
2. **Use strong secrets** - Generate random strings for `WEBHOOK_SECRET`
3. **Rotate credentials** - Regularly update API keys and secrets
4. **Limit access** - Use environment-specific variables (preview vs production)
5. **Use Vercel's encryption** - Environment variables are encrypted at rest

## Validation

The application validates required environment variables on startup:
- Missing ETG API credentials will prevent the application from starting
- Database connection issues will be logged but won't crash the app in Vercel
- Redis connection issues will be logged but won't crash the app in Vercel

## Troubleshooting

### Variable Not Found

**Problem:** Environment variable is not being read

**Solutions:**
- Local: Check `.env` file exists in the correct directory
- Vercel: Verify variable is set in project settings
- Restart dev server or redeploy to Vercel

### Wrong Value Used

**Problem:** Application uses wrong environment variable value

**Solutions:**
- Check for typos in variable names
- Verify correct environment (preview vs production)
- Clear build cache and redeploy

### Database Connection Fails

**Problem:** Can't connect to database despite correct configuration

**Solutions:**
- Local: Verify PostgreSQL is running
- Vercel: Check database is linked to project
- Verify `POSTGRES_URL` is accessible from function region

## Quick Reference

### Minimum Required (Local)
```env
ETG_KEY_ID=xxx
ETG_API_KEY=xxx
```

### Minimum Required (Vercel)
```env
# Manually set:
ETG_KEY_ID=xxx
ETG_API_KEY=xxx

# Auto-set by linking storage:
POSTGRES_URL=xxx
KV_URL=xxx
```

## Related Documentation

- [Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md)
- [Quick Deploy Guide](./QUICK_DEPLOY.md)
- [Migration Guide](./backend/MIGRATION_TO_VERCEL.md)
