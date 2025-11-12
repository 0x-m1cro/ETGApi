# RateHawk API Integration - Full Stack Application

Enterprise-grade full-stack application for integrating with Emerging Travel Group (ETG) API v3 (RateHawk) for comprehensive hotel booking solutions.

## 🏗️ Architecture

This is a monorepo containing:

- **Backend** (`/backend`) - Production-ready Node.js/TypeScript API server
- **Frontend** (`/frontend`) - Modern React/TypeScript application with Vite and TailwindCSS

## ✨ Features

### Backend
- ✅ 3-Step Search Workflow (Region/Hotels/Geo → Hotelpage → Prebook)
- ✅ 3-Step Booking Workflow (Form → Finish → Status polling/webhook)
- ✅ Complete ETG API Coverage with retry logic
- ✅ PostgreSQL + Redis + Winston logging
- ✅ ETG Certified implementation

### Frontend
- ✅ Professional hotel search interface
- ✅ Booking management dashboard
- ✅ Real-time booking status tracking
- ✅ Responsive design with TailwindCSS
- ✅ TypeScript for type safety
- ✅ Enterprise-grade architecture

## 🚀 Quick Start

### Deploy to Vercel (Recommended)

The fastest way to get started is deploying to Vercel:

📘 **[Quick Deploy Guide](./QUICK_DEPLOY.md)** - Deploy in 5 minutes

📖 **[Full Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md)** - Detailed instructions

### Local Development

#### Prerequisites
- Node.js 18+
- PostgreSQL
- Redis

#### Backend Setup

```bash
cd backend
npm install
cp ../.env.example .env  # Configure your ETG credentials
npm run db:setup         # Initialize database
npm run dev              # Start on http://localhost:3000
```

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev              # Start on http://localhost:5173
```

## 📚 Documentation

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [PRD - Product Requirements](./prd.md)
- **[Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md)** - Deploy to Vercel
- [Quick Deploy Guide](./QUICK_DEPLOY.md) - Fast deployment steps

## 🛠️ Tech Stack

### Backend
- Node.js 18+ with TypeScript
- Express.js
- PostgreSQL & Redis
- Winston, Zod, Jest

### Frontend
- React 18 with TypeScript
- Vite
- TailwindCSS
- React Router
- Axios
- React Query

## 📝 License

ISC