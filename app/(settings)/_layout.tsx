import { Stack } from "expo-router"

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Le schermate all'interno di questo gruppo avranno il proprio header */}
      <Stack.Screen name="import-food" />
      <Stack.Screen name="manage-food" />
      <Stack.Screen name="theme" />
      <Stack.Screen name="user-info" />
      {/* Aggiungere altre schermate specifiche delle impostazioni qui se necessario */}
    </Stack>
  )
}
