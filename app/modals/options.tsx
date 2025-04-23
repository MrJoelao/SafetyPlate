import { View, StyleSheet, Dimensions, Pressable } from "react-native"
import { ThemedText } from "@/components/common/ThemedText"
import { MaterialIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"

export default function OptionsMenuScreen() {
  const router = useRouter()

  const handleImportPress = () => {
    router.back() // Chiude questo modale prima di aprire il prossimo
    router.push("/modals/import-food")
  }

  const handleSettingsPress = () => {
    // TODO: Implementare la navigazione alla schermata Impostazioni
    console.log("Naviga a Impostazioni")
    router.back() // Chiude il modale
  }

  return (
    // SafeAreaView per evitare sovrapposizioni, edges vuoto per non aggiungere padding
    <SafeAreaView style={styles.safeArea} edges={[]}>
      {/* Pressable esterno per chiudere il menu cliccando sullo sfondo */}
      <Pressable style={styles.backdrop} onPress={() => router.back()}>
        {/* Contenitore effettivo del menu, posizionato */}
        <View style={styles.menuContainer}>
          {/* Impedisce la chiusura cliccando dentro il menu */}
          <Pressable>
            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
              onPress={handleImportPress}
            >
              <View style={styles.menuItemContent}>
                <View style={[styles.iconContainer, { backgroundColor: "#e8f5e9" }]}>
                  <MaterialIcons name="upload-file" size={18} color="#4CAF50" />
                </View>
                <ThemedText style={styles.menuText}>Importa Alimenti</ThemedText>
              </View>
            </Pressable>

            <View style={styles.divider} />

            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
              onPress={handleSettingsPress}
            >
              <View style={styles.menuItemContent}>
                <View style={[styles.iconContainer, { backgroundColor: "#f5f5f5" }]}>
                  <MaterialIcons name="settings" size={18} color="#757575" />
                </View>
                <ThemedText style={styles.menuText}>Impostazioni</ThemedText>
              </View>
            </Pressable>
          </Pressable>
        </View>
      </Pressable>
    </SafeAreaView>
  )
}

const { width } = Dimensions.get("window")

// Stili adattati da OptionsMenu.tsx
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent", // Lo sfondo è gestito da Expo Router
  },
  backdrop: {
    flex: 1,
    // Non serve backgroundColor qui, è gestito da contentStyle in _layout.tsx
    alignItems: "flex-end", // Allinea il menu a destra
  },
  menuContainer: {
    position: "absolute", // Mantiene il posizionamento assoluto
    top: 65, // Stessa posizione verticale
    right: width * 0.05, // Stessa posizione orizzontale
    backgroundColor: "#fff",
    borderRadius: 12,
    width: 200,
    paddingVertical: 6,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    overflow: "hidden",
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  menuItem: {
    padding: 8,
    paddingHorizontal: 12,
  },
  menuItemPressed: {
    backgroundColor: "#f5f5f5",
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  menuText: {
    fontSize: 14,
    color: "#1f1f1f",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 4,
  },
})