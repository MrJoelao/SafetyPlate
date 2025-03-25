export interface Food {
  id: string
  name: string
  score: number
  defaultUnit: string
  nutritionPer100g?: {
    calories?: number
    proteins?: number
    carbs?: number
    fats?: number
  }
}

