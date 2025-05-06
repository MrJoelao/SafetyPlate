import type React from "react"
import { TouchableOpacity, StyleSheet, type ViewStyle, type TextStyle, Text } from "react-native" // Import Text
import { MaterialIcons } from "@expo/vector-icons"
// Remove ThemedText import
// import { ThemedText } from "@/components/common/ThemedText"

interface ActionButtonProps {
  onPress: () => void
  label: string
  icon?: keyof typeof MaterialIcons.glyphMap
  variant?: "primary" | "secondary" | "danger" | "success"
  size?: "small" | "medium" | "large"
  style?: ViewStyle
  textStyle?: TextStyle
  disabled?: boolean
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  onPress,
  label,
  icon,
  variant = "primary",
  size = "medium",
  style,
  textStyle,
  disabled = false,
}) => {
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case "primary":
        return { backgroundColor: "#2196F3" }
      case "secondary":
        return { backgroundColor: "#f5f5f5", borderWidth: 1, borderColor: "#e0e0e0" }
      case "danger":
        return { backgroundColor: "#E53935" }
      case "success":
        return { backgroundColor: "#4CAF50" }
      default:
        return { backgroundColor: "#2196F3" }
    }
  }

  const getTextColor = (): string => {
    return variant === "secondary" ? "#333" : "#fff"
  }

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case "small":
        return { paddingVertical: 8, paddingHorizontal: 12 }
      case "large":
        return { paddingVertical: 16, paddingHorizontal: 24 }
      default:
        return { paddingVertical: 12, paddingHorizontal: 16 }
    }
  }

  return (
    <TouchableOpacity
      style={[styles.button, getVariantStyles(), getSizeStyles(), disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
    >
      {icon && (
        <MaterialIcons
          name={icon}
          size={size === "small" ? 16 : size === "large" ? 24 : 20}
          color={getTextColor()}
          style={styles.icon}
        />
      )}
      {/* Replace ThemedText with Text */}
      <Text
        style={[
          styles.text,
          { color: getTextColor() },
          size === "small" ? { fontSize: 14 } : size === "large" ? { fontSize: 18 } : { fontSize: 16 },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    gap: 8,
  },
  text: {
    fontWeight: "600",
  },
  icon: {
    marginRight: 4,
  },
  disabled: {
    opacity: 0.6,
  },
})
