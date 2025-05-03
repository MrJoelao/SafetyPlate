import { useState, useEffect, useCallback } from 'react';
import { DailyPlan, PlannedMealItem, PlannerData } from '@/types/planner';
import { Food } from '@/types/food'; // Assuming food types are needed later
import * as plannerStorage from '@/utils/plannerStorage';
import * as foodStorage from '@/utils/foodStorage'; // To potentially fetch food details

/**
 * Custom hook to manage the state and logic for the meal planner.
 *
 * @param initialDate The initial date to display in the planner. Defaults to the current date.
 * @returns An object containing the planner state and functions to interact with it.
 */
export const usePlanner = (initialDate: Date = new Date()) => {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [currentPlan, setCurrentPlan] = useState<DailyPlan | null>(null);
  const [allFoods, setAllFoods] = useState<Food[]>([]); // Store all available foods
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const formattedDateKey = useCallback(() => {
    return plannerStorage.formatDateKey(currentDate);
  }, [currentDate]);

  /**
   * Fetches the daily plan for the current date and all available foods.
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dateKey = formattedDateKey();
      // Load plan and foods sequentially or handle potential errors individually
      const plan = await plannerStorage.getDailyPlan(dateKey);
      const foodsResult = await foodStorage.loadFoods(); // Load all foods for selection/display

      setCurrentPlan(plan); // Set plan regardless of food loading outcome initially

      if (foodsResult.success && foodsResult.foods) {
        setAllFoods(foodsResult.foods);
      } else {
        console.error("Failed to load foods:", foodsResult.error);
        setError(foodsResult.error || "Impossibile caricare l'elenco degli alimenti.");
        setAllFoods([]); // Set to empty array on failure
      }
    } catch (err) {
      console.error("Failed to load planner data:", err);
      setError("Impossibile caricare i dati del planner.");
      setCurrentPlan(null); // Reset plan on error
      setAllFoods([]);
    } finally {
      setIsLoading(false);
    }
  }, [formattedDateKey]);

  // Initial data load and reload when currentDate changes
  useEffect(() => {
    loadData();
  }, [loadData]); // Dependency on loadData which depends on formattedDateKey -> currentDate

  /**
   * Adds a meal item to the specified meal type for the current date.
   * @param mealType The type of meal ('breakfast', 'lunch', 'dinner', 'snack').
   * @param item The PlannedMealItem to add.
   */
  const addMealItem = useCallback(async (mealType: keyof DailyPlan, item: PlannedMealItem) => {
    setIsLoading(true); // Indicate activity
    try {
      const dateKey = formattedDateKey();
      await plannerStorage.addMealItem(dateKey, mealType, item);
      // Reload data to reflect changes
      await loadData();
    } catch (err) {
      console.error("Failed to add meal item:", err);
      setError("Impossibile aggiungere l'alimento al piano.");
      setIsLoading(false); // Ensure loading state is reset on error
    }
    // setIsLoading(false) is handled by the subsequent loadData() call's finally block
  }, [formattedDateKey, loadData]);

  /**
   * Removes a meal item from the specified meal type for the current date.
   * @param mealType The type of meal ('breakfast', 'lunch', 'dinner', 'snack').
   * @param foodId The ID of the food item to remove.
   */
  const removeMealItem = useCallback(async (mealType: keyof DailyPlan, foodId: string) => {
    setIsLoading(true); // Indicate activity
    try {
      const dateKey = formattedDateKey();
      await plannerStorage.removeMealItem(dateKey, mealType, foodId);
      // Reload data to reflect changes
      await loadData();
    } catch (err) {
      console.error("Failed to remove meal item:", err);
      setError("Impossibile rimuovere l'alimento dal piano.");
      setIsLoading(false); // Ensure loading state is reset on error
    }
     // setIsLoading(false) is handled by the subsequent loadData() call's finally block
  }, [formattedDateKey, loadData]);

  /**
   * Changes the current date being viewed in the planner.
   * @param newDate The new date to set.
   */
  const changeDate = (newDate: Date) => {
    // Basic validation could be added here if needed
    setCurrentDate(newDate);
    // Data will reload automatically due to the useEffect dependency on currentDate (via loadData)
  };

  return {
    currentDate,
    currentPlan,
    allFoods, // Provide the list of all foods
    isLoading,
    error,
    changeDate,
    addMealItem,
    removeMealItem,
    getFoodById: (id: string) => allFoods.find(food => food.id === id), // Helper to get food details
  };
};