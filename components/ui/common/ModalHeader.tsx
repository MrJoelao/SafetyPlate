import { View, StyleSheet, TouchableOpacity, Text } from "react-native" // Import Text
// Remove ThemedText import
// import { ThemedText } from "@/components/common/ThemedText"
import { Feather } from "@expo/vector-icons"

interface ModalHeaderProps {
  title: string;
  onClose?: () => void;
  onBack?: () => void; // Add onBack prop
  icon?: {
    name: string;
    color: string;
  };
  showIcon?: boolean;
  disabled?: boolean; // Applies to close/back buttons
}

export function ModalHeader({ title, onClose, onBack, icon, showIcon = true, disabled }: ModalHeaderProps) {
  // Header is always centered now, back/close buttons are absolutely positioned
  const headerJustifyContent = 'center';

  return (
    <View style={[styles.header, { justifyContent: headerJustifyContent }]}>
      {/* Back Button (Absolutely Positioned Left) */}
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.backButton} disabled={disabled}>
          <Feather name="chevron-left" size={26} color="#666" />
        </TouchableOpacity>
      )}

      {/* Title Area (Centered) */}
      <View style={styles.headerContent}>
        {icon && showIcon && <Feather name={icon.name as any} size={24} color={icon.color} />}
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>

      {/* Close Button (Absolutely Positioned Right) */}
      {onClose && (
        <TouchableOpacity onPress={onClose} style={styles.closeButton} disabled={disabled}>
          <Feather name="x" size={26} color="#666" />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    // justifyContent is now dynamic
    paddingHorizontal: 15, // Reduce horizontal padding slightly
    paddingVertical: 12, // Reduce vertical padding
    // marginTop: 4, // Remove top margin
    // borderBottomWidth: 1,
    // borderBottomColor: "#e0e0e0",
    position: 'relative',
    // minHeight: 50, // Remove minHeight, let content define height
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8, // Reduce gap when icon is shown
    // Allow content to shrink if needed, useful for centering
    flexShrink: 1,
  },
  title: {
    fontSize: 18, // Slightly smaller title
    fontWeight: "600",
    color: "#1f1f1f",
    textAlign: 'center', // Ensure text itself is centered if container is centered
  },
  closeButton: {
    position: 'absolute', // Position absolutely
    right: 10,
    top: 12, // Align with top padding (adjust as needed)
    // transform: [{ translateY: -17 }], // Remove transform
    padding: 4,
    zIndex: 1,
  },
  backButton: {
    position: 'absolute',
    left: 10,
    top: 12, // Align with top padding (adjust as needed)
    // transform: [{ translateY: -17 }], // Remove transform
    padding: 4,
    zIndex: 1,
  },
  // Placeholder is no longer needed as title is always centered by default flex behavior
  // placeholder: { ... },
})
