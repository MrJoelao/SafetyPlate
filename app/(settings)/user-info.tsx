import React, { useState, useEffect } from "react"
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native"
import { useRouter } from "expo-router"
import { ScreenHeader } from "@/components/ui/layout/ScreenHeader"
import { TextInput, Button, Text, Divider, HelperText } from "react-native-paper"
import AsyncStorage from "@react-native-async-storage/async-storage"

// User info storage key
const USER_INFO_STORAGE_KEY = "user_info"

// User info interface
interface UserInfo {
  name: string
  age: string
  weight: string
  height: string
  gender: string
  allergies: string
  dietaryRestrictions: string
}

// Initial user info
const initialUserInfo: UserInfo = {
  name: "",
  age: "",
  weight: "",
  height: "",
  gender: "",
  allergies: "",
  dietaryRestrictions: "",
}

export default function UserInfoScreen() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<UserInfo>(initialUserInfo)
  const [isLoading, setIsLoading] = useState(true)
  const [errors, setErrors] = useState<Partial<Record<keyof UserInfo, string>>>({})

  // Load saved user info on component mount
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const savedUserInfo = await AsyncStorage.getItem(USER_INFO_STORAGE_KEY)
        if (savedUserInfo) {
          setUserInfo(JSON.parse(savedUserInfo))
        }
      } catch (error) {
        console.error("Error loading user info:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserInfo()
  }, [])

  // Handle input change
  const handleInputChange = (field: keyof UserInfo, value: string) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }))
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Validate user info
  const validateUserInfo = (): boolean => {
    const newErrors: Partial<Record<keyof UserInfo, string>> = {}

    // Name validation
    if (!userInfo.name.trim()) {
      newErrors.name = "Il nome è obbligatorio"
    }

    // Age validation
    if (userInfo.age) {
      const age = parseInt(userInfo.age)
      if (isNaN(age) || age <= 0 || age > 120) {
        newErrors.age = "L'età deve essere un numero valido (1-120)"
      }
    }

    // Weight validation
    if (userInfo.weight) {
      const weight = parseFloat(userInfo.weight)
      if (isNaN(weight) || weight <= 0 || weight > 500) {
        newErrors.weight = "Il peso deve essere un numero valido (in kg)"
      }
    }

    // Height validation
    if (userInfo.height) {
      const height = parseInt(userInfo.height)
      if (isNaN(height) || height <= 0 || height > 300) {
        newErrors.height = "L'altezza deve essere un numero valido (in cm)"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Save user info
  const saveUserInfo = async () => {
    if (!validateUserInfo()) {
      return
    }

    try {
      await AsyncStorage.setItem(USER_INFO_STORAGE_KEY, JSON.stringify(userInfo))
      Alert.alert(
        "Informazioni Salvate",
        "Le tue informazioni personali sono state salvate con successo.",
        [{ text: "OK" }]
      )
    } catch (error) {
      console.error("Error saving user info:", error)
      Alert.alert(
        "Errore",
        "Si è verificato un errore durante il salvataggio delle informazioni.",
        [{ text: "OK" }]
      )
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScreenHeader
        title="Informazioni Utente"
        showBackButton={true}
        onBackPress={() => router.back()}
        showSearch={false}
        showOptions={false}
      />
      <ScrollView style={styles.scrollView}>
        <Text style={styles.sectionTitle}>Informazioni Personali</Text>
        <Text style={styles.description}>
          Inserisci le tue informazioni personali per personalizzare l'esperienza dell'app.
        </Text>

        <TextInput
          label="Nome"
          value={userInfo.name}
          onChangeText={(value) => handleInputChange("name", value)}
          style={styles.input}
          mode="outlined"
          error={!!errors.name}
        />
        {errors.name && <HelperText type="error">{errors.name}</HelperText>}

        <TextInput
          label="Età"
          value={userInfo.age}
          onChangeText={(value) => handleInputChange("age", value)}
          style={styles.input}
          mode="outlined"
          keyboardType="numeric"
          error={!!errors.age}
        />
        {errors.age && <HelperText type="error">{errors.age}</HelperText>}

        <View style={styles.row}>
          <TextInput
            label="Peso (kg)"
            value={userInfo.weight}
            onChangeText={(value) => handleInputChange("weight", value)}
            style={[styles.input, styles.halfInput]}
            mode="outlined"
            keyboardType="numeric"
            error={!!errors.weight}
          />
          <TextInput
            label="Altezza (cm)"
            value={userInfo.height}
            onChangeText={(value) => handleInputChange("height", value)}
            style={[styles.input, styles.halfInput]}
            mode="outlined"
            keyboardType="numeric"
            error={!!errors.height}
          />
        </View>
        <View style={styles.row}>
          {errors.weight && <HelperText type="error" style={styles.halfInput}>{errors.weight}</HelperText>}
          {errors.height && <HelperText type="error" style={styles.halfInput}>{errors.height}</HelperText>}
        </View>

        <TextInput
          label="Genere"
          value={userInfo.gender}
          onChangeText={(value) => handleInputChange("gender", value)}
          style={styles.input}
          mode="outlined"
        />

        <Divider style={styles.divider} />

        <Text style={styles.sectionTitle}>Informazioni Dietetiche</Text>
        <Text style={styles.description}>
          Queste informazioni ci aiuteranno a personalizzare i suggerimenti alimentari.
        </Text>

        <TextInput
          label="Allergie"
          value={userInfo.allergies}
          onChangeText={(value) => handleInputChange("allergies", value)}
          style={styles.input}
          mode="outlined"
          multiline
          numberOfLines={3}
          placeholder="Es. lattosio, glutine, arachidi..."
        />

        <TextInput
          label="Restrizioni Dietetiche"
          value={userInfo.dietaryRestrictions}
          onChangeText={(value) => handleInputChange("dietaryRestrictions", value)}
          style={styles.input}
          mode="outlined"
          multiline
          numberOfLines={3}
          placeholder="Es. vegetariano, vegano, senza glutine..."
        />

        <Button
          mode="contained"
          onPress={saveUserInfo}
          style={styles.saveButton}
          labelStyle={styles.saveButtonText}
        >
          Salva Informazioni
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    color: "#666",
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  divider: {
    marginVertical: 24,
  },
  saveButton: {
    marginTop: 24,
    marginBottom: 40,
    paddingVertical: 8,
    backgroundColor: "#0a7ea4",
  },
  saveButtonText: {
    fontSize: 16,
  },
})