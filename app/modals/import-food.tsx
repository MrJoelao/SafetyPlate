"use client"

import { useState, useRef } from "react"
import { StyleSheet, View, TouchableOpacity, Dimensions, type ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context" // Importazione corretta
import { MaterialIcons } from "@expo/vector-icons"
import { FoodImportView } from "@/components/ui/modals/FoodImportView"
import { InlineFoodManager } from "@/components/ui/modals/InlineFoodManager"
import { useRouter } from "expo-router"

const { width, height } = Dimensions.get("window")

export default function ImportFoodModalScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"manage" | "import">("manage")
  const scrollViewRef = useRef<ScrollView>(null)
  const [isEditing, setIsEditing] = useState(false)

  const handleTabChange = (tab: "manage" | "import") => {
    if (tab === activeTab) return
    setActiveTab(tab)
    scrollViewRef.current?.scrollTo({ y: 0, animated: false })
  }

  // Funzione per chiudere il modale usando il router
  const handleClose = () => {
    router.back()
  }

  return (
    // SafeAreaView per gestire notch/barra stato
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Contenitore principale che simula il modale */}
      <View style={styles.modalContainer}>
        {/* Handle per indicare che è trascinabile (anche se non implementato qui) */}
        <TouchableOpacity onPress={handleClose} style={styles.closeButtonArea}>
          <View style={styles.modalHandle} />
        </TouchableOpacity>

        {/* Contenuto */}
        <View style={styles.contentContainer}>
          {activeTab === "import" ? (
            <FoodImportView onSuccess={handleClose} /> // Usa handleClose per tornare indietro
          ) : (
            <InlineFoodManager onEditStart={() => setIsEditing(true)} onEditEnd={() => setIsEditing(false)} />
          )}
        </View>

        {/* Barra di navigazione inferiore - Nascosta durante la modifica */}
        {!isEditing && (
          <View style={styles.bottomNavContainer}>
            <View style={styles.bottomNavPill}>
              <TouchableOpacity
                style={[styles.navButton, activeTab === "manage" && styles.activeNavButton]}
                onPress={() => handleTabChange("manage")}
              >
                <MaterialIcons name="restaurant" size={24} color={activeTab === "manage" ? "#000" : "#888"} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navButton, activeTab === "import" && styles.activeNavButton]}
                onPress={() => handleTabChange("import")}
              >
                <MaterialIcons name="file-download" size={24} color={activeTab === "import" ? "#000" : "#888"} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

// Stili adattati da ImportFoodModal.tsx
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent", // Sfondo gestito da Expo Router
  },
  modalContainer: {
    flex: 1, // Occupa tutto lo spazio
    backgroundColor: "#f5f5f5",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    // Rimuoviamo position: 'absolute' e bottom: 0
    marginTop: height * 0.05, // Simula il posizionamento originale
  },
  closeButtonArea: {
    // Area cliccabile più grande per l'handle
    paddingVertical: 10,
    alignItems: "center",
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    marginTop: 6, // Leggermente meno margine
    alignSelf: "center",
  },
  contentContainer: {
    flex: 1,
    width: "100%",
    marginTop: 4,
    paddingBottom: 80, // Spazio per la barra di navigazione
  },
  bottomNavContainer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomNavPill: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    borderRadius: 30,
    padding: 4,
    width: 180,
    height: 56,
    justifyContent: "space-between",
  },
  navButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 26,
  },
  activeNavButton: {
    backgroundColor: "#fff",
  },
})