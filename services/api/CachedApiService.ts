import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, RequestOptions } from './types';
import { ApiService } from './interfaces';
import { BaseApiService } from './BaseApiService';
import NetInfo from '@react-native-community/netinfo';

/**
 * Cache configuration
 */
interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in milliseconds
  prefix: string;
}

/**
 * Cached item structure
 */
interface CachedItem<T> {
  data: ApiResponse<T>;
  timestamp: number;
}

/**
 * API service with caching and offline support
 * Wraps another API service and adds caching capabilities
 */
export class CachedApiService implements ApiService {
  private apiService: ApiService;
  private cacheConfig: CacheConfig;
  
  constructor(
    apiService: ApiService,
    cacheConfig: Partial<CacheConfig> = {}
  ) {
    this.apiService = apiService;
    this.cacheConfig = {
      enabled: true,
      ttl: 1000 * 60 * 60, // 1 hour by default
      prefix: 'api_cache_',
      ...cacheConfig,
    };
  }
  
  /**
   * Perform a GET request with caching
   */
  public async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    const cacheKey = this.getCacheKey('GET', endpoint, options?.params);
    
    // Try to get from cache first if caching is enabled
    if (this.cacheConfig.enabled && (!options?.cache || options.cache !== 'no-store')) {
      const cachedResponse = await this.getFromCache<T>(cacheKey);
      
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    // Check if we're online
    const networkState = await NetInfo.fetch();
    
    if (!networkState.isConnected) {
      // If we're offline and have a cached response (even if expired), use it
      const cachedResponse = await this.getFromCache<T>(cacheKey, true);
      
      if (cachedResponse) {
        return {
          ...cachedResponse,
          // Add a flag to indicate this is from cache while offline
          _fromOfflineCache: true,
        };
      }
      
      // If we're offline and don't have a cached response, return an error
      return {
        success: false,
        error: 'No network connection',
        statusCode: 0,
      };
    }
    
    // If we're online, make the request
    try {
      const response = await this.apiService.get<T>(endpoint, options);
      
      // Cache successful responses
      if (response.success && this.cacheConfig.enabled) {
        await this.saveToCache(cacheKey, response);
      }
      
      return response;
    } catch (error) {
      // If the request fails, try to get from cache (even if expired)
      if (this.cacheConfig.enabled) {
        const cachedResponse = await this.getFromCache<T>(cacheKey, true);
        
        if (cachedResponse) {
          return {
            ...cachedResponse,
            // Add a flag to indicate this is from cache due to error
            _fromErrorCache: true,
          };
        }
      }
      
      // If we don't have a cached response, rethrow the error
      throw error;
    }
  }
  
  /**
   * Perform a POST request
   * POST requests are not cached
   */
  public async post<T, D>(endpoint: string, data: D, options?: RequestOptions): Promise<ApiResponse<T>> {
    // Check if we're online
    const networkState = await NetInfo.fetch();
    
    if (!networkState.isConnected) {
      return {
        success: false,
        error: 'No network connection',
        statusCode: 0,
      };
    }
    
    return this.apiService.post<T, D>(endpoint, data, options);
  }
  
  /**
   * Perform a PUT request
   * PUT requests are not cached
   */
  public async put<T, D>(endpoint: string, data: D, options?: RequestOptions): Promise<ApiResponse<T>> {
    // Check if we're online
    const networkState = await NetInfo.fetch();
    
    if (!networkState.isConnected) {
      return {
        success: false,
        error: 'No network connection',
        statusCode: 0,
      };
    }
    
    return this.apiService.put<T, D>(endpoint, data, options);
  }
  
  /**
   * Perform a DELETE request
   * DELETE requests are not cached
   */
  public async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    // Check if we're online
    const networkState = await NetInfo.fetch();
    
    if (!networkState.isConnected) {
      return {
        success: false,
        error: 'No network connection',
        statusCode: 0,
      };
    }
    
    return this.apiService.delete<T>(endpoint, options);
  }
  
  /**
   * Clear all cached data
   */
  public async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.cacheConfig.prefix));
      
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
  
  /**
   * Get a cache key for a request
   */
  private getCacheKey(method: string, endpoint: string, params?: Record<string, string>): string {
    let key = `${this.cacheConfig.prefix}${method}_${endpoint}`;
    
    if (params) {
      // Sort params to ensure consistent cache keys
      const sortedParams = Object.entries(params)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .map(([k, v]) => `${k}=${v}`)
        .join('&');
      
      key += `_${sortedParams}`;
    }
    
    return key;
  }
  
  /**
   * Get a response from cache
   */
  private async getFromCache<T>(key: string, ignoreExpiry: boolean = false): Promise<ApiResponse<T> | null> {
    try {
      const cachedData = await AsyncStorage.getItem(key);
      
      if (!cachedData) {
        return null;
      }
      
      const cached = JSON.parse(cachedData) as CachedItem<T>;
      const now = Date.now();
      
      // Check if the cache is expired
      if (!ignoreExpiry && now - cached.timestamp > this.cacheConfig.ttl) {
        return null;
      }
      
      return cached.data;
    } catch (error) {
      console.error('Error getting from cache:', error);
      return null;
    }
  }
  
  /**
   * Save a response to cache
   */
  private async saveToCache<T>(key: string, data: ApiResponse<T>): Promise<void> {
    try {
      const cachedItem: CachedItem<T> = {
        data,
        timestamp: Date.now(),
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(cachedItem));
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }
}