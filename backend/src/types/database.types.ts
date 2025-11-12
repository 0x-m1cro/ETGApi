// Database Models

export interface Hotel {
  hid: string;
  name: string;
  star_rating?: number;
  address?: Record<string, unknown>;
  amenities?: Record<string, unknown>;
  images?: Record<string, unknown>;
  metapolicy_struct?: Record<string, unknown>;
  metapolicy_extra_info?: string;
  region_id?: number;
  last_updated: Date;
}

export interface Region {
  id: number;
  name: string;
  country_code: string;
  type: string;
  latitude?: number;
  longitude?: number;
}

export interface Booking {
  id: number;
  partner_order_id: string;
  etg_order_id?: string;
  hotel_id: string;
  status: string;
  checkin_date: Date;
  checkout_date: Date;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  total_amount: number;
  currency: string;
  book_hash?: string;
  prebook_hash?: string;
  created_at: Date;
  updated_at: Date;
}

export interface BookingLog {
  id: number;
  booking_id: number;
  endpoint: string;
  request: Record<string, unknown>;
  response: Record<string, unknown>;
  status_code: number;
  created_at: Date;
}

export interface CreateBookingData {
  partner_order_id: string;
  hotel_id: string;
  status: string;
  checkin_date: Date;
  checkout_date: Date;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  total_amount: number;
  currency: string;
  book_hash?: string;
  prebook_hash?: string;
}

export interface UpdateBookingData {
  etg_order_id?: string;
  status?: string;
  book_hash?: string;
  prebook_hash?: string;
  updated_at?: Date;
}
