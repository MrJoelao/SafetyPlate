"use client"

import { useState, useRef } from "react"
import { Modal, StyleSheet, View, TouchableOpacity, Dimensions, type ScrollView } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import { FoodImportView } from "@/components/ui/data-display/FoodImportView"
import { InlineFoodManager } from "@/components/ui/modals/InlineFoodManager"

interface ImportFoodModalProps {
  visible: boolean
  onClose: () => void
}

const { width, height } = Dimensions.get("window")

export function ImportFoodModal({ visible, onClose }: ImportFoodModalProps) {
  // State for active tab: 'manage' for food list, 'import' for import screen
  const [activeTab, setActiveTab] = useState<"manage" | "import">("manage")
  const scrollViewRef = useRef<ScrollView>(null)

  // Nuovo stato per tracciare se siamo in modalità di modifica
  const [isEditing, setIsEditing] = useState(false)

  // Simplified tab change without animation
  const handleTabChange = (tab: "manage" | "import") => {
    if (tab === activeTab) return
    setActiveTab(tab)
    scrollViewRef.current?.scrollTo({ y: 0, animated: false })
  }

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <BlurView intensity={20} style={styles.backdrop}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHandle} />

          {/* Content */}
          <View style={styles.contentContainer}>
            {activeTab === "import" ? (
              <FoodImportView onSuccess={onClose} />
            ) : (
              <InlineFoodManager onEditStart={() => setIsEditing(true)} onEditEnd={() => setIsEditing(false)} />
            )}
          </View>

          {/* Bottom Navigation Bar - Nascosta durante la modifica */}
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
      </BlurView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
  },
  modalContainer: {
    width: width,
    height: height,
    backgroundColor: "#f5f5f5",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    marginTop: 12,
    alignSelf: "center",
  },
  contentContainer: {
    flex: 1,
    width: "100%",
    marginTop: 4,
    paddingBottom: 80, // Space for bottom navigation
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
