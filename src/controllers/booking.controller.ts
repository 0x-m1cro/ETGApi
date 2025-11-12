import { Request, Response, NextFunction } from 'express';
import bookingService from '../services/booking.service';
import bookingRepository from '../repositories/booking.repository';
import logger from '../config/logger';

class BookingController {
  async createBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { book_hash, user, language, hotel_id, checkin, checkout, total_amount, currency } =
        req.body;

      // Generate partner order ID
      const partnerOrderId = bookingService.generatePartnerOrderId();

      // Step 1: Create booking form
      let formResponse;
      try {
        formResponse = await bookingService.createBookingForm({
          partner_order_id: partnerOrderId,
          book_hash,
          user,
          language,
        });
      } catch (error: unknown) {
        if ((error as Error).message === 'double_booking_form') {
          // Regenerate partner order ID and retry
          const newPartnerOrderId = bookingService.generatePartnerOrderId();
          formResponse = await bookingService.createBookingForm({
            partner_order_id: newPartnerOrderId,
            book_hash,
            user,
            language,
          });
        } else {
          throw error;
        }
      }

      // Save booking to database
      await bookingRepository.create({
        partner_order_id: formResponse.data.partner_order_id,
        hotel_id,
        status: 'form_created',
        checkin_date: new Date(checkin),
        checkout_date: new Date(checkout),
        guest_name: req.body.holder?.name || '',
        guest_email: user.email,
        guest_phone: user.phone,
        total_amount,
        currency,
        prebook_hash: book_hash,
      });

      // Step 2: Finish booking
      await bookingService.finishBooking({
        partner_order_id: formResponse.data.partner_order_id,
        payment_type: req.body.payment_type || 'deposit',
        holder: req.body.holder,
        guests: req.body.guests,
      });

      // Step 3: Poll for status
      const statusResponse = await bookingService.pollBookingStatus(
        formResponse.data.partner_order_id
      );

      // Update booking with final status
      await bookingRepository.update(formResponse.data.partner_order_id, {
        etg_order_id: statusResponse.data.order_id,
        status: statusResponse.data.status,
      });

      res.json({
        status: 'success',
        data: {
          partner_order_id: formResponse.data.partner_order_id,
          etg_order_id: statusResponse.data.order_id,
          booking_status: statusResponse.data.status,
        },
      });
    } catch (error) {
      logger.error('Error in createBooking controller', error);
      next(error);
    }
  }

  async getBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId } = req.params;

      // First check our database
      const booking = await bookingRepository.findByPartnerOrderId(orderId);

      if (!booking) {
        res.status(404).json({
          status: 'error',
          message: 'Booking not found',
        });
        return;
      }

      // If booking has ETG order ID, fetch latest info
      let etgInfo = null;
      if (booking.etg_order_id) {
        try {
          etgInfo = await bookingService.getOrderInfo({ order_id: booking.etg_order_id });
        } catch {
          logger.warn('Could not fetch ETG order info', { orderId: booking.etg_order_id });
        }
      }

      res.json({
        status: 'success',
        data: {
          booking,
          etg_info: etgInfo?.data,
        },
      });
    } catch (error) {
      logger.error('Error in getBooking controller', error);
      next(error);
    }
  }

  async cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId } = req.params;

      const booking = await bookingRepository.findByPartnerOrderId(orderId);

      if (!booking || !booking.etg_order_id) {
        res.status(404).json({
          status: 'error',
          message: 'Booking not found or not confirmed',
        });
        return;
      }

      const result = await bookingService.cancelBooking({ order_id: booking.etg_order_id });

      await bookingRepository.update(orderId, { status: 'cancelled' });

      res.json({
        status: 'success',
        data: result.data,
      });
    } catch (error) {
      logger.error('Error in cancelBooking controller', error);
      next(error);
    }
  }

  async webhookBookingStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { partner_order_id, status, order_id } = req.body;

      logger.info('Webhook received', { partner_order_id, status, order_id });

      // Update booking status in database
      await bookingRepository.update(partner_order_id, {
        etg_order_id: order_id,
        status,
      });

      // Respond with 200 OK as required
      res.status(200).json({ status: 'ok' });
    } catch (error) {
      logger.error('Error in webhookBookingStatus controller', error);
      next(error);
    }
  }
}

export default new BookingController();
