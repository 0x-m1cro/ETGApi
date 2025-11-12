import etgClient from './etg-client';
import redis from '../config/redis';
import config from '../config';
import logger from '../config/logger';
import {
  RegionSearchRequest,
  HotelSearchRequest,
  GeoSearchRequest,
  HotelSearchResponse,
  HotelpageRequest,
  HotelpageResponse,
  PrebookRequest,
  PrebookResponse,
} from '../types/etg.types';

class SearchService {
  // Step 1: Search by Region
  async searchByRegion(request: RegionSearchRequest): Promise<HotelSearchResponse> {
    try {
      const response = await etgClient.post<HotelSearchResponse>(
        '/api/b2b/v3/search/serp/region/',
        request,
        { timeout: config.etg.timeout.search }
      );
      return response.data;
    } catch (error) {
      logger.error('Error in searchByRegion', error);
      throw error;
    }
  }

  // Step 1: Search by Hotel IDs (max 300 per request)
  async searchByHotels(request: HotelSearchRequest): Promise<HotelSearchResponse> {
    try {
      if (request.ids.length > 300) {
        throw new Error('Maximum 300 hotel IDs allowed per request');
      }

      const response = await etgClient.post<HotelSearchResponse>(
        '/api/b2b/v3/search/serp/hotels/',
        request,
        { timeout: config.etg.timeout.search }
      );
      return response.data;
    } catch (error) {
      logger.error('Error in searchByHotels', error);
      throw error;
    }
  }

  // Step 1: Search by Geo Location
  async searchByGeo(request: GeoSearchRequest): Promise<HotelSearchResponse> {
    try {
      const response = await etgClient.post<HotelSearchResponse>(
        '/api/b2b/v3/search/serp/geo/',
        request,
        { timeout: config.etg.timeout.search }
      );
      return response.data;
    } catch (error) {
      logger.error('Error in searchByGeo', error);
      throw error;
    }
  }

  // Step 2: Get Hotel Page Details with caching (1 hour TTL)
  async getHotelpage(request: HotelpageRequest): Promise<HotelpageResponse> {
    try {
      const cacheKey = `hotelpage:${JSON.stringify(request)}`;

      // Check cache first
      const cached = await redis.get(cacheKey);
      if (cached) {
        logger.debug('Hotelpage cache hit', { hotelId: request.id });
        return JSON.parse(cached);
      }

      const response = await etgClient.post<HotelpageResponse>('/api/b2b/v3/search/hp/', request, {
        timeout: config.etg.timeout.search,
      });

      // Cache the response
      await redis.setex(cacheKey, config.cache.ttl.hotelpage, JSON.stringify(response.data));

      logger.debug('Hotelpage cached', { hotelId: request.id });
      return response.data;
    } catch (error) {
      logger.error('Error in getHotelpage', error);
      throw error;
    }
  }

  // Step 3: Prebook Rate Verification (MANDATORY - NO CACHING)
  async prebookRate(request: PrebookRequest): Promise<PrebookResponse> {
    try {
      // Set default price_increase_percent if not provided
      const prebookData = {
        hash: request.hash,
        price_increase_percent: request.price_increase_percent ?? 0,
      };

      const response = await etgClient.post<PrebookResponse>(
        '/api/b2b/v3/hotel/prebook',
        prebookData,
        { timeout: config.etg.timeout.prebook }
      );

      // Check if book_hash was transformed from h-... to p-...
      if (response.data.data?.book_hash) {
        logger.info('Prebook successful - hash transformed', {
          originalHash: request.hash,
          prebookHash: response.data.data.book_hash,
        });
      }

      return response.data;
    } catch (error) {
      logger.error('Error in prebookRate', error);
      throw error;
    }
  }

  // Helper: Validate search dates
  validateSearchDates(checkin: string, checkout: string): void {
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check-in must be in the future
    if (checkinDate < today) {
      throw new Error('Check-in date must be in the future');
    }

    // Check-in must be within 730 days
    const maxCheckinDate = new Date();
    maxCheckinDate.setDate(maxCheckinDate.getDate() + 730);
    if (checkinDate > maxCheckinDate) {
      throw new Error('Check-in date must be within 730 days from today');
    }

    // Checkout must be after checkin
    if (checkoutDate <= checkinDate) {
      throw new Error('Check-out date must be after check-in date');
    }

    // Maximum 30 nights
    const nights = Math.ceil(
      (checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (nights > 30) {
      throw new Error('Maximum stay is 30 nights');
    }
  }

  // Helper: Validate guest counts
  validateGuests(guests: { adults: number; children: number[] }[]): void {
    if (guests.length > 9) {
      throw new Error('Maximum 9 rooms per booking');
    }

    guests.forEach((room, index) => {
      if (room.adults > 6) {
        throw new Error(`Room ${index + 1}: Maximum 6 adults per room`);
      }
      if (room.children.length > 4) {
        throw new Error(`Room ${index + 1}: Maximum 4 children per room`);
      }
      // Validate children ages (must be <= 17)
      room.children.forEach((age) => {
        if (age > 17) {
          throw new Error(`Room ${index + 1}: Children must be 17 years or younger`);
        }
      });
    });
  }
}

export default new SearchService();
