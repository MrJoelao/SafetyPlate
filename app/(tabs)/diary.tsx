"use client"

import { StyleSheet, View, SafeAreaView, Dimensions, Platform, StatusBar, ScrollView, ActivityIndicator, Text } from "react-native"
import { ThemedView } from "@/components/common/ThemedView"
import { useState, useEffect } from "react"
import { useRouter } from "expo-router"
import { Calendar } from "@/components/ui/data-display/Calendar"
import { TimeSlots } from "@/components/ui/data-display/TimeSlots"
import { FloatingActionButton } from "@/components/ui/buttons/FloatingActionButton"
import { FontAwesome } from "@expo/vector-icons"
import { ScreenHeader } from "@/components/ui/layout/ScreenHeader"
import { MealTypeMenu } from "@/components/ui/modals/MealTypeMenu"
import { useDiary } from "@/hooks/useDiary"

export default function DiaryScreen() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { timeSlots, isLoading, error, refreshDiary, setSelectedDate: setDiaryDate } = useDiary(selectedDate)

  // Update diary data when selected date changes
  useEffect(() => {
    setDiaryDate(selectedDate)
  }, [selectedDate, setDiaryDate])

  const handleMealSelect = (mealType: string) => {
    setIsMenuOpen(false)
    router.push({ pathname: "/modals/meal-entry", params: { mealType, date: selectedDate.toISOString() } })
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
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
          <Calendar selectedDate={selectedDate} onDateSelect={handleDateSelect} />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Caricamento dati...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollableContent}
            contentContainerStyle={{ paddingBottom: BOTTOM_TAB_HEIGHT + 32 }}
            showsVerticalScrollIndicator={true}
          >
            <TimeSlots textColor="#000" activities={timeSlots} />
          </ScrollView>
        )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#e74c3c",
    textAlign: "center",
  },
})
