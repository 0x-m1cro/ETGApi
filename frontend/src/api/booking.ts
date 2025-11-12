import apiClient from './client';
import type {
  CreateBookingRequest,
  BookingResponse,
  GetBookingResponse,
  CancelBookingResponse,
} from '../types';

export const bookingAPI = {
  createBooking: async (data: CreateBookingRequest): Promise<BookingResponse> => {
    const response = await apiClient.post<BookingResponse>('/booking', data);
    return response.data;
  },

  getBooking: async (orderId: string): Promise<GetBookingResponse> => {
    const response = await apiClient.get<GetBookingResponse>(`/booking/${orderId}`);
    return response.data;
  },

  cancelBooking: async (orderId: string): Promise<CancelBookingResponse> => {
    const response = await apiClient.post<CancelBookingResponse>(`/booking/${orderId}/cancel`);
    return response.data;
  },
};
