"use client"

import { useState } from "react"
import { StyleSheet, View, SafeAreaView, Platform } from "react-native"
import { useRouter } from "expo-router"
import { ThemedView } from "@/components/common/ThemedView"
import { PlannerCalendar } from "@/components/planner/PlannerCalendar"
import { MealPlanSheet } from "@/components/planner/MealPlanSheet"
import { FloatingActionButton } from "@/components/ui/buttons/FloatingActionButton"
import { ScreenHeader } from "@/components/ui/layout/ScreenHeader"
import { Entypo } from "@expo/vector-icons"
import { MealTypeMenu } from "@/components/ui/modals/MealTypeMenu"

export default function PlannerScreen() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleMealSelect = (mealType: string) => {
    setIsMenuOpen(false)
    router.push({ pathname: "/modals/meal-entry", params: { mealType } })
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ScreenHeader
          title="Planner"
          icon={<Entypo name="calendar" size={24} color="#000" />}
          showSearch={true}
          showOptions={true}
          onOptionsPress={() => router.push("/settings")}
        />

        <PlannerCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
        <MealPlanSheet date={selectedDate} onAddMeal={handleMealSelect} />

        <View style={styles.fabContainer}>
          /* MealTypeMenu rimane gestito localmente */
          <MealTypeMenu visible={isMenuOpen} onSelect={handleMealSelect} onClose={() => setIsMenuOpen(false)} />
          <FloatingActionButton onPress={() => setIsMenuOpen(!isMenuOpen)} isOpen={isMenuOpen} />
            
        </View>
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
