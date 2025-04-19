"use client"

import { StyleSheet, View, SafeAreaView, Dimensions, Platform, StatusBar } from "react-native"
import { ThemedView } from "@/components/common/ThemedView"
import { useState } from "react"
import { DiaryCalendar } from "@/components/diary/DiaryCalendar"
import { DiaryTimeSlots } from "@/components/diary/DiaryTimeSlots"
import { FloatingActionButton } from "@/components/ui/buttons/FloatingActionButton"
import { FontAwesome } from "@expo/vector-icons"
import { ScreenHeader } from "@/components/ui/layout/ScreenHeader"
import { MealTypeMenu } from "@/components/ui/modals/MealTypeMenu"
import { MealEntryModal } from "@/components/ui/modals/MealEntryModal"
import { ImportFoodModal } from "@/components/ui/modals/ImportFoodModal"
import { OptionsMenu } from "@/components/ui/modals/OptionsMenu"

export default function DiaryScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedMealType, setSelectedMealType] = useState("")
  const [showImportModal, setShowImportModal] = useState(false)
  const [showOptionsMenu, setShowOptionsMenu] = useState(false)

  const handleMealSelect = (mealType: string) => {
    setSelectedMealType(mealType)
    setIsMenuOpen(false)
    setIsModalVisible(true)
  }

  const handleSaveMeal = (mealData: any) => {
    console.log("Salvataggio pasto:", { type: selectedMealType, ...mealData })
    // Qui implementeremo la logica per salvare il pasto
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ScreenHeader
          title="Diary"
          icon={<FontAwesome name="bookmark" size={24} color="#000" />}
          onOptionsPress={() => setShowOptionsMenu(true)}
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

        <MealEntryModal
          visible={isModalVisible}
          mealType={selectedMealType}
          onClose={() => setIsModalVisible(false)}
          onSave={handleSaveMeal}
        />

        <OptionsMenu
          visible={showOptionsMenu}
          onClose={() => setShowOptionsMenu(false)}
          onImportPress={() => setShowImportModal(true)}
          onSettingsPress={() => {
            // TODO: Implementare la logica per le impostazioni
            console.log("Apri impostazioni")
          }}
        />

        <ImportFoodModal visible={showImportModal} onClose={() => setShowImportModal(false)} />
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
