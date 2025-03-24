"use client"

import { useState, useRef } from "react"
import { View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Animated, TextInput } from "react-native"
import { ThemedText } from "@/components/ThemedText"
import { Feather } from "@expo/vector-icons"
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
  const [previewFoods, setPreviewFoods] = useState<Food[]>([])
  const [pasteContent, setPasteContent] = useState("")
  const shakeAnimation = useRef(new Animated.Value(0)).current

  const shakeUploadArea = () => {
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
        const parseResult = parseFoodFromText(content)

        if (!parseResult.success) {
          Alert.alert("Errore", parseResult.error || "Errore durante la lettura del file")
          setFileName(null)
          shakeUploadArea()
          return
        }

        if (parseResult.foods && parseResult.foods.length === 0) {
          Alert.alert("Attenzione", "Nessun alimento trovato nel file")
          setFileName(null)
          shakeUploadArea()
          return
        }

        setPreviewFoods(parseResult.foods || [])
      }
    } catch (error) {
      Alert.alert("Errore", "Errore durante la lettura del file")
      console.error("Error picking file:", error)
      shakeUploadArea()
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasteContent = () => {
    if (!pasteContent.trim()) {
      Alert.alert("Errore", "Incolla del testo prima di procedere")
      return
    }

    setIsLoading(true)
    const parseResult = parseFoodFromText(pasteContent)

    if (!parseResult.success) {
      Alert.alert("Errore", parseResult.error || "Errore durante la lettura del testo")
      shakeUploadArea()
      setIsLoading(false)
      return
    }

    if (parseResult.foods && parseResult.foods.length === 0) {
      Alert.alert("Attenzione", "Nessun alimento trovato nel testo")
      shakeUploadArea()
      setIsLoading(false)
      return
    }

    setPreviewFoods(parseResult.foods || [])
    setIsLoading(false)
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
        Alert.alert("Successo", `Importati ${previewFoods.length} alimenti`, [{ text: "OK", onPress: onSuccess }])
        setFileName(null)
        setPreviewFoods([])
        setPasteContent("")
      } else {
        Alert.alert("Errore", result.error || "Errore durante il salvataggio")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.uploadArea, { transform: [{ translateX: shakeAnimation }] }]}>
        <TouchableOpacity style={styles.uploadContent} onPress={handleFilePick} disabled={isLoading}>
          <View style={styles.uploadIcon}>
            <Feather name="upload" size={32} color="#888" />
          </View>
          <ThemedText style={styles.uploadTitle}>Select a file</ThemedText>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <ThemedText style={styles.dividerText}>or</ThemedText>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.pasteContainer}>
        <TextInput
          style={styles.pasteInput}
          placeholder="Paste your food data here..."
          multiline
          value={pasteContent}
          onChangeText={setPasteContent}
          placeholderTextColor="#888"
        />
        <TouchableOpacity
          style={styles.pasteButton}
          onPress={handlePasteContent}
          disabled={isLoading || !pasteContent.trim()}
        >
          <ThemedText style={styles.pasteButtonText}>Import from text</ThemedText>
        </TouchableOpacity>
      </View>

      {previewFoods.length > 0 && (
        <View style={styles.previewContainer}>
          <ThemedText style={styles.previewTitle}>{previewFoods.length} foods found</ThemedText>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <ThemedText style={styles.saveButtonText}>Save foods</ThemedText>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  uploadArea: {
    height: 150,
    borderRadius: 24,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  uploadContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  uploadIcon: {
    marginBottom: 8,
  },
  uploadTitle: {
    fontSize: 16,
    color: "#000",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  dividerText: {
    paddingHorizontal: 16,
    color: "#888",
  },
  pasteContainer: {
    marginBottom: 24,
  },
  pasteInput: {
    height: 150,
    borderRadius: 24,
    backgroundColor: "#e0e0e0",
    padding: 16,
    marginBottom: 16,
    textAlignVertical: "top",
    color: "#000",
  },
  pasteButton: {
    backgroundColor: "#e0e0e0",
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
  },
  pasteButtonText: {
    color: "#000",
    fontWeight: "500",
  },
  previewContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#e0e0e0",
    borderRadius: 24,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 16,
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
})

