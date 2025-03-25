import type React from "react"
import { TouchableOpacity, StyleSheet, type ViewStyle } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"

interface IconButtonProps {
  onPress: () => void
  icon: keyof typeof MaterialIcons.glyphMap
  size?: number
  color?: string
  backgroundColor?: string
  style?: ViewStyle
  disabled?: boolean
}

export const IconButton: React.FC<IconButtonProps> = ({
  onPress,
  icon,
  size = 24,
  color = "#333",
  backgroundColor = "transparent",
  style,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor }, style, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <MaterialIcons name={icon} size={size} color={color} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.6,
  },
})

