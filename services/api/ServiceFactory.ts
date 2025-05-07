import { FoodApiService, UserPreferencesApiService, ApiService } from './interfaces';
import { mockFoodApiService } from './mock/MockFoodApiService';
import { CachedApiService } from './CachedApiService';

/**
 * Service factory for creating API service instances
 * Provides the appropriate implementation based on the environment
 */
export class ServiceFactory {
  private static instance: ServiceFactory;
  private useMock: boolean;

  private constructor() {
    // Default to using mock services in development
    this.useMock = process.env.NODE_ENV !== 'production';
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  /**
   * Set whether to use mock services
   */
  public setUseMock(useMock: boolean): void {
    this.useMock = useMock;
  }

  // Cache for services
  private cachedServices: Map<string, ApiService> = new Map();

  /**
   * Get the appropriate food API service
   */
  public getFoodApiService(): FoodApiService {
    // Check if we already have a cached instance
    const cacheKey = 'food_api_service';
    if (this.cachedServices.has(cacheKey)) {
      return this.cachedServices.get(cacheKey) as FoodApiService;
    }

    // Get the base service
    const baseService = this.useMock ? mockFoodApiService : mockFoodApiService; // Use mock for now

    // Wrap with caching
    const cachedService = new CachedApiService(baseService, {
      prefix: 'food_api_cache_',
      ttl: 1000 * 60 * 60 * 24, // 24 hours
    }) as unknown as FoodApiService;

    // Store in cache
    this.cachedServices.set(cacheKey, cachedService);

    return cachedService;
  }

  /**
   * Get the appropriate user preferences API service
   */
  public getUserPreferencesApiService(): UserPreferencesApiService {
    if (this.useMock) {
      // When we implement the mock user preferences service, return it here
      // For now, throw an error
      throw new Error('Mock user preferences service not implemented yet');
    }

    // In the future, return a real implementation
    // For now, throw an error
    throw new Error('Real user preferences service not implemented yet');
  }
}

// Export a singleton instance
export const serviceFactory = ServiceFactory.getInstance();
