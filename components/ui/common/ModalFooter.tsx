import { View, StyleSheet, Platform } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { ActionButton } from "@/components/ui/buttons/ActionButton"

interface ModalFooterProps {
  onSave: () => void
  isLoading?: boolean
  disabled?: boolean
  saveLabel?: string
  saveIcon?: keyof typeof MaterialIcons.glyphMap
  style?: any
}

export function ModalFooter({
  onSave,
  isLoading,
  disabled,
  saveLabel = "Save",
  saveIcon = "save",
  style,
}: ModalFooterProps) {
  return (
    <View style={[styles.footer, style]}>
      <ActionButton
        onPress={onSave}
        label={saveLabel}
        icon={saveIcon}
        variant="primary"
        disabled={isLoading || disabled}
        style={styles.saveButton}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
    backgroundColor: "#f5f5f5",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
})
