import etgClient from './etg-client';
import logger from '../config/logger';
import { v4 as uuidv4 } from 'uuid';
import {
  BookingFormRequest,
  BookingFormResponse,
  BookingFinishRequest,
  BookingFinishResponse,
  BookingStatusRequest,
  BookingStatusResponse,
  BookingStatus,
  OrderInfoRequest,
  OrderInfoResponse,
  CancelBookingRequest,
  CancelBookingResponse,
} from '../types/etg.types';

class BookingService {
  // Step 1: Create Booking Form
  async createBookingForm(request: BookingFormRequest): Promise<BookingFormResponse> {
    try {
      const response = await etgClient.post<BookingFormResponse>(
        '/api/b2b/v3/hotel/order/booking/form/',
        request
      );

      const status = response.data.status;

      // Handle different response statuses
      if (status === 'ok') {
        logger.info('Booking form created successfully', {
          partnerOrderId: request.partner_order_id,
        });
        return response.data;
      }

      // Handle retryable errors
      if (etgClient.isRetryableError(status)) {
        throw new Error(`Retryable error: ${status}`);
      }

      // Handle double booking form error
      if (status === 'double_booking_form') {
        logger.warn('Double booking form detected', {
          partnerOrderId: request.partner_order_id,
        });
        throw new Error('double_booking_form');
      }

      // Handle final errors
      if (etgClient.isFinalError(status)) {
        logger.error('Final booking form error', {
          status,
          partnerOrderId: request.partner_order_id,
        });
        throw new Error(`Booking form failed: ${status}`);
      }

      return response.data;
    } catch (error) {
      logger.error('Error in createBookingForm', error);
      throw error;
    }
  }

  // Step 2: Start Booking Process
  async finishBooking(request: BookingFinishRequest): Promise<BookingFinishResponse> {
    try {
      const response = await etgClient.post<BookingFinishResponse>(
        '/api/b2b/v3/hotel/order/booking/finish/',
        request
      );

      const status = response.data.status;

      if (status === 'ok') {
        logger.info('Booking finish initiated', {
          partnerOrderId: request.partner_order_id,
        });
        return response.data;
      }

      // Handle retryable errors
      if (etgClient.isRetryableError(status) || status === 'booking_form_expired') {
        logger.warn('Retryable booking finish error', {
          status,
          partnerOrderId: request.partner_order_id,
        });
        throw new Error(`Retryable error: ${status}`);
      }

      logger.error('Booking finish error', {
        status,
        partnerOrderId: request.partner_order_id,
      });
      throw new Error(`Booking finish failed: ${status}`);
    } catch (error) {
      logger.error('Error in finishBooking', error);
      throw error;
    }
  }

  // Step 3: Check Booking Status (Polling)
  async checkBookingStatus(request: BookingStatusRequest): Promise<BookingStatusResponse> {
    try {
      const response = await etgClient.post<BookingStatusResponse>(
        '/api/b2b/v3/hotel/order/booking/finish/status/',
        request
      );

      const status = response.data.data?.status || response.data.status;

      logger.debug('Booking status checked', {
        partnerOrderId: request.partner_order_id,
        status,
      });

      return response.data;
    } catch (error) {
      logger.error('Error in checkBookingStatus', error);
      throw error;
    }
  }

  // Poll booking status until final state
  async pollBookingStatus(
    partnerOrderId: string,
    maxAttempts: number = 120,
    intervalMs: number = 1000
  ): Promise<BookingStatusResponse> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await this.checkBookingStatus({ partner_order_id: partnerOrderId });
      const status = response.data?.status;

      // Check for final success status
      if (status === BookingStatus.OK || status === BookingStatus.CONFIRMED) {
        logger.info('Booking confirmed', { partnerOrderId, attempts });
        return response;
      }

      // Check for final failure statuses
      if (
        [
          '3ds',
          'block',
          'book_limit',
          'booking_finish_did_not_succeed',
          'provider',
          'soldout',
        ].includes(status)
      ) {
        logger.error('Booking failed with final error', { partnerOrderId, status, attempts });
        throw new Error(`Booking failed: ${status}`);
      }

      // Continue polling for processing, timeout, unknown, 5xx errors
      if (
        status === BookingStatus.PROCESSING ||
        status === BookingStatus.TIMEOUT ||
        status === BookingStatus.UNKNOWN
      ) {
        logger.debug('Booking still processing', { partnerOrderId, status, attempts });
        await this.sleep(intervalMs);
        attempts++;
        continue;
      }

      // Unknown status - log and continue
      logger.warn('Unknown booking status', { partnerOrderId, status, attempts });
      await this.sleep(intervalMs);
      attempts++;
    }

    throw new Error(`Booking status polling timeout after ${maxAttempts} attempts`);
  }

  // Get Order Information
  async getOrderInfo(request: OrderInfoRequest): Promise<OrderInfoResponse> {
    try {
      const response = await etgClient.post<OrderInfoResponse>(
        '/api/b2b/v3/hotel/order/info/',
        request
      );

      logger.debug('Order info retrieved', { orderId: request.order_id });
      return response.data;
    } catch (error) {
      logger.error('Error in getOrderInfo', error);
      throw error;
    }
  }

  // Cancel Booking
  async cancelBooking(request: CancelBookingRequest): Promise<CancelBookingResponse> {
    try {
      const response = await etgClient.post<CancelBookingResponse>(
        '/api/b2b/v3/hotel/order/cancel/',
        request
      );

      const status = response.data.status;

      if (status === 'ok') {
        logger.info('Booking cancelled successfully', { orderId: request.order_id });
        return response.data;
      }

      // Retry once on timeout
      if (status === 'timeout') {
        logger.warn('Cancellation timeout, retrying', { orderId: request.order_id });
        await this.sleep(2000);
        return this.cancelBooking(request);
      }

      throw new Error(`Cancellation failed: ${status}`);
    } catch (error) {
      logger.error('Error in cancelBooking', error);
      throw error;
    }
  }

  // Generate unique partner order ID
  generatePartnerOrderId(): string {
    return `ETG-${Date.now()}-${uuidv4().substring(0, 8)}`;
  }

  // Helper: Sleep function
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default new BookingService();
