import { Router } from 'express';
import bookingController from '../controllers/booking.controller';

const router = Router();

// Webhook endpoint for ETG booking status updates
router.post('/booking-status', bookingController.webhookBookingStatus);

export default router;
