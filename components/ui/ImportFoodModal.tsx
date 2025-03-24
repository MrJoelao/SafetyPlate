"use client"

import { useState, useRef } from "react"
import { Modal, StyleSheet, View, TouchableOpacity, Dimensions, Animated, type ScrollView } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import { FoodImportView } from "./FoodImportView"
import { InlineFoodManager } from "./InlineFoodManager"

interface ImportFoodModalProps {
  visible: boolean
  onClose: () => void
}

const { width, height } = Dimensions.get("window")

export function ImportFoodModal({ visible, onClose }: ImportFoodModalProps) {
  // State for active tab: 'manage' for food list, 'import' for import screen
  const [activeTab, setActiveTab] = useState<"manage" | "import">("manage")
  const slideAnim = useRef(new Animated.Value(0)).current
  const scrollViewRef = useRef<ScrollView>(null)

  // Handle tab change with animation
  const handleTabChange = (tab: "manage" | "import") => {
    if (tab === activeTab) return

    Animated.timing(slideAnim, {
      toValue: tab === "manage" ? 400 : -400,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(tab)
      slideAnim.setValue(tab === "manage" ? -400 : 400)

      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 24,
        tension: 180,
      }).start()

      scrollViewRef.current?.scrollTo({ y: 0, animated: false })
    })
  }

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <BlurView intensity={20} style={styles.backdrop}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHandle} />

          {/* Content */}
          <Animated.View style={[styles.contentContainer, { transform: [{ translateX: slideAnim }] }]}>
            {activeTab === "import" ? <FoodImportView onSuccess={onClose} /> : <InlineFoodManager />}
          </Animated.View>

          {/* Bottom Navigation Bar */}
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

