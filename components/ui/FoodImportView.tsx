"use client"

import { useState, useRef } from "react"
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Clipboard,
  Platform,
  Image,
} from "react-native"
import { ThemedText } from "@/components/ThemedText"
import { MaterialIcons, Feather } from "@expo/vector-icons"
import * as DocumentPicker from "expo-document-picker"
import * as FileSystem from "expo-file-system"
import { parseFoodFromText, saveFoods } from "@/utils/foodStorage"
import type { Food } from "@/types/food"

interface FoodImportViewProps {
  onSuccess: () => void
}

export function FoodImportView({ onSuccess }: FoodImportViewProps) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPasting, setIsPasting] = useState(false)
  const [previewFoods, setPreviewFoods] = useState<Food[]>([])
  const shakeAnimation = useRef(new Animated.Value(0)).current

  const shakeElement = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/plain", "application/json"],
      })

      if (!result.canceled) {
        setIsLoading(true)
        const file = result.assets[0]
        setFileName(file.name)

        const content = await FileSystem.readAsStringAsync(file.uri)
        processContent(content)
      }
    } catch (error) {
      Alert.alert("Errore", "Errore durante la lettura del file")
      console.error("Errore nella selezione del file:", error)
      shakeElement()
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasteFromClipboard = async () => {
    try {
      setIsPasting(true)

      // Get clipboard content
      let content = ""
      if (Platform.OS === "web") {
        content = await navigator.clipboard.readText()
      } else {
        content = await Clipboard.getString()
      }

      if (!content.trim()) {
        Alert.alert("Errore", "Appunti vuoti")
        return
      }

      processContent(content)
    } catch (error) {
      Alert.alert("Errore", "Impossibile leggere dagli appunti")
      console.error("Errore nell'incollare dagli appunti:", error)
      shakeElement()
    } finally {
      setIsPasting(false)
    }
  }

  const processContent = (content: string) => {
    const parseResult = parseFoodFromText(content)

    if (!parseResult.success) {
      Alert.alert("Errore", parseResult.error || "Errore nell'analisi del contenuto")
      setFileName(null)
      shakeElement()
      return
    }

    if (parseResult.foods && parseResult.foods.length === 0) {
      Alert.alert("Attenzione", "Nessun alimento trovato nel contenuto")
      setFileName(null)
      shakeElement()
      return
    }

    setPreviewFoods(parseResult.foods || [])
  }

  const handleSave = async () => {
    if (previewFoods.length === 0) {
      Alert.alert("Errore", "Nessun alimento da salvare")
      return
    }

    try {
      setIsLoading(true)
      const result = await saveFoods(previewFoods)
      if (result.success) {
        Alert.alert("Operazione completata", `Importati ${previewFoods.length} alimenti`, [{ text: "OK", onPress: onSuccess }])
        setFileName(null)
        setPreviewFoods([])
      } else {
        Alert.alert("Errore", result.error || "Errore nel salvare gli alimenti")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <ThemedText style={styles.headerTitle}>Importa Alimenti</ThemedText>
      </View>
      
      <View style={styles.importOptions}>
        <TouchableOpacity style={styles.importButton} onPress={handleFilePick} disabled={isLoading || isPasting}>
          <View style={styles.importButtonIcon}>
            <Feather name="file-text" size={24} color="#4CAF50" />
          </View>
          <View style={styles.importButtonTextContainer}>
            <ThemedText style={styles.importButtonText}>Seleziona File</ThemedText>
            <ThemedText style={styles.importButtonSubtext}>Formato .txt o .json</ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color="#999" />
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <ThemedText style={styles.dividerText}>oppure</ThemedText>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.importButton}
          onPress={handlePasteFromClipboard}
          disabled={isLoading || isPasting}
        >
          <View style={styles.importButtonIcon}>
            <Feather name="clipboard" size={24} color="#2196F3" />
          </View>
          <View style={styles.importButtonTextContainer}>
            <ThemedText style={styles.importButtonText}>Incolla dagli Appunti</ThemedText>
            <ThemedText style={styles.importButtonSubtext}>Testo copiato dalla clipboard</ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {(isLoading || isPasting) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <ThemedText style={styles.loadingText}>
            {isPasting ? "Elaborazione contenuto appunti..." : "Elaborazione file..."}
          </ThemedText>
        </View>
      )}

      {previewFoods.length > 0 && (
        <Animated.View 
          style={[
            styles.previewContainer, 
            {transform: [{translateX: shakeAnimation}]}
          ]}
        >
          <View style={styles.previewHeader}>
            <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
            <View>
              <ThemedText style={styles.previewTitle}>
                {previewFoods.length} alimenti trovati
              </ThemedText>
              {fileName && (
                <ThemedText style={styles.previewSubtitle}>
                  da {fileName}
                </ThemedText>
              )}
            </View>
          </View>

          <View style={styles.previewContent}>
            <ThemedText style={styles.previewText}>
              Premendo "Salva" verranno importati tutti gli alimenti trovati. Gli alimenti duplicati verranno aggiornati.
            </ThemedText>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Feather name="save" size={20} color="#fff" />
                <ThemedText style={styles.saveButtonText}>Salva Alimenti</ThemedText>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      )}

      {!isLoading && !isPasting && previewFoods.length === 0 && (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateImageContainer}>
            <MaterialIcons name="cloud-upload" size={64} color="#e0e0e0" />
          </View>
          <ThemedText style={styles.emptyStateTitle}>
            Nessun alimento importato
          </ThemedText>
          <ThemedText style={styles.emptyStateText}>
            Seleziona un file o incolla dagli appunti per iniziare
          </ThemedText>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start",
  },
  headerContainer: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
  },
  importOptions: {
    gap: 20,
  },
  importButton: {
    backgroundColor: "#f5f5f5",
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  importButtonIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  importButtonTextContainer: {
    flex: 1,
  },
  importButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  importButtonSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  dividerText: {
    paddingHorizontal: 16,
    color: "#888",
    fontSize: 14,
  },
  loadingContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
  },
  previewContainer: {
    marginTop: 30,
    backgroundColor: "#f5f5f5",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  previewSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  previewContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  previewText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  emptyStateImageContainer: {
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    maxWidth: 240,
  },
})

