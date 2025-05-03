import { View, StyleSheet, TouchableOpacity, Text } from "react-native" // Import Text
// Remove ThemedText import
// import { ThemedText } from "@/components/common/ThemedText"
import { Feather } from "@expo/vector-icons"

interface ModalHeaderProps {
  title: string
  onClose?: () => void;
  icon?: {
    name: string;
    color: string;
  };
  showIcon?: boolean; // Add prop to control icon visibility
  disabled?: boolean;
}

export function ModalHeader({ title, onClose, icon, showIcon = true, disabled }: ModalHeaderProps) {
  // Determine header justification based on icon visibility
  const headerJustifyContent = showIcon ? 'space-between' : 'center';

  return (
    // Apply dynamic justification and remove bottom border for potentially tighter layout
    <View style={[styles.header, { justifyContent: headerJustifyContent }]}>
      {/* Conditionally render an empty view to help center title when icon is hidden and close button is present */}
      {!showIcon && onClose && <View style={styles.placeholder} />}

      <View style={styles.headerContent}>
        {/* Conditionally render icon */}
        {icon && showIcon && <Feather name={icon.name as any} size={24} color={icon.color} />}
        <Text style={styles.title}>{title}</Text>
      </View>

      {onClose && (
        // Position close button absolutely to ensure alignment regardless of title centering
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
    // justifyContent is now dynamic
    paddingHorizontal: 15, // Reduce horizontal padding slightly
    paddingVertical: 12, // Reduce vertical padding
    // marginTop: 4, // Remove top margin
    // borderBottomWidth: 1, // Remove bottom border
    // borderBottomColor: "#e0e0e0",
    position: 'relative', // Needed for absolute positioning of close button
    minHeight: 50, // Ensure a minimum height
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
    right: 10, // Position from the right edge
    top: '50%', // Align vertically
    transform: [{ translateY: -16 }], // Adjust vertical centering based on button size (padding + icon size / 2)
    padding: 4, // Reduce padding slightly
    zIndex: 1, // Ensure it's above other elements
  },
  placeholder: { // Empty view to balance the close button for centering
    width: 24 + 8, // Match the approximate width of the close button area
  },
})
