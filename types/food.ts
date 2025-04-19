export interface Food {
  id: string
  name: string
  score: number
  defaultUnit: string
  imageUri?: string // New property for storing image URI
  nutritionPer100g?: {
    calories?: number
    proteins?: number
    carbs?: number
    fats?: number
  }
}
