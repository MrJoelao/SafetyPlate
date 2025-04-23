"use client"

import { StyleSheet, View, SafeAreaView, Dimensions, Platform, StatusBar } from "react-native"
import { ThemedView } from "@/components/common/ThemedView"
import { useState } from "react"
import { useRouter } from "expo-router"
import { DiaryCalendar } from "@/components/diary/DiaryCalendar"
import { DiaryTimeSlots } from "@/components/diary/DiaryTimeSlots"
import { FloatingActionButton } from "@/components/ui/buttons/FloatingActionButton"
import { FontAwesome } from "@expo/vector-icons"
import { ScreenHeader } from "@/components/ui/layout/ScreenHeader"
import { MealTypeMenu } from "@/components/ui/modals/MealTypeMenu"

export default function DiaryScreen() {
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
          title="Diary"
          icon={<FontAwesome name="bookmark" size={24} color="#000" />}
          onOptionsPress={() => router.push("/settings")}
        />

        <View style={styles.stickyHeader}>
          <DiaryCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
        </View>

        <View style={styles.scrollableContent}>
          <DiaryTimeSlots textColor="#000" />
        </View>

        <View style={styles.fabContainer}>
          <MealTypeMenu visible={isMenuOpen} onSelect={handleMealSelect} onClose={() => setIsMenuOpen(false)} />
          <FloatingActionButton onPress={() => setIsMenuOpen(!isMenuOpen)} isOpen={isMenuOpen} />
        </View>
      </ThemedView>
    </SafeAreaView>
  )
}

const { width, height } = Dimensions.get("window")
const STATUSBAR_HEIGHT = StatusBar.currentHeight || 0
const BOTTOM_TAB_HEIGHT = Platform.OS === "ios" ? 100 : 80

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  stickyHeader: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    zIndex: 1,
    marginTop: -4,
  },
  scrollableContent: {
    flex: 1,
    backgroundColor: "#fff",
  },
  fabContainer: {
    position: "absolute",
    right: width * 0.05,
    bottom: BOTTOM_TAB_HEIGHT + 16,
    zIndex: 2,
    alignItems: "flex-end",
  },
})
