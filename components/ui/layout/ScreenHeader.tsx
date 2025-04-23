import type React from "react"
import { View, StyleSheet, Dimensions, Platform, StatusBar } from "react-native"
import { ThemedText } from "@/components/common/ThemedText"
import { IconButton } from "@/components/ui/buttons/IconButton"

interface ScreenHeaderProps {
  title: string
  icon?: React.ReactNode // Icona opzionale
  showSearch?: boolean
  showOptions?: boolean
  showBackButton?: boolean // Nuova prop
  onOptionsPress?: () => void
  onSearchPress?: () => void
  onBackPress?: () => void // Nuova prop
}

const { width, height } = Dimensions.get("window")
const STATUSBAR_HEIGHT = StatusBar.currentHeight || 0

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  icon,
  showSearch = true,
  showOptions = true,
  showBackButton = false, // Default a false
  onOptionsPress,
  onSearchPress,
  onBackPress, // Ricevi la prop
}) => {
  return (
    <View style={styles.header}>
      {/* Pulsante Indietro (condizionale) */}
      {showBackButton && (
        <IconButton
          icon="arrow-back"
          size={24}
          color="#666"
          onPress={onBackPress || (() => {})}
          style={styles.backButton} // Stile specifico per il back button
        />
      )}
      {/* Contenitore Titolo e Icona (se presente) */}
      <View style={[styles.titleContainer, !showBackButton && !icon && styles.titleContainerFullWidth]}>
        {icon && <View style={styles.iconWrapper}>{icon}</View>}
        <ThemedText style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </ThemedText>
      </View>
      {/* Azioni a destra */}
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
    flex: 1, // Permette al titolo di occupare lo spazio rimanente tra back e actions
    flexDirection: "row",
    alignItems: "center",
    // Rimuovi gap, gestito da iconWrapper
    paddingVertical: 2,
    height: 36,
    marginLeft: 0, // Rimuovi margine sinistro se non c'è back button
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
    justifyContent: "flex-end", // Allinea le azioni a destra
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 0,
    marginLeft: -15,
    borderRadius: 20,
  },
  iconWrapper: {
    marginRight: 8,
  },
  titleContainerFullWidth: {
    flex: 1,
  },
})

