"use client"

import { useState } from "react"
import { StyleSheet, View, SafeAreaView, Platform } from "react-native"
import { useRouter } from "expo-router" // Importa useRouter
import { ThemedView } from "@/components/common/ThemedView"
import { PlannerCalendar } from "@/components/planner/PlannerCalendar"
import { MealPlanSheet } from "@/components/planner/MealPlanSheet"
import { FloatingActionButton } from "@/components/ui/buttons/FloatingActionButton"
import { ScreenHeader } from "@/components/ui/layout/ScreenHeader"
import { Entypo } from "@expo/vector-icons"
import { MealTypeMenu } from "@/components/ui/modals/MealTypeMenu"
// Rimuovi importazioni dei modali originali
// import { MealEntryModal } from "@/components/ui/modals/MealEntryModal"
// import { OptionsMenu } from "@/components/ui/modals/OptionsMenu"
// import { ImportFoodModal } from "@/components/ui/modals/ImportFoodModal"

export default function PlannerScreen() {
  const router = useRouter() // Inizializza useRouter
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // Rimuovi stati per la visibilità dei modali
  // const [isModalVisible, setIsModalVisible] = useState(false)
  // const [selectedMealType, setSelectedMealType] = useState("")
  // const [showOptionsMenu, setShowOptionsMenu] = useState(false)
  // const [showImportModal, setShowImportModal] = useState(false)

  const handleMealSelect = (mealType: string) => {
    // setSelectedMealType(mealType) // Non più necessario qui
    setIsMenuOpen(false)
    // Naviga alla route modale passando mealType
    router.push({ pathname: "/modals/meal-entry", params: { mealType } })
  }

  // handleSaveMeal non è più necessario qui

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ScreenHeader
          title="Planner"
          icon={<Entypo name="calendar" size={24} color="#000" />}
          showSearch={true}
          showOptions={true}
          // Naviga alla schermata Impostazioni
          onOptionsPress={() => router.push("/settings")}
        />

        {/* Rimuovi il rendering dei modali originali */}
        {/* <OptionsMenu ... /> */}

        <PlannerCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
        {/* Passa la nuova funzione handleMealSelect a MealPlanSheet */}
        <MealPlanSheet date={selectedDate} onAddMeal={handleMealSelect} />

        <View style={styles.fabContainer}>
          {/* MealTypeMenu rimane gestito localmente */}
          <MealTypeMenu visible={isMenuOpen} onSelect={handleMealSelect} onClose={() => setIsMenuOpen(false)} />
          <FloatingActionButton onPress={() => setIsMenuOpen(!isMenuOpen)} isOpen={isMenuOpen} />
        </View>

        {/* Rimuovi il rendering dei modali originali */}
        {/* <MealEntryModal ... /> */}
        {/* <ImportFoodModal ... /> */}
      </ThemedView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  fabContainer: {
    position: "absolute",
    right: 20,
    bottom: Platform.OS === "ios" ? 100 : 80,
    zIndex: 2,
    alignItems: "flex-end",
  },
})
