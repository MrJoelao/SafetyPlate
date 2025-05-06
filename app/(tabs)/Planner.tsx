import React, { useState, useEffect, useCallback } from "react";
import {Text, TouchableOpacity, Alert, Platform} from "react-native";
import { StyleSheet, View, SafeAreaView, FlatList, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { DayPlannerContent } from "@/components/ui/planner/DayPlannerContent";
import { ScreenHeader } from "@/components/ui/layout/ScreenHeader";
import { MaterialIcons } from "@expo/vector-icons";
import { usePlanner } from "@/hooks/usePlanner"; // Import usePlanner
import { SelectFoodModal } from "@/components/ui/modals/SelectFoodModal"; // Import SelectFoodModal
import { MealDetailModal } from "@/components/ui/modals/MealDetailModal"; // Import MealDetailModal
import type { DailyPlan, PlannedMealItem } from "@/types/planner"; // Import tipi necessari
import * as plannerStorage from "@/utils/plannerStorage"; // Import plannerStorage
const { width } = Dimensions.get("window");

export default function PlannerScreen() {
  const router = useRouter();
  const { allFoods, addMealItem, removeMealItem } = usePlanner(); // Ottieni dati e funzioni dal hook
  // Stato per il modal di aggiunta alimento
  const [modalVisible, setModalVisible] = useState(false);
  const [mealDetailModalVisible, setMealDetailModalVisible] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<keyof DailyPlan>("snack");
  const [selectedMealTypeUI, setSelectedMealTypeUI] = useState<string>("spuntino");
  const [days, setDays] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [selectedMealItems, setSelectedMealItems] = useState<{ name: string; quantity: string; id?: string }[]>([]);

  // Funzione per generare i giorni dinamicamente
  const generateDays = useCallback(async () => {
    const daysToGenerate = 14; // Genera 14 giorni
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

      // Formatta la data in modo leggibile
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'short' };
      const formattedDate = date.toLocaleDateString('it-IT', options);
      const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

      // Crea l'oggetto giorno
      const day = {
        dateObj: date,
        dateKey: dateKey,
        date: capitalizedDate,
        goals: { kcal: 2000, protein: 120, carbs: 250, fat: 60 }, // Valori predefiniti
        progress: { kcal: 0, protein: 0, carbs: 0, fat: 0 }, // Calcolare in base ai pasti
        meals: [
          { type: "colazione" as const, items: dailyPlan.breakfast?.map(item => ({ name: item.foodId, quantity: `${item.quantity}${item.unit}`, id: item.foodId })) || [] },
          { type: "pranzo" as const, items: dailyPlan.lunch?.map(item => ({ name: item.foodId, quantity: `${item.quantity}${item.unit}`, id: item.foodId })) || [] },
          { type: "cena" as const, items: dailyPlan.dinner?.map(item => ({ name: item.foodId, quantity: `${item.quantity}${item.unit}`, id: item.foodId })) || [] },
          { type: "spuntino" as const, items: dailyPlan.snack?.map(item => ({ name: item.foodId, quantity: `${item.quantity}${item.unit}`, id: item.foodId })) || [] },
        ],
      };

      generatedDays.push(day);
    }

    setDays(generatedDays);
  }, [currentDate]);

  // Carica i giorni all'avvio e quando cambia la data corrente
  useEffect(() => {
    generateDays();
  }, [generateDays]);

  // Funzione per gestire la selezione degli alimenti dal modal con ripetizione
  const handleSelectFood = (items: PlannedMealItem[], repetition?: { type: string, count: number }) => {
    // Se non c'è ripetizione, aggiungi solo al giorno corrente
    if (!repetition) {
      items.forEach(item => {
        addMealItem(selectedMealType, item);
      });
      setModalVisible(false);
      generateDays();
      return;
    }

    // Altrimenti, ripeti il pasto per i giorni specificati
    const repeatDays = async () => {
      // Determina quanti giorni ripetere in base all'opzione
      let daysToRepeat = repetition.count;
      if (repetition.type === 'week') {
        daysToRepeat = repetition.count * 7;
      } else if (repetition.type === 'month') {
        daysToRepeat = repetition.count * 30;
      }

      // Ripeti il pasto per i giorni specificati
      for (let i = 0; i < daysToRepeat; i++) {
        const targetDate = new Date(currentDate);
        targetDate.setDate(targetDate.getDate() + i);
        const dateKey = plannerStorage.formatDateKey(targetDate);

        // Carica il piano giornaliero esistente
        const dailyPlan = await plannerStorage.getDailyPlan(dateKey) || {
          breakfast: [],
          lunch: [],
          dinner: [],
          snack: []
        };

        // Aggiungi gli elementi del pasto
        items.forEach(item => {
          const existingItems = dailyPlan[selectedMealType] || [];
          const newItems = [...existingItems, item];
          dailyPlan[selectedMealType] = newItems;
        });

        // Salva il piano aggiornato
        await plannerStorage.updateDailyPlan(dateKey, dailyPlan);
      }

      // Aggiorna i giorni dopo aver aggiunto gli alimenti
      generateDays();
    };

    // Esegui la funzione asincrona
    repeatDays().then(() => {
      setModalVisible(false);
      // Mostra un messaggio di conferma
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

  // Funzione per mappare i tipi di pasto dall'italiano all'inglese
  const mapMealTypeToStorage = (mealType: string): keyof DailyPlan => {
    switch(mealType) {
      case "colazione": return "breakfast";
      case "pranzo": return "lunch";
      case "cena": return "dinner";
      case "spuntino": return "snack";
      default: return "snack";
    }
  };

  // Funzione per mappare i tipi di pasto dall'inglese all'italiano
  const mapMealTypeToUI = (mealType: keyof DailyPlan): string => {
    switch(mealType) {
      case "breakfast": return "colazione";
      case "lunch": return "pranzo";
      case "dinner": return "cena";
      case "snack": return "spuntino";
      default: return "spuntino";
    }
  };

  // Funzione per aprire il modal di aggiunta alimento
  const handleAddFood = (mealType: string) => {
    // Converti il tipo di pasto dall'italiano all'inglese
    const storageMealType = mapMealTypeToStorage(mealType);
    setSelectedMealType(storageMealType);
    setSelectedMealTypeUI(mealType);
    setModalVisible(true);
  };
  
  // Funzione per gestire il click su una sezione pasto
  const handleMealPress = (mealType: string) => {
    // Trova gli elementi del pasto selezionato nel giorno attivo
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

  // Funzione per eliminare un alimento
  const handleDeleteFood = async (mealType: string, foodId: string) => {
    const storageMealType = mapMealTypeToStorage(mealType);
    await removeMealItem(storageMealType, foodId);
    generateDays();
  };

  // Funzione per modificare un alimento (per ora apre solo il modal di aggiunta)
  const handleEditFood = (mealType: string, foodId: string) => {
    const storageMealType = mapMealTypeToStorage(mealType);
    setSelectedMealType(storageMealType);
    setModalVisible(true);
    // In futuro, potremmo implementare una vera funzionalità di modifica
    // che precompila il modal con i dati dell'alimento selezionato
  };

  // Swipe tra giorni con FlatList orizzontale
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header uniforme con icona */}
        <ScreenHeader
          title="Planner"
          icon={<MaterialIcons name="event-note" size={24} color="#000" />}
          onOptionsPress={() => router.push("/settings")}
        />

        {/* Titolo con controlli di navigazione integrati */}
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
              {length: width, offset: width * index, index}
            )}
          />
        ) : (
          <View style={styles.loadingContainer}>
            <Text>Caricamento giorni...</Text>
          </View>
        )}

        {/* Modal per l'aggiunta di alimenti */}
        <SelectFoodModal
          visible={modalVisible}
          mealType={selectedMealType}
          allFoods={allFoods}
          onClose={() => setModalVisible(false)}
          onSelect={handleSelectFood}
        />
        
        {/* Modal per i dettagli del pasto */}
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
            // Aggiorna gli elementi selezionati dopo l'eliminazione
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
    backgroundColor: "#fff", // Ensure background color consistency
  },
  contentArea: { // Added style for the area below the calendar
    flex: 1,
    paddingHorizontal: 10, // Add some horizontal padding
    paddingTop: 10, // Add some top padding
  },
  loader: {
    marginTop: 50, // Center loader vertically a bit
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  // Stili per l'header di navigazione integrato
  dateNavigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 4, // Increased elevation for more depth
    shadowColor: '#000',
    shadowOpacity: 0.15, // Increased opacity for more visible shadow
    shadowRadius: 4, // Increased radius for softer shadow
    shadowOffset: { width: 0, height: 3 }, // Slightly larger offset
  },
  navArrow: {
    width: 42, // Slightly larger
    height: 42, // Slightly larger
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 21, // Half of width/height
    backgroundColor: 'rgba(33, 150, 243, 0.15)', // Slightly more visible background
    borderWidth: 1, // Add border
    borderColor: 'rgba(33, 150, 243, 0.2)', // Subtle border
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
  // Stili per il container di caricamento
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  }
});
