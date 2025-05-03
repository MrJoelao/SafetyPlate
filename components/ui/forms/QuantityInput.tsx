import type React from "react"
import { View, TextInput, StyleSheet, Text } from "react-native" // Import Text
// Remove ThemedText import
// import { ThemedText } from "@/components/common/ThemedText"

interface QuantityInputProps {
  quantity: string
  unit: string
  onQuantityChange: (value: string) => void
  onUnitChange: (value: string) => void
  label?: string
}

export const QuantityInput: React.FC<QuantityInputProps> = ({
  quantity,
  unit,
  onQuantityChange,
  onUnitChange,
  label,
}) => {
  return (
    <View style={styles.container}>
      {/* Replace ThemedText with Text */}
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.quantityInput}
          value={quantity}
          onChangeText={onQuantityChange}
          placeholder="0"
          keyboardType="numeric"
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.unitInput}
          value={unit}
          onChangeText={onUnitChange}
          placeholder="g"
          placeholderTextColor="#999"
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  quantityInput: {
    flex: 2,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: "#1f1f1f",
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  unitInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: "#1f1f1f",
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
})

