import React from "react"
import { StyleSheet } from "react-native"
import { Appbar } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { InlineFoodManager } from "@/components/ui/modals/InlineFoodManager"

export default function ManageFoodScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Gestisci Alimenti" />
      </Appbar.Header>
      {/* Utilizziamo il componente esistente per la UI di gestione */}
      <InlineFoodManager />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5", // Manteniamo lo sfondo coerente
  },
})