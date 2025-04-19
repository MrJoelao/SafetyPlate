import { View, StyleSheet, TouchableOpacity } from "react-native"
import { ThemedText } from "@/components/common/ThemedText"
import { Feather } from "@expo/vector-icons"

interface ModalHeaderProps {
  title: string
  onClose?: () => void
  icon?: {
    name: string
    color: string
  }
  disabled?: boolean
}

export function ModalHeader({ title, onClose, icon, disabled }: ModalHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        {icon && <Feather name={icon.name as any} size={24} color={icon.color} />}
        <ThemedText style={styles.title}>{title}</ThemedText>
      </View>
      {onClose && (
        <TouchableOpacity onPress={onClose} style={styles.closeButton} disabled={disabled}>
          <Feather name="x" size={24} color="#666" />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f1f1f",
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
})
