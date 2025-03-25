import { StyleSheet, SafeAreaView } from "react-native"
import { ThemedView } from "@/components/common/ThemedView"
import { ThemedText } from "@/components/common/ThemedText"

export default function Page() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ThemedText type="title">SafetyPlate</ThemedText>
        <ThemedText>Benvenuti su SafetyPlate!</ThemedText>
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
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
})

