import { View, StyleSheet, TextInput, ScrollView } from "react-native"
import { ThemedText } from "@/components/common/ThemedText"
import { ImagePicker } from "@/components/ui/forms/ImagePicker"
import { QuantityInput } from "@/components/ui/forms/QuantityInput"
import { NutritionInput } from "@/components/ui/forms/NutritionInput"

interface FoodFormProps {
  name: string
  score: string
  defaultUnit: string
  calories: string
  proteins: string
  carbs: string
  fats: string
  imageUri?: string
  onNameChange: (value: string) => void
  onScoreChange: (value: string) => void
  onUnitChange: (value: string) => void
  onCaloriesChange: (value: string) => void
  onProteinsChange: (value: string) => void
  onCarbsChange: (value: string) => void
  onFatsChange: (value: string) => void
  onImageSelected: (uri: string | undefined) => void
}

export function FoodForm({
  name,
  score,
  defaultUnit,
  calories,
  proteins,
  carbs,
  fats,
  imageUri,
  onNameChange,
  onScoreChange,
  onUnitChange,
  onCaloriesChange,
  onProteinsChange,
  onCarbsChange,
  onFatsChange,
  onImageSelected,
}: FoodFormProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Image Picker */}
      <View style={styles.section}>
        <ImagePicker imageUri={imageUri} onImageSelected={onImageSelected} />
      </View>

      {/* Basic Information */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Basic Information *</ThemedText>
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Food name"
            value={name}
            onChangeText={onNameChange}
            placeholderTextColor="#999"
          />
          <QuantityInput
            quantity={score}
            unit={defaultUnit}
            onQuantityChange={onScoreChange}
            onUnitChange={onUnitChange}
            label="Score & Unit"
          />
        </View>
      </View>

      {/* Nutrition Information */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Nutrition per 100g</ThemedText>
        <NutritionInput
          calories={calories}
          proteins={proteins}
          carbs={carbs}
          fats={fats}
          onCaloriesChange={onCaloriesChange}
          onProteinsChange={onProteinsChange}
          onCarbsChange={onCarbsChange}
          onFatsChange={onFatsChange}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80, // Space for footer
  },
  section: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  inputGroup: {
    gap: 12,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
})
