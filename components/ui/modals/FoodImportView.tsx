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
  ScrollView,
} from "react-native"
import { ThemedText } from "@/components/common/ThemedText"
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
  const [importedFoods, setImportedFoods] = useState<Food[]>([])
  const [importComplete, setImportComplete] = useState(false)
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
        setImportedFoods(previewFoods)
        setImportComplete(true)
        setPreviewFoods([])
      } else {
        Alert.alert("Errore", result.error || "Errore nel salvare gli alimenti")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteData = () => {
    Alert.alert("Conferma eliminazione", "Sei sicuro di voler eliminare questi dati importati?", [
      { text: "Annulla", style: "cancel" },
      {
        text: "Elimina",
        style: "destructive",
        onPress: () => {
          setImportedFoods([])
          setImportComplete(false)
          setFileName(null)
        },
      },
    ])
  }

  const handleClose = () => {
    onSuccess()
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerContainer}>
        <ThemedText style={styles.headerTitle}>Importa Alimenti</ThemedText>
      </View>

      {!importComplete ? (
        <>
          {previewFoods.length === 0 ? (
            <View style={styles.optionsContainer}>
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Seleziona una fonte</ThemedText>

                <TouchableOpacity style={styles.importCard} onPress={handleFilePick} disabled={isLoading || isPasting}>
                  <View style={styles.importCardIcon}>
                    <Feather name="file-text" size={24} color="#4CAF50" />
                  </View>
                  <View style={styles.importCardContent}>
                    <ThemedText style={styles.importCardTitle}>Seleziona File</ThemedText>
                    <ThemedText style={styles.importCardSubtext}>Importa da un file .txt o .json</ThemedText>
                  </View>
                  <Feather name="chevron-right" size={20} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.importCard}
                  onPress={handlePasteFromClipboard}
                  disabled={isLoading || isPasting}
                >
                  <View style={styles.importCardIcon}>
                    <Feather name="clipboard" size={24} color="#2196F3" />
                  </View>
                  <View style={styles.importCardContent}>
                    <ThemedText style={styles.importCardTitle}>Incolla dagli Appunti</ThemedText>
                    <ThemedText style={styles.importCardSubtext}>Usa testo copiato dalla clipboard</ThemedText>
                  </View>
                  <Feather name="chevron-right" size={20} color="#999" />
                </TouchableOpacity>
              </View>

              <View style={styles.infoSection}>
                <ThemedText style={styles.infoTitle}>Informazioni</ThemedText>
                <View style={styles.infoCard}>
                  <MaterialIcons name="info-outline" size={22} color="#666" style={styles.infoIcon} />
                  <ThemedText style={styles.infoText}>
                    Puoi importare alimenti da un file di testo o dagli appunti. Il formato deve essere JSON valido con
                    gli attributi richiesti.
                  </ThemedText>
                </View>
              </View>
            </View>
          ) : (
            <Animated.View style={[styles.previewContainer, { transform: [{ translateX: shakeAnimation }] }]}>
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Anteprima Importazione</ThemedText>

                <View style={styles.previewCard}>
                  <View style={styles.previewHeader}>
                    <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
                    <View>
                      <ThemedText style={styles.previewTitle}>{previewFoods.length} alimenti trovati</ThemedText>
                      {fileName && <ThemedText style={styles.previewSubtitle}>da {fileName}</ThemedText>}
                    </View>
                  </View>

                  <View style={styles.previewContent}>
                    <ThemedText style={styles.previewText}>
                      Gli alimenti verranno aggiunti al tuo database personale. Quelli con nomi identici verranno
                      aggiornati.
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
                </View>
              </View>
            </Animated.View>
          )}

          {(isLoading || isPasting) && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <ThemedText style={styles.loadingText}>
                {isPasting ? "Elaborazione contenuto appunti..." : "Elaborazione file..."}
              </ThemedText>
            </View>
          )}
        </>
      ) : (
        <View style={styles.successContainer}>
          <View style={styles.successCard}>
            <View style={styles.successIconContainer}>
              <MaterialIcons name="check-circle" size={64} color="#4CAF50" />
            </View>

            <ThemedText style={styles.successTitle}>Importazione completata!</ThemedText>

            <ThemedText style={styles.successText}>
              {importedFoods.length} alimenti sono stati importati con successo
            </ThemedText>

            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Feather name="check" size={20} color="#fff" />
                <ThemedText style={styles.closeButtonText}>Chiudi</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteData}>
                <Feather name="trash-2" size={20} color="#fff" />
                <ThemedText style={styles.deleteButtonText}>Elimina dati</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  optionsContainer: {
    gap: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 16,
    marginLeft: 4,
  },
  importCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 12,
  },
  importCardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  importCardContent: {
    flex: 1,
    marginLeft: 14,
  },
  importCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  importCardSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  infoSection: {
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 16,
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
    lineHeight: 20,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    zIndex: 10,
  },
  loadingText: {
    marginTop: 16,
    color: "#666",
  },
  previewContainer: {
    paddingTop: 8,
  },
  previewCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
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
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  previewText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
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
  successContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  successCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
  buttonGroup: {
    flexDirection: "column",
    gap: 12,
    width: "100%",
  },
  closeButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: "#E53935",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
})

