// ETG API Request and Response Types

export interface SearchRequest {
  checkin: string; // YYYY-MM-DD
  checkout: string; // YYYY-MM-DD
  residency: string; // ISO country code
  language: string; // en, es, etc.
  guests: GuestRoom[];
  currency?: string;
}

export interface RegionSearchRequest extends SearchRequest {
  region_id: number;
}

export interface HotelSearchRequest extends SearchRequest {
  ids: string[]; // hotel IDs (max 300)
}

export interface GeoSearchRequest extends SearchRequest {
  latitude: number;
  longitude: number;
  radius: number;
}

export interface GuestRoom {
  adults: number; // max 6
  children: number[]; // ages, max 4
}

export interface HotelSearchResponse {
  data: {
    hotels: HotelSearchResult[];
  };
  status: string;
}

export interface HotelSearchResult {
  id: string;
  rates: RateInfo[];
}

export interface RateInfo {
  book_hash: string;
  match_hash?: string;
  daily_prices: number[];
  payment_options: {
    payment_types: PaymentType[];
  };
}

export interface HotelpageRequest {
  id: string; // hotel ID
  checkin: string;
  checkout: string;
  residency: string;
  language: string;
  guests: GuestRoom[];
  currency?: string;
}

export interface HotelpageResponse {
  data: {
    hotel: HotelDetails;
  };
  status: string;
}

export interface HotelDetails {
  id: string;
  rates: RateDetails[];
}

export interface RateDetails {
  book_hash: string;
  match_hash?: string;
  room_name: string;
  room_data_trans: {
    main_room_type: string;
  };
  meal: string;
  meal_data: {
    value: string;
  };
  payment_options: {
    payment_types: PaymentType[];
  };
  cancellation_penalties: CancellationPenalties;
  tax_data: {
    taxes: TaxInfo[];
  };
  daily_prices: number[];
  rg_ext: {
    [key: string]: string | number;
  };
}

export interface PaymentType {
  amount: number;
  show_amount: number;
  currency_code: string;
  show_currency_code: string;
  by: string;
  is_need_credit_card_data: boolean;
  is_need_cvc: boolean;
}

export interface CancellationPenalties {
  free_cancellation_before: string | null;
  policies: CancellationPolicy[];
}

export interface CancellationPolicy {
  start_at: string;
  end_at: string | null;
  amount_charge: number;
  currency_code: string;
}

export interface TaxInfo {
  amount: number;
  currency_code: string;
  is_included: boolean;
  included_by_supplier: boolean;
  name: string;
}

export interface PrebookRequest {
  hash: string; // book_hash from hotelpage
  price_increase_percent?: number; // 0-100%
}

export interface PrebookResponse {
  data: {
    book_hash: string; // transformed to p-...
    hotel: {
      id: string;
    };
    rate: RateDetails;
  };
  status: string;
}

export interface BookingFormRequest {
  partner_order_id: string;
  book_hash: string; // p-... from prebook
  user: {
    email: string;
    phone?: string;
  };
  language: string;
}

export interface BookingFormResponse {
  data: {
    partner_order_id: string;
  };
  status: string;
}

export interface BookingFinishRequest {
  partner_order_id: string;
  payment_type: string;
  holder: {
    name: string;
    surname: string;
  };
  guests: BookingGuest[];
}

export interface BookingGuest {
  name: string;
  surname: string;
  is_child?: boolean;
}

export interface BookingFinishResponse {
  data: {
    order_id: string;
  };
  status: string;
}

export interface BookingStatusRequest {
  partner_order_id: string;
}

export interface BookingStatusResponse {
  data: {
    status: BookingStatus;
    order_id?: string;
    hotel?: {
      name: string;
    };
  };
  status: string;
}

export enum BookingStatus {
  PROCESSING = 'processing',
  OK = 'ok',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown',
}

export interface OrderInfoRequest {
  order_id: string;
}

export interface OrderInfoResponse {
  data: {
    partner_order_id: string;
    order_id: string;
    status: string;
    hotel: {
      name: string;
      checkin: string;
      checkout: string;
    };
  };
  status: string;
}

export interface CancelBookingRequest {
  order_id: string;
}

export interface CancelBookingResponse {
  data: {
    status: string;
  };
  status: string;
}

export interface ETGError {
  status: string;
  errors?: string[];
}
