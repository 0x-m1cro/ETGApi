import { Router } from 'express';
import bookingController from '../controllers/booking.controller';

const router = Router();

// Create new booking (handles all 3 steps internally)
router.post('/', bookingController.createBooking);

// Get booking information
router.get('/:orderId', bookingController.getBooking);

// Cancel booking
router.post('/:orderId/cancel', bookingController.cancelBooking);

export default router;
