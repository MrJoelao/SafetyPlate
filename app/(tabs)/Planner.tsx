import React, { useState } from "react";
import { Text } from "react-native";
import { StyleSheet, View, SafeAreaView, FlatList, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { DayPlannerContent } from "@/components/ui/planner/DayPlannerContent";
import { ScreenHeader } from "@/components/ui/layout/ScreenHeader";
import { MaterialIcons } from "@expo/vector-icons";
import { usePlanner } from "@/hooks/usePlanner"; // Import usePlanner
import { SelectFoodModal } from "@/components/ui/modals/SelectFoodModal"; // Import SelectFoodModal
import type { DailyPlan, PlannedMealItem } from "@/types/planner"; // Import tipi necessari
const { width } = Dimensions.get("window");

export default function PlannerScreen() {
  const router = useRouter();
  const { allFoods, addMealItem } = usePlanner(); // Ottieni dati e funzioni dal hook
  // Stato per il modal di aggiunta alimento
  const [modalVisible, setModalVisible] = useState(false);

  // Funzione per gestire la selezione degli alimenti dal modal
  const handleSelectFood = (items: PlannedMealItem[]) => {
    // TODO: Determinare il mealType corretto (es. tramite stato aggiuntivo o logica nel modal)
    const targetMealType: keyof DailyPlan = "snack"; // Placeholder: aggiunge a snack
    items.forEach(item => {
      addMealItem(targetMealType, item);
    });
    setModalVisible(false); // Chiudi il modal dopo la selezione
  };


  // Dati fittizi per testare la nuova UI
  const days = [
    {
      date: "Lunedì 6 Mag",
      goals: { kcal: 2000, protein: 120, carbs: 250, fat: 60 },
      progress: { kcal: 1200, protein: 60, carbs: 140, fat: 30 },
      meals: [
        { type: "colazione" as const, items: [{ name: "Yogurt", quantity: "150g" }] },
        { type: "pranzo" as const, items: [{ name: "Pasta", quantity: "80g" }, { name: "Pollo", quantity: "120g" }] },
        { type: "cena" as const, items: [] },
        { type: "spuntino" as const, items: [{ name: "Banana", quantity: "1" }] },
      ],
    },
    {
      date: "Martedì 7 Mag",
      goals: { kcal: 2000, protein: 120, carbs: 250, fat: 60 },
      progress: { kcal: 1800, protein: 110, carbs: 210, fat: 55 },
      meals: [
        { type: "colazione" as const, items: [{ name: "Pane", quantity: "60g" }] },
        { type: "pranzo" as const, items: [{ name: "Riso", quantity: "90g" }] },
        { type: "cena" as const, items: [{ name: "Salmone", quantity: "100g" }] },
        { type: "spuntino" as const, items: [] },
      ],
    },
    // ...altri giorni
  ];

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
        <FlatList
          data={days}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={({ item }) => (
            <View style={{ width }}>
              <DayPlannerContent
                date={item.date}
                goals={item.goals}
                progress={item.progress}
                meals={item.meals}
                onAddMeal={() => {}}
                onAddFood={() => setModalVisible(true)}
              />
            </View>
          )}
        />
        {/* Modal Material bottom sheet per aggiunta alimento */}
        <SelectFoodModal
          visible={modalVisible}
          mealType={null} // Passa null o gestisci la selezione del pasto
          allFoods={allFoods} // Passa la lista reale degli alimenti
          onClose={() => setModalVisible(false)}
          onSelect={handleSelectFood} // Passa la funzione di gestione
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
});
