import AsyncStorage from "@react-native-async-storage/async-storage";
import { DailyPlan, PlannerData, PlannedMealItem } from "@/types/planner"; // Assicurati che il percorso sia corretto

const PLANNER_STORAGE_KEY = "@SafetyPlate:plannerData";

/**
 * Loads the entire planner data from AsyncStorage.
 * @returns A promise that resolves with the PlannerData object, or an empty object if no data is found or an error occurs.
 */
export const loadPlannerData = async (): Promise<PlannerData> => {
  try {
    const jsonValue = await AsyncStorage.getItem(PLANNER_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : {};
  } catch (e) {
    console.error("Failed to load planner data from storage", e);
    return {}; // Return empty object on error
  }
};

/**
 * Saves the entire planner data to AsyncStorage.
 * @param data The PlannerData object to save.
 * @returns A promise that resolves when the data is saved, or rejects on error.
 */
export const savePlannerData = async (data: PlannerData): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(PLANNER_STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error("Failed to save planner data to storage", e);
    // Consider re-throwing or handling the error more specifically
  }
};

/**
 * Retrieves the daily plan for a specific date.
 * @param date The date string in 'YYYY-MM-DD' format.
 * @returns A promise that resolves with the DailyPlan object for the given date, or null if not found.
 */
export const getDailyPlan = async (date: string): Promise<DailyPlan | null> => {
  const plannerData = await loadPlannerData();
  return plannerData[date] || null;
};

/**
 * Updates or creates the daily plan for a specific date.
 * Initializes meal arrays if they don't exist.
 * @param date The date string in 'YYYY-MM-DD' format.
 * @param plan The DailyPlan object to save for the given date.
 * @returns A promise that resolves when the data is updated.
 */
export const updateDailyPlan = async (date: string, plan: DailyPlan): Promise<void> => {
  const plannerData = await loadPlannerData();
  // Ensure meal arrays are initialized
  const validatedPlan: DailyPlan = {
    breakfast: plan.breakfast || [],
    lunch: plan.lunch || [],
    dinner: plan.dinner || [],
    snack: plan.snack || [],
  };
  plannerData[date] = validatedPlan;
  await savePlannerData(plannerData);
};

/**
 * Adds a meal item to a specific meal type for a given date.
 * @param date The date string in 'YYYY-MM-DD' format.
 * @param mealType The type of meal ('breakfast', 'lunch', 'dinner', 'snack').
 * @param item The PlannedMealItem to add.
 * @returns A promise that resolves when the item is added.
 */
export const addMealItem = async (
  date: string,
  mealType: keyof DailyPlan,
  item: PlannedMealItem
): Promise<void> => {
  const plannerData = await loadPlannerData();
  const dailyPlan = plannerData[date] || { breakfast: [], lunch: [], dinner: [], snack: [] };

  // Ensure the meal type array exists
  if (!dailyPlan[mealType]) {
    dailyPlan[mealType] = [];
  }

  // Avoid adding duplicates (optional, based on requirements)
  // const existingItemIndex = dailyPlan[mealType]?.findIndex(i => i.foodId === item.foodId);
  // if (existingItemIndex === -1) {
     dailyPlan[mealType]?.push(item);
  // } else {
     // Optionally update quantity if item already exists
     // dailyPlan[mealType][existingItemIndex].quantity += item.quantity;
  // }


  plannerData[date] = dailyPlan;
  await savePlannerData(plannerData);
};

/**
 * Removes a meal item from a specific meal type for a given date.
 * @param date The date string in 'YYYY-MM-DD' format.
 * @param mealType The type of meal ('breakfast', 'lunch', 'dinner', 'snack').
 * @param foodId The ID of the food item to remove.
 * @returns A promise that resolves when the item is removed.
 */
export const removeMealItem = async (
  date: string,
  mealType: keyof DailyPlan,
  foodId: string
): Promise<void> => {
  const plannerData = await loadPlannerData();
  const dailyPlan = plannerData[date];

  if (dailyPlan && dailyPlan[mealType]) {
    dailyPlan[mealType] = dailyPlan[mealType]?.filter(item => item.foodId !== foodId);
    plannerData[date] = dailyPlan;
    // Clean up the date entry if the plan becomes empty (optional)
    // if (Object.values(dailyPlan).every(meal => meal?.length === 0)) {
    //   delete plannerData[date];
    // }
    await savePlannerData(plannerData);
  } else {
    console.warn(`Cannot remove item: No plan found for date ${date} or meal type ${mealType}`);
  }
};

/**
 * Helper function to format a Date object into 'YYYY-MM-DD' string.
 * @param date The Date object.
 * @returns The formatted date string.
 */
export const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};