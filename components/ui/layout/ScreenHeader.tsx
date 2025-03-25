import type React from "react"
import { View, StyleSheet, Dimensions, Platform, StatusBar } from "react-native"
import { ThemedText } from "@/components/common/ThemedText"
import { IconButton } from "@/components/ui/buttons/IconButton"

interface ScreenHeaderProps {
  title: string
  icon: React.ReactNode
  showSearch?: boolean
  showOptions?: boolean
  onOptionsPress?: () => void
  onSearchPress?: () => void
}

const { width, height } = Dimensions.get("window")
const STATUSBAR_HEIGHT = StatusBar.currentHeight || 0

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  icon,
  showSearch = true,
  showOptions = true,
  onOptionsPress,
  onSearchPress,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        {icon}
        <ThemedText style={styles.title}>{title}</ThemedText>
      </View>
      <View style={styles.headerActions}>
        {showSearch && (
          <IconButton
            icon="search"
            size={24}
            color="#666"
            onPress={onSearchPress || (() => {})}
            style={styles.headerButton}
          />
        )}
        {showOptions && (
          <IconButton
            icon="more-vert"
            size={24}
            color="#666"
            onPress={onOptionsPress || (() => {})}
            style={styles.headerButton}
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: width * 0.05,
    paddingTop: Platform.OS === "ios" ? height * 0.05 : STATUSBAR_HEIGHT + height * 0.02,
    paddingBottom: height * 0.01,
    backgroundColor: "#fff",
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: Platform.OS === "ios" ? 80 : 70,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 2,
    height: 36,
  },
  title: {
    fontSize: Math.min(26, width * 0.065),
    fontWeight: "600",
    color: "#000",
    letterSpacing: 0.5,
    lineHeight: 30,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 20,
  },
})

