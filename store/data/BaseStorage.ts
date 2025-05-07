import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class BaseStorage<T> {
  protected storageKey: string;
  protected version: number;
  protected validators: ((data: any) => boolean)[];

  constructor(storageKey: string, version: number = 1, validators: ((data: any) => boolean)[] = []) {
    this.storageKey = storageKey;
    this.version = version;
    this.validators = validators;
  }

  /**
   * Save data to storage with versioning
   */
  protected async saveData(data: T): Promise<StorageResult<T>> {
    try {
      // Validate data before saving
      if (!this.validateData(data)) {
        return {
          success: false,
          error: 'Data validation failed',
        };
      }

      // Add version information
      const versionedData = {
        version: this.version,
        data,
      };

      const jsonData = JSON.stringify(versionedData);
      await AsyncStorage.setItem(this.storageKey, jsonData);
      
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`Error saving data to ${this.storageKey}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred while saving data',
      };
    }
  }

  /**
   * Load data from storage with version checking
   */
  protected async loadData(): Promise<StorageResult<T>> {
    try {
      const jsonData = await AsyncStorage.getItem(this.storageKey);
      
      if (!jsonData) {
        return {
          success: true,
          data: undefined,
        };
      }

      const parsedData = JSON.parse(jsonData);
      
      // Check if data has version information
      if (parsedData.version !== undefined && parsedData.data !== undefined) {
        // Handle version migration if needed
        if (parsedData.version < this.version) {
          const migratedData = await this.migrateData(parsedData.data, parsedData.version);
          return {
            success: true,
            data: migratedData,
          };
        }
        
        // Return the data
        return {
          success: true,
          data: parsedData.data as T,
        };
      } else {
        // Legacy data without version - assume it's the raw data
        // This handles backward compatibility with existing data
        return {
          success: true,
          data: parsedData as T,
        };
      }
    } catch (error) {
      console.error(`Error loading data from ${this.storageKey}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred while loading data',
      };
    }
  }

  /**
   * Clear all data from storage
   */
  protected async clearData(): Promise<StorageResult<void>> {
    try {
      await AsyncStorage.removeItem(this.storageKey);
      return {
        success: true,
      };
    } catch (error) {
      console.error(`Error clearing data from ${this.storageKey}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred while clearing data',
      };
    }
  }

  /**
   * Validate data using provided validators
   */
  protected validateData(data: any): boolean {
    if (!data) return false;
    
    // Run all validators
    for (const validator of this.validators) {
      if (!validator(data)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Migrate data from an older version to the current version
   * Override this method in subclasses to implement specific migration logic
   */
  protected async migrateData(data: any, fromVersion: number): Promise<T> {
    // Default implementation just returns the data as is
    // Subclasses should override this to implement proper migration
    console.warn(`Data migration from version ${fromVersion} to ${this.version} not implemented`);
    return data as T;
  }
}