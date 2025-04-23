import { useState } from "react"
import { StyleSheet, View, SafeAreaView, Platform } from "react-native"
import { useRouter } from "expo-router"
import { ThemedView } from "@/components/common/ThemedView"
import { ScreenHeader } from "@/components/ui/layout/ScreenHeader"
import { Entypo } from "@expo/vector-icons"

export default function PlannerScreen() {
  const router = useRouter()
  
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
