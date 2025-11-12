// Search Types
export interface Guest {
  adults: number;
  children: number[];
}

export interface SearchRegionRequest {
  region_id: string;
  checkin: string; // YYYY-MM-DD
  checkout: string; // YYYY-MM-DD
  guests: Guest[];
  residency: string;
  language?: string;
  currency?: string;
}

export interface SearchHotelsRequest {
  ids: string[];
  checkin: string;
  checkout: string;
  guests: Guest[];
  residency: string;
  language?: string;
  currency?: string;
}

export interface SearchGeoRequest {
  lat: number;
  lon: number;
  radius: number;
  checkin: string;
  checkout: string;
  guests: Guest[];
  residency: string;
  language?: string;
  currency?: string;
}

export interface HotelpageRequest {
  id: string;
  checkin: string;
  checkout: string;
  guests: Guest[];
  residency: string;
  language?: string;
  currency?: string;
}

export interface PrebookRequest {
  book_hash: string;
  price_increase_percent?: number;
}

// Response Types
export interface HotelRate {
  book_hash: string;
  room_name: string;
  meal: string;
  amount: number;
  currency: string;
  cancellation_penalties?: {
    policies: Array<{
      charge: number;
      penalty_starts_on: string;
      penalty_ends_on: string | null;
    }>;
    free_cancellation_before: string | null;
  };
  included_by_supplier?: boolean;
}

export interface Hotel {
  id: string;
  name: string;
  address?: string;
  star_rating?: number;
  images?: string[];
  rates: HotelRate[];
}

export interface SearchResponse {
  status: string;
  data: {
    hotels: Hotel[];
  };
}

export interface HotelpageResponse {
  status: string;
  data: {
    hotel: Hotel;
    rates: HotelRate[];
  };
}

export interface PrebookResponse {
  status: string;
  data: {
    book_hash: string;
    amount: number;
    currency: string;
    price_changed: boolean;
    alternative_rates?: HotelRate[];
  };
}

// Booking Types
export interface UserInfo {
  email: string;
  phone: string;
}

export interface HolderInfo {
  name: string;
  surname: string;
}

export interface GuestInfo {
  name: string;
  surname: string;
  is_child: boolean;
  age?: number;
}

export interface CreateBookingRequest {
  book_hash: string;
  hotel_id: string;
  checkin: string;
  checkout: string;
  total_amount: number;
  currency: string;
  user: UserInfo;
  holder: HolderInfo;
  guests: GuestInfo[];
  payment_type?: string;
  language?: string;
}

export interface BookingResponse {
  status: string;
  data: {
    partner_order_id: string;
    etg_order_id?: string;
    booking_status: string;
  };
}

export interface Booking {
  id: number;
  partner_order_id: string;
  etg_order_id: string | null;
  hotel_id: string;
  status: string;
  checkin_date: string;
  checkout_date: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  total_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface GetBookingResponse {
  status: string;
  data: {
    booking: Booking;
    etg_info?: any;
  };
}

export interface CancelBookingResponse {
  status: string;
  data: {
    order_id: string;
    status: string;
  };
}
