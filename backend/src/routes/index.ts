import { Router } from 'express';
import searchRoutes from './search.routes';
import bookingRoutes from './booking.routes';
import webhookRoutes from './webhook.routes';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
router.use('/search', searchRoutes);
router.use('/booking', bookingRoutes);
router.use('/webhook', webhookRoutes);

export default router;
