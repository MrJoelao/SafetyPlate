import type { Food } from "./food"

/**
 * Generic storage result interface
 * @template T The type of data returned in the result
 */
export interface GenericStorageResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * @deprecated Use GenericStorageResult<Food[]> instead
 * Legacy parse result interface for backward compatibility
 */
export interface ParseResult {
  success: boolean
  foods?: Food[]
  error?: string
}

/**
 * @deprecated Use GenericStorageResult<Food[]> instead
 * Legacy storage result interface for backward compatibility
 */
export interface StorageResult {
  success: boolean
  foods?: Food[]
  error?: string
}

/**
 * Helper function to convert from GenericStorageResult to legacy StorageResult
 */
export function toLegacyResult(result: GenericStorageResult<Food[]>): StorageResult {
  return {
    success: result.success,
    foods: result.data,
    error: result.error,
  };
}

/**
 * Helper function to convert from legacy StorageResult to GenericStorageResult
 */
export function fromLegacyResult(result: StorageResult): GenericStorageResult<Food[]> {
  return {
    success: result.success,
    data: result.foods,
    error: result.error,
  };
}
