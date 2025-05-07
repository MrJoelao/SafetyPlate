import { useState, useEffect, useCallback } from 'react';
import { Food } from '@/types/food';
import { DailyPlan, PlannedMealItem } from '@/types/planner';
import * as plannerStorage from '@/utils/plannerStorage';
import { foodStorage } from '@/store/data/FoodStorage';

// Define types for diary data
export interface DiaryActivity {
  id: string;
  title: string;
  type: "meal" | "activity" | "note";
  duration?: number;
  color?: string;
  details?: string;
}

export interface TimeSlotData {
  time: string;
  activities?: DiaryActivity[];
}

// Map meal types to colors
const mealTypeToColor: Record<string, string> = {
  breakfast: '#4CAF50', // Green
  lunch: '#FF9800',     // Orange
  dinner: '#2196F3',    // Blue
  snack: '#9C27B0',     // Purple
};

// Map meal types to display names
const mealTypeToName: Record<string, string> = {
  breakfast: 'Colazione',
  lunch: 'Pranzo',
  dinner: 'Cena',
  snack: 'Spuntino',
};

// Map meal types to approximate times
const mealTypeToTime: Record<string, string> = {
  breakfast: '08:00',
  lunch: '13:00',
  dinner: '20:00',
  snack: '16:00',
};

/**
 * Custom hook to provide diary data based on user's meal plans
 */
export const useDiary = (initialDate: Date = new Date()) => {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [timeSlots, setTimeSlots] = useState<TimeSlotData[]>([]);
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

  // Load diary data for the selected date
  const loadDiaryData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load all foods first
      const foods = await loadAllFoods();

      // Get date key for the selected date
      const dateKey = plannerStorage.formatDateKey(selectedDate);

      // Load plan for the selected date
      const dailyPlan = await plannerStorage.getDailyPlan(dateKey) || {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: []
      };

      // Initialize time slots (24 hours)
      const initialTimeSlots: TimeSlotData[] = Array.from({ length: 24 }, (_, i) => ({
        time: `${i.toString().padStart(2, '0')}:00`,
        activities: [],
      }));

      // Add meals to appropriate time slots
      for (const [mealType, items] of Object.entries(dailyPlan)) {
        if (!items || items.length === 0) continue;

        // Get the time slot for this meal type
        const timeSlot = mealTypeToTime[mealType] || '12:00';
        const hour = parseInt(timeSlot.split(':')[0], 10);

        // Create activity for this meal
        const mealItems = items.map(item => {
          const food = foods.find(f => f.id === item.foodId);
          return food ? `${food.name} (${item.quantity}${item.unit})` : `Alimento (${item.quantity}${item.unit})`;
        });

        const activity: DiaryActivity = {
          id: `${mealType}-${dateKey}`,
          title: mealTypeToName[mealType] || 'Pasto',
          type: 'meal',
          duration: 30, // Default duration
          color: mealTypeToColor[mealType] || '#757575',
          details: mealItems.join(', '),
        };

        // Add activity to the appropriate time slot
        initialTimeSlots[hour].activities = [
          ...(initialTimeSlots[hour].activities || []),
          activity,
        ];
      }

      // Filter out time slots with no activities
      const filteredTimeSlots = initialTimeSlots.filter(slot => slot.activities && slot.activities.length > 0);

      // If no activities, show all time slots
      setTimeSlots(filteredTimeSlots.length > 0 ? filteredTimeSlots : initialTimeSlots);

    } catch (err) {
      console.error('Error loading diary data:', err);
      setError('Impossibile caricare i dati del diario');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, loadAllFoods]);

  // Load data when selected date changes
  useEffect(() => {
    loadDiaryData();
  }, [loadDiaryData]);

  return {
    selectedDate,
    setSelectedDate,
    timeSlots,
    isLoading,
    error,
    refreshDiary: loadDiaryData
  };
};
