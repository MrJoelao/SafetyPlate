/**
 * Represents a single food item planned for a meal.
 */
export interface PlannedMealItem {
  /** The unique identifier of the food item, referencing the main food storage. */
  foodId: string;
  /** The quantity of the food item. */
  quantity: number;
  /** The unit of measurement for the quantity (e.g., 'g', 'ml', 'piece'). */
  unit: string;
}

/**
 * Represents the planned meals for a single day.
 */
export interface DailyPlan {
  /** Array of planned items for breakfast. */
  breakfast: PlannedMealItem[];
  /** Array of planned items for lunch. */
  lunch: PlannedMealItem[];
  /** Array of planned items for dinner. */
  dinner: PlannedMealItem[];
  /** Optional array of planned items for snacks. */
  snack?: PlannedMealItem[];
}

/**
 * Represents the entire planner data structure.
 * It's an object where keys are dates in 'YYYY-MM-DD' format,
 * and values are the corresponding DailyPlan objects.
 */
export type PlannerData = {
  [date: string]: DailyPlan;
};