import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import config from '../config';
import logger from '../config/logger';

class ETGClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.etg.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': config.etg.userAgent,
      },
      auth: {
        username: config.etg.keyId,
        password: config.etg.apiKey,
      },
      timeout: config.etg.timeout.search,
    });

    // Configure retry logic
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        // Retry on network errors or 5xx errors
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          (error.response?.status !== undefined && error.response.status >= 500)
        );
      },
      onRetry: (retryCount, error, requestConfig) => {
        logger.warn('Retrying ETG API request', {
          retryCount,
          url: requestConfig.url,
          error: error.message,
        });
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug('ETG API Request', {
          method: config.method,
          url: config.url,
          data: config.data,
        });
        return config;
      },
      (error) => {
        logger.error('ETG API Request Error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('ETG API Response', {
          status: response.status,
          url: response.config.url,
          data: response.data,
        });
        return response;
      },
      (error) => {
        logger.error('ETG API Response Error', {
          status: error.response?.status,
          url: error.config?.url,
          data: error.response?.data,
        });
        return Promise.reject(error);
      }
    );
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  isRetryableError(status: string): boolean {
    const retryableStatuses = ['timeout', 'unknown'];
    return retryableStatuses.includes(status);
  }

  isFinalError(status: string): boolean {
    const finalErrorStatuses = [
      'contract_mismatch',
      'rate_not_found',
      '3ds',
      'block',
      'book_limit',
      'booking_finish_did_not_succeed',
      'provider',
      'soldout',
    ];
    return finalErrorStatuses.includes(status);
  }
}

export default new ETGClient();
