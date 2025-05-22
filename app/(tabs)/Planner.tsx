import React, { useState, useEffect, useCallback } from "react";
import { Text, TouchableOpacity, Alert, Platform } from "react-native";
import { StyleSheet, View, SafeAreaView, FlatList, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { DayPlannerContent } from "@/components/ui/planner/DayPlannerContent";
import { ScreenHeader } from "@/components/ui/layout/ScreenHeader";
import { MaterialIcons } from "@expo/vector-icons";
import { usePlanner } from "@/hooks/usePlanner";
import { SelectFoodModal } from "@/components/ui/modals/SelectFoodModal";
import { MealDetailModal } from "@/components/ui/modals/MealDetailModal";
import type { DailyPlan, PlannedMealItem } from "@/types/planner";
import * as plannerStorage from "@/utils/plannerStorage";
const { width } = Dimensions.get("window");

export default function PlannerScreen() {
  const router = useRouter();
  const { allFoods, addMealItem, removeMealItem } = usePlanner();
  const [modalVisible, setModalVisible] = useState(false);
  const [mealDetailModalVisible, setMealDetailModalVisible] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<keyof DailyPlan>("snack");
  const [selectedMealTypeUI, setSelectedMealTypeUI] = useState<string>("spuntino");
  const [days, setDays] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [selectedMealItems, setSelectedMealItems] = useState<{ name: string; quantity: string; id?: string }[]>([]);

  const generateDays = useCallback(async () => {
    const daysToGenerate = 14;
    const generatedDays = [];

    for (let i = 0; i < daysToGenerate; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + i);

      const dateKey = plannerStorage.formatDateKey(date);
      const dailyPlan = await plannerStorage.getDailyPlan(dateKey) || {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: []
      };

      const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'short' };
      const formattedDate = date.toLocaleDateString('it-IT', options);
      const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

      const day = {
        dateObj: date,
        dateKey: dateKey,
        date: capitalizedDate,
        goals: { kcal: 2000, protein: 120, carbs: 250, fat: 60 },
        progress: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
        meals: [
          { type: "colazione" as const, items: dailyPlan.breakfast?.map(item => {
            const food = allFoods.find(f => f.id === item.foodId);
            return {
              name: food ? food.name : item.foodId,
              quantity: `${item.quantity}${item.unit}`,
              id: item.foodId
            };
          }) || [] },
          { type: "pranzo" as const, items: dailyPlan.lunch?.map(item => {
            const food = allFoods.find(f => f.id === item.foodId);
            return {
              name: food ? food.name : item.foodId,
              quantity: `${item.quantity}${item.unit}`,
              id: item.foodId
            };
          }) || [] },
          { type: "cena" as const, items: dailyPlan.dinner?.map(item => {
            const food = allFoods.find(f => f.id === item.foodId);
            return {
              name: food ? food.name : item.foodId,
              quantity: `${item.quantity}${item.unit}`,
              id: item.foodId
            };
          }) || [] },
          { type: "spuntino" as const, items: dailyPlan.snack?.map(item => {
            const food = allFoods.find(f => f.id === item.foodId);
            return {
              name: food ? food.name : item.foodId,
              quantity: `${item.quantity}${item.unit}`,
              id: item.foodId
            };
          }) || [] },
        ],
      };

      generatedDays.push(day);
    }

    setDays(generatedDays);
  }, [currentDate, allFoods]);

  useEffect(() => {
    generateDays();
  }, [generateDays]);

  const handleSelectFood = (items: PlannedMealItem[], repetition?: { type: string, count: number }) => {
    if (!repetition) {
      items.forEach(item => {
        addMealItem(selectedMealType, item);
      });
      setModalVisible(false);
      generateDays();
      return;
    }

    const repeatDays = async () => {
      let daysToRepeat = repetition.count;
      if (repetition.type === 'week') {
        daysToRepeat = repetition.count * 7;
      } else if (repetition.type === 'month') {
        daysToRepeat = repetition.count * 30;
      }

      for (let i = 0; i < daysToRepeat; i++) {
        const targetDate = new Date(currentDate);
        targetDate.setDate(targetDate.getDate() + i);
        const dateKey = plannerStorage.formatDateKey(targetDate);

        const dailyPlan = await plannerStorage.getDailyPlan(dateKey) || {
          breakfast: [],
          lunch: [],
          dinner: [],
          snack: []
        };

        items.forEach(item => {
          const existingItems = dailyPlan[selectedMealType] || [];
          const newItems = [...existingItems, item];
          dailyPlan[selectedMealType] = newItems;
        });

        await plannerStorage.updateDailyPlan(dateKey, dailyPlan);
      }

      generateDays();
    };

    repeatDays().then(() => {
      setModalVisible(false);
      Alert.alert(
        "Pasto aggiunto",
        `Il pasto è stato aggiunto e ripetuto per ${repetition.count} ${
          repetition.type === 'day' ? 'giorni' : 
          repetition.type === 'week' ? 'settimane' : 'mesi'
        }.`,
        [{ text: "OK" }]
      );
    });
  };

  const mapMealTypeToStorage = (mealType: string): keyof DailyPlan => {
    switch(mealType) {
      case "colazione": return "breakfast";
      case "pranzo": return "lunch";
      case "cena": return "dinner";
      case "spuntino": return "snack";
      default: return "snack";
    }
  };

  const mapMealTypeToUI = (mealType: keyof DailyPlan): string => {
    switch(mealType) {
      case "breakfast": return "colazione";
      case "lunch": return "pranzo";
      case "dinner": return "cena";
      case "snack": return "spuntino";
      default: return "spuntino";
    }
  };

  const handleAddFood = (mealType: string) => {
    const storageMealType = mapMealTypeToStorage(mealType);
    setSelectedMealType(storageMealType);
    setSelectedMealTypeUI(mealType);
    setModalVisible(true);
  };

  const handleMealPress = (mealType: string) => {
    const activeDay = days[activeDayIndex];
    if (activeDay) {
      const meal = activeDay.meals.find((m: any) => m.type === mealType);
      if (meal) {
        setSelectedMealItems(meal.items);
        setSelectedMealTypeUI(mealType);
        setSelectedMealType(mapMealTypeToStorage(mealType));
        setMealDetailModalVisible(true);
      }
    }
  };

  const handleDeleteFood = async (mealType: string, foodId: string) => {
    const storageMealType = mapMealTypeToStorage(mealType);
    await removeMealItem(storageMealType, foodId);
    generateDays();
  };

  const handleEditFood = (mealType: string, foodId: string) => {
    const storageMealType = mapMealTypeToStorage(mealType);
    setSelectedMealType(storageMealType);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScreenHeader
          title="Planner"
          icon={<MaterialIcons name="event-note" size={24} color="#000" />}
          onOptionsPress={() => router.push("/settings")}
        />

        <View style={styles.dateNavigationHeader}>
          <TouchableOpacity 
            style={styles.navArrow}
            onPress={() => {
              const newDate = new Date(currentDate);
              newDate.setDate(newDate.getDate() - 7);
              setCurrentDate(newDate);
            }}
            accessibilityLabel="Settimana precedente"
            accessibilityRole="button"
          >
            <MaterialIcons name="chevron-left" size={28} color="#2196F3" />
          </TouchableOpacity>

          <View style={styles.dateHeaderContainer}>
            <View style={styles.datePillRow}>
              <Text style={styles.datePillWeekday}>
                {days[activeDayIndex]
                  ? days[activeDayIndex].dateObj.toLocaleDateString('it-IT', { weekday: 'short' }).toUpperCase()
                  : ""}
              </Text>
              <Text style={styles.datePillDay}>
                {days[activeDayIndex]
                  ? days[activeDayIndex].dateObj.getDate()
                  : ""}
              </Text>
              <Text style={styles.datePillMonthYear}>
                {days[activeDayIndex]
                  ? days[activeDayIndex].dateObj.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' })
                  : ""}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.navArrow}
            onPress={() => {
              const newDate = new Date(currentDate);
              newDate.setDate(newDate.getDate() + 7);
              setCurrentDate(newDate);
            }}
            accessibilityLabel="Settimana successiva"
            accessibilityRole="button"
          >
            <MaterialIcons name="chevron-right" size={28} color="#2196F3" />
          </TouchableOpacity>
        </View>

        {days.length > 0 ? (
          <FlatList
            data={days}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.dateKey}
            renderItem={({ item }) => (
              <View style={{ width }}>
                <DayPlannerContent
                  date={item.date}
                  goals={item.goals}
                  progress={item.progress}
                  meals={item.meals}
                  selectedMealType={selectedMealType}
                  onAddMeal={(mealType) => handleAddFood(mealType)}
                  onDeleteItem={(mealType, itemId) => handleDeleteFood(mealType, itemId)}
                  onEditItem={(mealType, itemId) => handleEditFood(mealType, itemId)}
                  onMealPress={(mealType) => handleMealPress(mealType)}
                />
              </View>
            )}
            onMomentumScrollEnd={e => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveDayIndex(index);
            }}
            initialScrollIndex={0}
            getItemLayout={(data, index) => (
              { length: width, offset: width * index, index }
            )}
          />
        ) : (
          <View style={styles.loadingContainer}>
            <Text>Caricamento giorni...</Text>
          </View>
        )}

        <SelectFoodModal
          visible={modalVisible}
          mealType={selectedMealType}
          allFoods={allFoods}
          onClose={() => setModalVisible(false)}
          onSelect={handleSelectFood}
        />

        <MealDetailModal
          visible={mealDetailModalVisible}
          mealType={selectedMealTypeUI}
          storageMealType={selectedMealType}
          items={selectedMealItems}
          date={days[activeDayIndex]?.date || ''}
          onClose={() => setMealDetailModalVisible(false)}
          onAddFood={(mealType) => {
            setMealDetailModalVisible(false);
            handleAddFood(mealType);
          }}
          onDeleteItem={(mealType, itemId) => {
            handleDeleteFood(mealType, itemId);
            const activeDay = days[activeDayIndex];
            if (activeDay) {
              const meal = activeDay.meals.find((m: any) => m.type === mealType);
              if (meal) {
                setSelectedMealItems(meal.items.filter((item: any) => item.id !== itemId));
              }
            }
          }}
          onEditItem={(mealType, itemId) => {
            setMealDetailModalVisible(false);
            handleEditFood(mealType, itemId);
          }}
          allFoods={allFoods}
        />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  loader: {
    marginTop: 50,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  dateNavigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
  },
  navArrow: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 21,
    backgroundColor: 'rgba(33, 150, 243, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.2)',
  },
  dateHeaderContainer: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 0,
    marginBottom: 2,
  },
  datePillRow: {
    backgroundColor: '#f4f8fd',
    borderRadius: 22,
    paddingVertical: 4,
    paddingHorizontal: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#1976d2',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 2,
    minWidth: 120,
    gap: 10,
  },
  datePillWeekday: {
    fontSize: 13,
    color: '#1976d2',
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginRight: 2,
  },
  datePillDay: {
    fontSize: 26,
    color: '#1976d2',
    fontWeight: 'bold',
    lineHeight: 30,
    marginHorizontal: 2,
  },
  datePillMonthYear: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'capitalize',
    marginLeft: 2,
  },
  dateSubheaderText: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  }
});
