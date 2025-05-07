import { ApiResponse, RequestOptions } from './types';
import { ApiService } from './interfaces';

/**
 * Base API service implementation
 * Handles common HTTP operations, error handling, and request configuration
 */
export class BaseApiService implements ApiService {
  protected baseUrl: string;
  protected defaultHeaders: Record<string, string>;
  protected defaultTimeout: number;

  constructor(
    baseUrl: string,
    defaultHeaders: Record<string, string> = {},
    defaultTimeout: number = 10000
  ) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...defaultHeaders,
    };
    this.defaultTimeout = defaultTimeout;
  }

  /**
   * Perform a GET request
   */
  public async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  /**
   * Perform a POST request
   */
  public async post<T, D>(endpoint: string, data: D, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, options);
  }

  /**
   * Perform a PUT request
   */
  public async put<T, D>(endpoint: string, data: D, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  /**
   * Perform a DELETE request
   */
  public async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  /**
   * Generic request method that handles all HTTP methods
   */
  protected async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(endpoint, options?.params);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options?.timeout || this.defaultTimeout);

      const response = await fetch(url, {
        method,
        headers: {
          ...this.defaultHeaders,
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
        cache: options?.cache || 'default',
      });

      clearTimeout(timeoutId);

      const responseData = await this.parseResponse<T>(response);
      return {
        success: response.ok,
        data: responseData,
        statusCode: response.status,
        error: response.ok ? undefined : `Request failed with status ${response.status}`,
      };
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Build the full URL with query parameters
   */
  protected buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    return url.toString();
  }

  /**
   * Parse the response based on content type
   */
  protected async parseResponse<T>(response: Response): Promise<T | undefined> {
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      return await response.json();
    } else if (contentType?.includes('text/')) {
      const text = await response.text();
      return text as unknown as T;
    }
    
    return undefined;
  }

  /**
   * Handle request errors
   */
  protected handleError<T>(error: unknown): ApiResponse<T> {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timed out',
          statusCode: 408,
        };
      }
      
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: 'Unknown error occurred',
    };
  }
}