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
      Alert.alert("Error", "Error reading file")
      console.error("Error picking file:", error)
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
        Alert.alert("Error", "Clipboard is empty")
        return
      }

      processContent(content)
    } catch (error) {
      Alert.alert("Error", "Could not read from clipboard")
      console.error("Error pasting from clipboard:", error)
      shakeElement()
    } finally {
      setIsPasting(false)
    }
  }

  const processContent = (content: string) => {
    const parseResult = parseFoodFromText(content)

    if (!parseResult.success) {
      Alert.alert("Error", parseResult.error || "Error parsing content")
      setFileName(null)
      shakeElement()
      return
    }

    if (parseResult.foods && parseResult.foods.length === 0) {
      Alert.alert("Warning", "No foods found in content")
      setFileName(null)
      shakeElement()
      return
    }

    setPreviewFoods(parseResult.foods || [])
  }

  const handleSave = async () => {
    if (previewFoods.length === 0) {
      Alert.alert("Error", "No foods to save")
      return
    }

    try {
      setIsLoading(true)
      const result = await saveFoods(previewFoods)
      if (result.success) {
        Alert.alert("Success", `Imported ${previewFoods.length} foods`, [{ text: "OK", onPress: onSuccess }])
        setFileName(null)
        setPreviewFoods([])
      } else {
        Alert.alert("Error", result.error || "Error saving foods")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.importOptions}>
        <TouchableOpacity style={styles.importButton} onPress={handleFilePick} disabled={isLoading || isPasting}>
          <Feather name="file" size={24} color="#000" />
          <ThemedText style={styles.importButtonText}>Select File</ThemedText>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <ThemedText style={styles.dividerText}>or</ThemedText>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.importButton}
          onPress={handlePasteFromClipboard}
          disabled={isLoading || isPasting}
        >
          <Feather name="clipboard" size={24} color="#000" />
          <ThemedText style={styles.importButtonText}>Paste from Clipboard</ThemedText>
        </TouchableOpacity>
      </View>

      {(isLoading || isPasting) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <ThemedText style={styles.loadingText}>
            {isPasting ? "Processing clipboard content..." : "Processing file..."}
          </ThemedText>
        </View>
      )}

      {previewFoods.length > 0 && (
        <View style={styles.previewContainer}>
          <View style={styles.previewHeader}>
            <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
            <ThemedText style={styles.previewTitle}>{previewFoods.length} foods found</ThemedText>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Feather name="save" size={20} color="#fff" />
                <ThemedText style={styles.saveButtonText}>Save Foods</ThemedText>
              </>
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
    padding: 20,
    justifyContent: "center",
  },
  importOptions: {
    gap: 20,
  },
  importButton: {
    backgroundColor: "#e0e0e0",
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
  },
  importButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
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
    backgroundColor: "#e0e0e0",
    borderRadius: 24,
    padding: 20,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
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
    fontWeight: "500",
    fontSize: 16,
  },
})

