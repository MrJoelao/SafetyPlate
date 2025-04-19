"use client"

import { useState } from "react"
import { View, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { ThemedText } from "@/components/common/ThemedText"
import * as ImagePickerExpo from "expo-image-picker"

interface ImagePickerProps {
  imageUri?: string
  onImageSelected: (uri: string) => void
}

export function ImagePicker({ imageUri, onImageSelected }: ImagePickerProps) {
  const [loading, setLoading] = useState(false)

  const pickImage = async () => {
    setLoading(true)
    try {
      // Request permissions
      const { status } = await ImagePickerExpo.requestMediaLibraryPermissionsAsync()

      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!")
        return
      }

      // Launch image picker
      const result = await ImagePickerExpo.launchImageLibraryAsync({
        mediaTypes: ImagePickerExpo.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onImageSelected(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error picking image:", error)
      alert("Failed to pick image. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.imageContainer} onPress={pickImage} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholderContainer}>
            <MaterialIcons name="add-a-photo" size={32} color="#999" />
            <ThemedText style={styles.placeholderText}>Aggiungi foto</ThemedText>
          </View>
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 16,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
})
