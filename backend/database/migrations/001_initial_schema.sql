-- Create hotels table
CREATE TABLE IF NOT EXISTS hotels (
  hid VARCHAR(255) PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  star_rating DECIMAL(2,1),
  address JSONB,
  amenities JSONB,
  images JSONB,
  metapolicy_struct JSONB,
  metapolicy_extra_info TEXT,
  region_id INTEGER,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hotels_region_id ON hotels(region_id);
CREATE INDEX idx_hotels_name ON hotels(name);

-- Create regions table
CREATE TABLE IF NOT EXISTS regions (
  id INTEGER PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  country_code VARCHAR(2),
  type VARCHAR(50),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8)
);

CREATE INDEX idx_regions_country_code ON regions(country_code);
CREATE INDEX idx_regions_name ON regions(name);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  partner_order_id VARCHAR(255) UNIQUE NOT NULL,
  etg_order_id VARCHAR(255),
  hotel_id VARCHAR(255) REFERENCES hotels(hid),
  status VARCHAR(50) NOT NULL,
  checkin_date DATE NOT NULL,
  checkout_date DATE NOT NULL,
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(50),
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  book_hash VARCHAR(500),
  prebook_hash VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_partner_order_id ON bookings(partner_order_id);
CREATE INDEX idx_bookings_etg_order_id ON bookings(etg_order_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);

-- Create booking_logs table for certification
CREATE TABLE IF NOT EXISTS booking_logs (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id),
  endpoint VARCHAR(255) NOT NULL,
  request JSONB NOT NULL,
  response JSONB NOT NULL,
  status_code INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_booking_logs_booking_id ON booking_logs(booking_id);
CREATE INDEX idx_booking_logs_created_at ON booking_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to bookings table
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE hotels IS 'Static hotel data from ETG dumps';
COMMENT ON TABLE regions IS 'Static region data from ETG dumps';
COMMENT ON TABLE bookings IS 'All booking records with status tracking';
COMMENT ON TABLE booking_logs IS 'API call logs for certification and debugging';
COMMENT ON COLUMN bookings.partner_order_id IS 'Our internal order ID';
COMMENT ON COLUMN bookings.etg_order_id IS 'ETG API order ID after booking confirmation';
COMMENT ON COLUMN bookings.book_hash IS 'Original hash from hotelpage (h-...)';
COMMENT ON COLUMN bookings.prebook_hash IS 'Transformed hash from prebook (p-...)';
