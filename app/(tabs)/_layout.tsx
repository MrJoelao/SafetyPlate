import { Tabs } from "expo-router"
import { Platform, Appearance } from "react-native"
import { CustomTabBar } from "@/components/ui/navigation/CustomTabBar"
import { useAppContext } from "@/store/context"
import { OnboardingGuard } from '@/components/ui/navigation/NavigationGuard'

export default function TabLayout() {
  const { state: appState } = useAppContext()

  // Determine color scheme from app state
  const colorScheme = appState.theme === 'system' 
    ? (Appearance.getColorScheme() || 'light') 
    : appState.theme

  return (
    <OnboardingGuard>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: "absolute",
            backgroundColor: "transparent",
            borderTopWidth: 0,
            elevation: 0,
            height: Platform.OS === "ios" ? 100 : 80,
            paddingBottom: Platform.OS === "ios" ? 20 : 0,
          },
        }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tabs.Screen
          name="diary"
          options={{
            title: "Diary",
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: "Saved",
          }}
        />
        <Tabs.Screen
          name="Planner"
          options={{
            title: "Planner",
          }}
        />
      </Tabs>
    </OnboardingGuard>
  )
}
