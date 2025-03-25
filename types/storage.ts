import type { Food } from "./food"

export interface ParseResult {
  success: boolean
  foods?: Food[]
  error?: string
}

export interface StorageResult {
  success: boolean
  foods?: Food[]
  error?: string
}

