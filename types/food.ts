export interface NutritionInfo {
  calories?: number
  proteins?: number
  carbs?: number
  fats?: number
}

export interface FoodBase {
  name: string
  score: number
  defaultUnit: string
  imageUri?: string
  nutritionPer100g?: NutritionInfo
}

export interface Food extends FoodBase {
  id: string
}

export interface FoodFormData {
  name: string
  score: string
  defaultUnit: string
  calories: string
  proteins: string
  carbs: string
  fats: string
  imageUri?: string
}

export interface FoodStorageResult {
  success: boolean
  error?: string
  foods?: Food[]
}

export interface FoodManagerMode {
  list: "list"
  edit: "edit"
}

export type FoodManagerViewMode = keyof FoodManagerMode
