/**
 * Base storage module for persistent data management
 * 
 * This module provides a base class for storing and retrieving data with
 * versioning, validation, and migration capabilities. It's designed to be
 * extended by specific storage implementations.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Result of a storage operation
 * @template T The type of data returned in the result
 */
export interface StorageResult<T> {
  /** Whether the operation was successful */
  success: boolean;
  /** The data returned by the operation (if successful) */
  data?: T;
  /** Error message (if operation failed) */
  error?: string;
}

/**
 * Base storage class with versioning and validation
 * @template T The type of data to be stored
 */
export class BaseStorage<T> {
  /** Key used to store data in AsyncStorage */
  protected storageKey: string;

  /** Current version of the data schema */
  protected version: number;

  /** Array of validator functions to ensure data integrity */
  protected validators: ((data: any) => boolean)[];

  /**
   * Create a new BaseStorage instance
   * @param storageKey Key used to store data in AsyncStorage
   * @param version Current version of the data schema (defaults to 1)
   * @param validators Array of validator functions to ensure data integrity
   */
  constructor(storageKey: string, version: number = 1, validators: ((data: any) => boolean)[] = []) {
    this.storageKey = storageKey;
    this.version = version;
    this.validators = validators;
  }

  /**
   * Save data to storage with versioning
   * 
   * This method validates the data, adds version information, and saves it to AsyncStorage.
   * It handles errors and returns a standardized result object.
   * 
   * @param data The data to save
   * @returns A promise that resolves to a StorageResult containing the saved data or an error
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
   * 
   * This method retrieves data from AsyncStorage, parses it, and handles version migrations
   * if necessary. It also provides backward compatibility for legacy data formats.
   * 
   * @returns A promise that resolves to a StorageResult containing the loaded data or an error
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
   * 
   * This method removes all data associated with the current storage key from AsyncStorage.
   * It handles errors and returns a standardized result object.
   * 
   * @returns A promise that resolves to a StorageResult indicating success or failure
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
   * 
   * This method runs all validator functions on the provided data to ensure
   * it meets the required format and constraints. If any validator fails,
   * the data is considered invalid.
   * 
   * @param data The data to validate
   * @returns true if the data passes all validators, false otherwise
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
   * 
   * This method is called when data with an older version is loaded. It should
   * transform the data to match the current version's schema. The default
   * implementation simply returns the data as-is with a warning.
   * 
   * @param data The data to migrate
   * @param fromVersion The version of the data being migrated
   * @returns A promise that resolves to the migrated data
   * @virtual Override this method in subclasses to implement specific migration logic
   */
  protected async migrateData(data: any, fromVersion: number): Promise<T> {
    // Default implementation just returns the data as is
    // Subclasses should override this to implement proper migration
    console.warn(`Data migration from version ${fromVersion} to ${this.version} not implemented`);
    return data as T;
  }
}
