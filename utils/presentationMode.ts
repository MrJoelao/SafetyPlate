import AsyncStorage from '@react-native-async-storage/async-storage';
import * as plannerStorage from '@/utils/plannerStorage';
import { foodStorage } from '@/store/data/FoodStorage';
import { Food } from '@/types/food';
import { PlannedMealItem, DailyPlan } from '@/types/planner';

// Key for storing presentation mode state
const PRESENTATION_MODE_KEY = '@SafetyPlate:presentationMode';

// Sample foods data
const sampleFoods: Omit<Food, 'id'>[] = [
  {
    name: 'Mela',
    score: 95,
    defaultUnit: 'g',
    nutritionPer100g: { calories: 52, proteins: 0.3, carbs: 14, fats: 0.2 },
  },
  {
    name: 'Banana',
    score: 90,
    defaultUnit: 'g',
    nutritionPer100g: { calories: 89, proteins: 1.1, carbs: 22.8, fats: 0.3 },
  },
  {
    name: 'Pane integrale',
    score: 85,
    defaultUnit: 'g',
    nutritionPer100g: { calories: 247, proteins: 9.7, carbs: 41.3, fats: 3.1 },
  },
  {
    name: 'Pasta',
    score: 80,
    defaultUnit: 'g',
    nutritionPer100g: { calories: 371, proteins: 12.5, carbs: 74.7, fats: 1.5 },
  },
  {
    name: 'Pollo',
    score: 90,
    defaultUnit: 'g',
    nutritionPer100g: { calories: 165, proteins: 31, carbs: 0, fats: 3.6 },
  },
  {
    name: 'Salmone',
    score: 95,
    defaultUnit: 'g',
    nutritionPer100g: { calories: 208, proteins: 20, carbs: 0, fats: 13 },
  },
  {
    name: 'Uova',
    score: 85,
    defaultUnit: 'g',
    nutritionPer100g: { calories: 155, proteins: 12.6, carbs: 1.1, fats: 10.6 },
  },
  {
    name: 'Latte',
    score: 80,
    defaultUnit: 'ml',
    nutritionPer100g: { calories: 42, proteins: 3.4, carbs: 4.8, fats: 1 },
  },
  {
    name: 'Yogurt greco',
    score: 90,
    defaultUnit: 'g',
    nutritionPer100g: { calories: 59, proteins: 10, carbs: 3.6, fats: 0.4 },
  },
  {
    name: 'Spinaci',
    score: 100,
    defaultUnit: 'g',
    nutritionPer100g: { calories: 23, proteins: 2.9, carbs: 3.6, fats: 0.4 },
  },
  {
    name: 'Broccoli',
    score: 100,
    defaultUnit: 'g',
    nutritionPer100g: { calories: 34, proteins: 2.8, carbs: 6.6, fats: 0.4 },
  },
  {
    name: 'Carote',
    score: 95,
    defaultUnit: 'g',
    nutritionPer100g: { calories: 41, proteins: 0.9, carbs: 9.6, fats: 0.2 },
  },
  {
    name: 'Riso',
    score: 85,
    defaultUnit: 'g',
    nutritionPer100g: { calories: 130, proteins: 2.7, carbs: 28, fats: 0.3 },
  },
  {
    name: 'Patate',
    score: 80,
    defaultUnit: 'g',
    nutritionPer100g: { calories: 77, proteins: 2, carbs: 17, fats: 0.1 },
  },
  {
    name: 'Formaggio',
    score: 75,
    defaultUnit: 'g',
    nutritionPer100g: { calories: 402, proteins: 25, carbs: 1.3, fats: 33 },
  },
  {
    name: 'Acqua',
    score: 100,
    defaultUnit: 'ml',
    nutritionPer100g: { calories: 0, proteins: 0, carbs: 0, fats: 0 },
  },
];

// Generate a random meal plan for a day
const generateDailyMealPlan = (foods: Food[], date: Date): DailyPlan => {
  const getRandomFood = () => foods[Math.floor(Math.random() * foods.length)];
  const getRandomQuantity = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  // Generate random meal items
  const generateMealItems = (count: number): PlannedMealItem[] => {
    return Array.from({ length: count }, () => {
      const food = getRandomFood();
      return {
        foodId: food.id,
        quantity: getRandomQuantity(50, 300),
        unit: food.defaultUnit,
      };
    });
  };

  return {
    breakfast: generateMealItems(getRandomQuantity(1, 3)),
    lunch: generateMealItems(getRandomQuantity(2, 4)),
    dinner: generateMealItems(getRandomQuantity(2, 4)),
    snack: generateMealItems(getRandomQuantity(0, 2)),
  };
};

// Generate meal plans for a range of dates
const generateMealPlans = async (foods: Food[], days: number = 14) => {
  const today = new Date();
  const plans: Record<string, DailyPlan> = {};

  // Generate past days (including today)
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateKey = plannerStorage.formatDateKey(date);
    plans[dateKey] = generateDailyMealPlan(foods, date);
  }

  // Generate future days
  for (let i = 1; i <= 7; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    const dateKey = plannerStorage.formatDateKey(date);
    plans[dateKey] = generateDailyMealPlan(foods, date);
  }

  return plans;
};

// Check if presentation mode is enabled
export const isPresentationModeEnabled = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(PRESENTATION_MODE_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking presentation mode:', error);
    return false;
  }
};

// Enable presentation mode
export const enablePresentationMode = async (): Promise<boolean> => {
  try {
    // Save presentation mode state
    await AsyncStorage.setItem(PRESENTATION_MODE_KEY, 'true');

    // Generate and save sample foods
    const foods: Food[] = sampleFoods.map(food => ({
      ...food,
      id: Date.now() + Math.random().toString(36).substr(2, 9),
    }));
    await foodStorage.saveFoods(foods);

    // Generate and save sample meal plans
    const plans = await generateMealPlans(foods);
    await plannerStorage.savePlannerData(plans);

    return true;
  } catch (error) {
    console.error('Error enabling presentation mode:', error);
    return false;
  }
};

// Disable presentation mode
export const disablePresentationMode = async (): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(PRESENTATION_MODE_KEY, 'false');
    return true;
  } catch (error) {
    console.error('Error disabling presentation mode:', error);
    return false;
  }
};

// Clear all app data
export const clearAllData = async (): Promise<boolean> => {
  try {
    // Clear foods
    await foodStorage.saveFoods([]);

    // Clear planner data
    await plannerStorage.savePlannerData({});

    // Disable presentation mode
    await disablePresentationMode();

    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    return false;
  }
};
