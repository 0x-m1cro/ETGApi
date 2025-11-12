import apiClient from './client';
import type {
  SearchRegionRequest,
  SearchHotelsRequest,
  SearchGeoRequest,
  HotelpageRequest,
  PrebookRequest,
  SearchResponse,
  HotelpageResponse,
  PrebookResponse,
} from '../types';

export const searchAPI = {
  searchByRegion: async (data: SearchRegionRequest): Promise<SearchResponse> => {
    const response = await apiClient.post<SearchResponse>('/search/region', data);
    return response.data;
  },

  searchByHotels: async (data: SearchHotelsRequest): Promise<SearchResponse> => {
    const response = await apiClient.post<SearchResponse>('/search/hotels', data);
    return response.data;
  },

  searchByGeo: async (data: SearchGeoRequest): Promise<SearchResponse> => {
    const response = await apiClient.post<SearchResponse>('/search/geo', data);
    return response.data;
  },

  getHotelpage: async (data: HotelpageRequest): Promise<HotelpageResponse> => {
    const response = await apiClient.post<HotelpageResponse>('/search/hotelpage', data);
    return response.data;
  },

  prebookRate: async (data: PrebookRequest): Promise<PrebookResponse> => {
    const response = await apiClient.post<PrebookResponse>('/search/prebook', data);
    return response.data;
  },
};
