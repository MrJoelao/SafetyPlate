import type React from "react"
import { View, TextInput, StyleSheet } from "react-native"
import { ThemedText } from "@/components/common/ThemedText"

interface NutritionInputProps {
  calories: string
  proteins: string
  carbs: string
  fats: string
  onCaloriesChange: (value: string) => void
  onProteinsChange: (value: string) => void
  onCarbsChange: (value: string) => void
  onFatsChange: (value: string) => void
}

export const NutritionInput: React.FC<NutritionInputProps> = ({
  calories,
  proteins,
  carbs,
  fats,
  onCaloriesChange,
  onProteinsChange,
  onCarbsChange,
  onFatsChange,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.field}>
          <ThemedText style={styles.label}>Calories</ThemedText>
          <TextInput
            style={styles.input}
            value={calories}
            onChangeText={onCaloriesChange}
            placeholder="0"
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
        <View style={styles.field}>
          <ThemedText style={styles.label}>Proteins</ThemedText>
          <TextInput
            style={styles.input}
            value={proteins}
            onChangeText={onProteinsChange}
            placeholder="0"
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.field}>
          <ThemedText style={styles.label}>Carbs</ThemedText>
          <TextInput
            style={styles.input}
            value={carbs}
            onChangeText={onCarbsChange}
            placeholder="0"
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
        <View style={styles.field}>
          <ThemedText style={styles.label}>Fats</ThemedText>
          <TextInput
            style={styles.input}
            value={fats}
            onChangeText={onFatsChange}
            placeholder="0"
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 6, 
  },
  row: {
    flexDirection: "row",
    gap: 6,
  },
  field: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 6, 
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  label: {
    fontSize: 11, 
    color: "#666",
    marginBottom: 2, 
    textAlign: "center",
  },
  input: {
    fontSize: 14, 
    color: "#1f1f1f",
    textAlign: "center",
    padding: 4, 
  },
})

