import { StyleSheet, View, SafeAreaView, ScrollView, Text, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { ScreenHeader } from "@/components/ui/layout/ScreenHeader";
import { DailySummarySection } from "@/components/ui/dashboard/DailySummarySection";
import { MacroNutrientsSection } from "@/components/ui/dashboard/MacroNutrientsSection";
import { WeeklyTrendSection } from "@/components/ui/dashboard/WeeklyTrendSection";
import { QuickAddSection } from "@/components/ui/dashboard/QuickAddSection";
import { QuickSnackModal, QuickSnack } from "@/components/ui/modals/QuickSnackModal";
import { MealSummarySection, MealSummary } from "@/components/ui/dashboard/MealSummarySection";
import { useState, useEffect } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { useThemeColor } from "@/hooks/useThemeColor";
import { PlannedMealItem } from "@/types/planner";
import * as plannerStorage from "@/utils/plannerStorage";

// Favorite snacks data (could be moved to storage in the future)
const FAVORITE_SNACKS: QuickSnack[] = [
  { id: '1', name: 'Mela', details: '1 media (circa 95kcal)', calories: 95 },
  { id: '2', name: 'Yogurt Greco 0%', details: '1 vasetto (circa 90kcal)', calories: 90 },
  { id: '3', name: 'Mandorle (10pz)', details: 'Circa 70kcal', calories: 70 },
  { id: '4', name: 'Banana piccola', details: 'Circa 90kcal', calories: 90 },
];

export default function HomeScreen() {
  const router = useRouter();
  const [isSnackModalVisible, setIsSnackModalVisible] = useState(false);
  const { dashboardData, isLoading, error, refreshDashboard } = useDashboard();
  const themedTextColor = useThemeColor({}, 'text');

  // Refresh dashboard data when component mounts
  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  const handleAddWater = async () => {
    try {
      // Get today's date key
      const today = new Date();
      const todayKey = plannerStorage.formatDateKey(today);

      // Create a water item (using a predefined water food ID)
      // In a real app, you would have a specific food item for water in your database
      const waterItem: PlannedMealItem = {
        foodId: 'water', // This should be a real food ID in your database
        quantity: 250, // 250ml of water
        unit: 'ml'
      };

      // Add water to the plan (could be added to a special category or to snacks)
      await plannerStorage.addMealItem(todayKey, 'snack', waterItem);

      // Refresh the dashboard data
      refreshDashboard();

      // Show a success message
      Alert.alert(
        "Acqua aggiunta",
        "250ml di acqua sono stati aggiunti al tuo piano giornaliero.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error adding water:", error);
      Alert.alert(
        "Errore",
        "Non è stato possibile aggiungere l'acqua. Riprova più tardi.",
        [{ text: "OK" }]
      );
    }
  };

  const handleOpenSnackModal = () => {
    setIsSnackModalVisible(true);
  };

  const handleCloseSnackModal = () => {
    setIsSnackModalVisible(false);
  };

  const handleSelectSnack = async (snack: QuickSnack) => {
    console.log("Spuntino selezionato:", snack.name);

    try {
      // Get today's date key
      const today = new Date();
      const todayKey = plannerStorage.formatDateKey(today);

      // Load today's plan
      const todayPlan = await plannerStorage.getDailyPlan(todayKey) || {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: []
      };

      // Create a new snack item
      const newSnackItem: PlannedMealItem = {
        foodId: snack.id,
        quantity: 1,
        unit: 'porzione'
      };

      // Add the snack to the plan
      await plannerStorage.addMealItem(todayKey, 'snack', newSnackItem);

      // Refresh the dashboard data
      refreshDashboard();
      setIsSnackModalVisible(false);

      // Show a success message (optional)
      Alert.alert(
        "Spuntino aggiunto",
        `${snack.name} è stato aggiunto ai tuoi pasti di oggi.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error adding snack:", error);
      Alert.alert(
        "Errore",
        "Non è stato possibile aggiungere lo spuntino. Riprova più tardi.",
        [{ text: "OK" }]
      );
    }
  };

  const handlePressMeal = (mealId: string) => {
    console.log("Pasto premuto:", mealId);
    // Navigate to the planner with the selected meal type
    router.push(`/Planner?mealType=${mealId}`);
  };

  const handleViewAllMeals = () => {
    router.push('/Planner');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScreenHeader
          title="Dashboard"
          icon={<FontAwesome5 name="apple-alt" size={24} color="#333" />}
          showSearch={true}
          showOptions={true}
          onOptionsPress={() => router.push("/settings")}
        />

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Caricamento dati...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refreshDashboard}>
              <Text style={styles.retryButtonText}>Riprova</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Sezione Riepilogo Giornaliero */}
            <DailySummarySection
              score={dashboardData.dailyScore}
              caloriesCurrent={dashboardData.calories.current}
              caloriesTarget={dashboardData.calories.target}
              onPress={() => router.push('/(tabs)/diary')}
            />

            {/* Divisore o Spaziatura */}
            <View style={styles.sectionDivider} />

            {/* 2. Sezione Macronutrienti */}
            <MacroNutrientsSection
              proteins={dashboardData.macros.proteins}
              carbs={dashboardData.macros.carbs}
              fats={dashboardData.macros.fats}
            />

            {/* 3. Sezione Andamento Settimanale */}
            <View style={styles.sectionDivider} />
            <WeeklyTrendSection weeklyScores={dashboardData.weeklyScores} />

            {/* 4. Sezione Quick Add */}
            <View style={styles.sectionDivider} />
            <QuickAddSection
              onAddWater={handleAddWater}
              onOpenSnackModal={handleOpenSnackModal}
            />

            {/* 5. Sezione Riepilogo Pasti */}
            {dashboardData.dailyMeals && dashboardData.dailyMeals.length > 0 && (
              <>
                <View style={styles.sectionDivider} />
                <MealSummarySection
                  meals={dashboardData.dailyMeals}
                  onPressMeal={handlePressMeal}
                  onViewAllPress={handleViewAllMeals}
                />
              </>
            )}
          </ScrollView>
        )}

        <QuickSnackModal
          visible={isSnackModalVisible}
          onClose={handleCloseSnackModal}
          onSelectSnack={handleSelectSnack}
          favoriteSnacks={FAVORITE_SNACKS}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },
  container: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  sectionDivider: {
    height: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
