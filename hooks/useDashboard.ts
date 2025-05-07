import { useState, useEffect, useCallback } from 'react';
import { Food } from '@/types/food';
import { DailyPlan, PlannedMealItem } from '@/types/planner';
import * as plannerStorage from '@/utils/plannerStorage';
import { foodStorage } from '@/store/data/FoodStorage';

// Define types for dashboard data
export interface DashboardData {
  dailyScore: number;
  calories: { current: number; target: number };
  macros: {
    proteins: { current: number; target: number };
    carbs: { current: number; target: number };
    fats: { current: number; target: number };
  };
  weeklyScores: Array<{ day: string; score: number }>;
  dailyMeals: Array<{
    id: string;
    name: 'Colazione' | 'Pranzo' | 'Cena' | 'Spuntini';
    status: 'Completo' | 'Parziale' | 'Mancante' | 'Registrato';
    calories?: number;
    iconName: string;
  }>;
}

// Default targets - these could be user-configurable in the future
const DEFAULT_TARGETS = {
  calories: 2200,
  proteins: 120,
  carbs: 280,
  fats: 70,
};

// Map storage meal types to UI meal names
const mealTypeToName: Record<string, 'Colazione' | 'Pranzo' | 'Cena' | 'Spuntini'> = {
  breakfast: 'Colazione',
  lunch: 'Pranzo',
  dinner: 'Cena',
  snack: 'Spuntini',
};

// Map meal types to icon names
const mealTypeToIcon: Record<string, string> = {
  breakfast: 'food-croissant',
  lunch: 'food-variant',
  dinner: 'food-steak',
  snack: 'food-apple',
};

/**
 * Custom hook to provide dashboard data based on user's meal plans
 */
export const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    dailyScore: 0,
    calories: { current: 0, target: DEFAULT_TARGETS.calories },
    macros: {
      proteins: { current: 0, target: DEFAULT_TARGETS.proteins },
      carbs: { current: 0, target: DEFAULT_TARGETS.carbs },
      fats: { current: 0, target: DEFAULT_TARGETS.fats },
    },
    weeklyScores: [],
    dailyMeals: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allFoods, setAllFoods] = useState<Food[]>([]);

  // Load all foods
  const loadAllFoods = useCallback(async () => {
    try {
      const result = await foodStorage.loadFoods();
      if (result.success && result.data) {
        setAllFoods(result.data);
        return result.data;
      }
      return [];
    } catch (err) {
      console.error('Error loading foods:', err);
      return [];
    }
  }, []);

  // Calculate nutritional values for a meal item
  const calculateNutrition = useCallback((item: PlannedMealItem, foods: Food[]) => {
    const food = foods.find(f => f.id === item.foodId);
    if (!food || !food.nutritionPer100g) return { calories: 0, proteins: 0, carbs: 0, fats: 0 };

    // Calculate based on quantity and unit
    const multiplier = item.unit === 'g' ? item.quantity / 100 : item.quantity;

    return {
      calories: (food.nutritionPer100g.calories || 0) * multiplier,
      proteins: (food.nutritionPer100g.proteins || 0) * multiplier,
      carbs: (food.nutritionPer100g.carbs || 0) * multiplier,
      fats: (food.nutritionPer100g.fats || 0) * multiplier,
    };
  }, []);

  // Calculate meal status based on items
  const calculateMealStatus = (items: PlannedMealItem[]): 'Completo' | 'Parziale' | 'Mancante' | 'Registrato' => {
    if (items.length === 0) return 'Mancante';
    if (items.length >= 3) return 'Completo';
    return 'Parziale';
  };

  // Calculate daily score based on nutritional balance
  const calculateDailyScore = useCallback((calories: number, proteins: number, carbs: number, fats: number) => {
    if (calories === 0) return 0;

    // Calculate how close we are to targets (as percentages)
    const calorieScore = Math.min(100, (calories / DEFAULT_TARGETS.calories) * 100);
    const proteinScore = Math.min(100, (proteins / DEFAULT_TARGETS.proteins) * 100);
    const carbScore = Math.min(100, (carbs / DEFAULT_TARGETS.carbs) * 100);
    const fatScore = Math.min(100, (fats / DEFAULT_TARGETS.fats) * 100);

    // Penalize for being too far over target
    const calorieOverage = calories > DEFAULT_TARGETS.calories * 1.2 ? 
      (calories - DEFAULT_TARGETS.calories * 1.2) / (DEFAULT_TARGETS.calories * 0.2) * 20 : 0;

    // Calculate final score (weighted average with penalties)
    const rawScore = (calorieScore * 0.4 + proteinScore * 0.3 + carbScore * 0.15 + fatScore * 0.15) - calorieOverage;
    return Math.max(0, Math.min(100, Math.round(rawScore)));
  }, []);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load all foods first
      const foods = await loadAllFoods();

      // Get today's date key
      const today = new Date();
      const todayKey = plannerStorage.formatDateKey(today);

      // Load today's plan
      const todayPlan = await plannerStorage.getDailyPlan(todayKey) || {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: []
      };

      // Calculate nutritional totals for today
      let totalCalories = 0;
      let totalProteins = 0;
      let totalCarbs = 0;
      let totalFats = 0;

      // Calculate meal-specific totals and statuses
      const dailyMeals = [];

      for (const [mealType, items] of Object.entries(todayPlan)) {
        if (!items) continue;

        let mealCalories = 0;

        for (const item of items) {
          const nutrition = calculateNutrition(item, foods);
          totalCalories += nutrition.calories;
          totalProteins += nutrition.proteins;
          totalCarbs += nutrition.carbs;
          totalFats += nutrition.fats;
          mealCalories += nutrition.calories;
        }

        dailyMeals.push({
          id: mealType,
          name: mealTypeToName[mealType] || 'Altro',
          status: calculateMealStatus(items),
          calories: mealCalories > 0 ? Math.round(mealCalories) : undefined,
          iconName: mealTypeToIcon[mealType] || 'food',
        });
      }

      // Calculate daily score
      const dailyScore = calculateDailyScore(totalCalories, totalProteins, totalCarbs, totalFats);

      // Load past week's data for weekly trend
      const weeklyScores = [];
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = plannerStorage.formatDateKey(date);
        const dayPlan = await plannerStorage.getDailyPlan(dateKey) || {
          breakfast: [],
          lunch: [],
          dinner: [],
          snack: []
        };

        // Calculate nutritional totals for this day
        let dayCalories = 0;
        let dayProteins = 0;
        let dayCarbs = 0;
        let dayFats = 0;

        for (const items of Object.values(dayPlan)) {
          if (!items) continue;

          for (const item of items) {
            const nutrition = calculateNutrition(item, foods);
            dayCalories += nutrition.calories;
            dayProteins += nutrition.proteins;
            dayCarbs += nutrition.carbs;
            dayFats += nutrition.fats;
          }
        }

        // Calculate score for this day
        const dayScore = calculateDailyScore(dayCalories, dayProteins, dayCarbs, dayFats);

        weeklyScores.push({
          day: dayNames[date.getDay()],
          score: dayScore
        });
      }

      // Update dashboard data
      setDashboardData({
        dailyScore,
        calories: {
          current: Math.round(totalCalories),
          target: DEFAULT_TARGETS.calories
        },
        macros: {
          proteins: {
            current: Math.round(totalProteins),
            target: DEFAULT_TARGETS.proteins
          },
          carbs: {
            current: Math.round(totalCarbs),
            target: DEFAULT_TARGETS.carbs
          },
          fats: {
            current: Math.round(totalFats),
            target: DEFAULT_TARGETS.fats
          }
        },
        weeklyScores,
        dailyMeals
      });

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Impossibile caricare i dati della dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [loadAllFoods, calculateNutrition, calculateDailyScore]);

  // Load data on mount
  useEffect(() => {
    loadDashboardData();

    // Set up a refresh interval (optional)
    const intervalId = setInterval(loadDashboardData, 60000); // Refresh every minute

    return () => clearInterval(intervalId);
  }, [loadDashboardData]);

  return {
    dashboardData,
    isLoading,
    error,
    refreshDashboard: loadDashboardData
  };
};
