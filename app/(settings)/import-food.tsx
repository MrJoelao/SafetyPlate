import React from "react"
import { StyleSheet } from "react-native"
import { Appbar } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { FoodImportView } from "@/components/ui/modals/FoodImportView"

export default function ImportFoodScreen() {
  const router = useRouter()

  // Funzione da chiamare quando l'importazione ha successo
  const handleSuccess = () => {
    // Potremmo mostrare un messaggio di successo prima di tornare indietro
    router.back()
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Importa Alimenti" />
      </Appbar.Header>
      {/* Utilizziamo il componente esistente per la UI di importazione */}
      <FoodImportView onSuccess={handleSuccess} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5", // Manteniamo lo sfondo coerente
  },
})