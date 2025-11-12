import { query } from '../config/database';
import { Booking, CreateBookingData, UpdateBookingData } from '../types/database.types';
import logger from '../config/logger';

class BookingRepository {
  async create(data: CreateBookingData): Promise<Booking> {
    const sql = `
      INSERT INTO bookings (
        partner_order_id, hotel_id, status, checkin_date, checkout_date,
        guest_name, guest_email, guest_phone, total_amount, currency,
        book_hash, prebook_hash
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      data.partner_order_id,
      data.hotel_id,
      data.status,
      data.checkin_date,
      data.checkout_date,
      data.guest_name,
      data.guest_email,
      data.guest_phone,
      data.total_amount,
      data.currency,
      data.book_hash,
      data.prebook_hash,
    ];

    try {
      const result = await query(sql, values);
      logger.info('Booking created', { partnerOrderId: data.partner_order_id });
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating booking', error);
      throw error;
    }
  }

  async findByPartnerOrderId(partnerOrderId: string): Promise<Booking | null> {
    const sql = 'SELECT * FROM bookings WHERE partner_order_id = $1';
    try {
      const result = await query(sql, [partnerOrderId]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding booking by partner order ID', error);
      throw error;
    }
  }

  async findByEtgOrderId(etgOrderId: string): Promise<Booking | null> {
    const sql = 'SELECT * FROM bookings WHERE etg_order_id = $1';
    try {
      const result = await query(sql, [etgOrderId]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding booking by ETG order ID', error);
      throw error;
    }
  }

  async update(partnerOrderId: string, data: UpdateBookingData): Promise<Booking> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.etg_order_id !== undefined) {
      fields.push(`etg_order_id = $${paramIndex++}`);
      values.push(data.etg_order_id);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }
    if (data.book_hash !== undefined) {
      fields.push(`book_hash = $${paramIndex++}`);
      values.push(data.book_hash);
    }
    if (data.prebook_hash !== undefined) {
      fields.push(`prebook_hash = $${paramIndex++}`);
      values.push(data.prebook_hash);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(partnerOrderId);

    const sql = `
      UPDATE bookings 
      SET ${fields.join(', ')}
      WHERE partner_order_id = $${paramIndex}
      RETURNING *
    `;

    try {
      const result = await query(sql, values);
      logger.info('Booking updated', { partnerOrderId });
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating booking', error);
      throw error;
    }
  }

  async findAll(limit: number = 100, offset: number = 0): Promise<Booking[]> {
    const sql = 'SELECT * FROM bookings ORDER BY created_at DESC LIMIT $1 OFFSET $2';
    try {
      const result = await query(sql, [limit, offset]);
      return result.rows;
    } catch (error) {
      logger.error('Error finding all bookings', error);
      throw error;
    }
  }

  async logApiCall(
    bookingId: number,
    endpoint: string,
    requestData: Record<string, unknown>,
    responseData: Record<string, unknown>,
    statusCode: number
  ): Promise<void> {
    const sql = `
      INSERT INTO booking_logs (booking_id, endpoint, request, response, status_code)
      VALUES ($1, $2, $3, $4, $5)
    `;

    const values = [
      bookingId,
      endpoint,
      JSON.stringify(requestData),
      JSON.stringify(responseData),
      statusCode,
    ];

    try {
      await query(sql, values);
      logger.debug('API call logged', { bookingId, endpoint });
    } catch (error) {
      logger.error('Error logging API call', error);
      // Don't throw - logging failure shouldn't break the main flow
    }
  }
}

export default new BookingRepository();
