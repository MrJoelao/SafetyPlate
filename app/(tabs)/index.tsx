import { StyleSheet, View, SafeAreaView, ScrollView, Text } from "react-native"; // Aggiunto Text
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons"; // Mantenuto FontAwesome5 per l'header
import { ScreenHeader } from "@/components/ui/layout/ScreenHeader";
import { DailySummarySection } from "@/components/ui/dashboard/DailySummarySection";
import { MacroNutrientsSection } from "@/components/ui/dashboard/MacroNutrientsSection";
import { WeeklyTrendSection } from "@/components/ui/dashboard/WeeklyTrendSection";
import { QuickAddSection } from "@/components/ui/dashboard/QuickAddSection";
import { QuickSnackModal, QuickSnack } from "@/components/ui/modals/QuickSnackModal";
import { MealSummarySection, MealSummary } from "@/components/ui/dashboard/MealSummarySection"; // Importato
import { useState } from "react";

// Dati fittizi (da spostare o integrare con usePlanner)
const USER_DATA = {
  dailyScore: 85,
  calories: { current: 1850, target: 2200 },
  macros: {
    proteins: { current: 90, target: 120 },
    carbs: { current: 210, target: 280 },
    fats: { current: 60, target: 70 },
  },
  weeklyScores: [
    { day: "Lun", score: 65 },
    { day: "Mar", score: 70 },
    { day: "Mer", score: 85 },
    { day: "Gio", score: 75 },
    { day: "Ven", score: 40 },
    { day: "Sab", score: 90 },
    { day: "Dom", score: 78 },
  ],
  favoriteSnacks: [ // Aggiunti spuntini preferiti
    { id: '1', name: 'Mela', details: '1 media (circa 95kcal)', calories: 95 },
    { id: '2', name: 'Yogurt Greco 0%', details: '1 vasetto (circa 90kcal)', calories: 90 },
    { id: '3', name: 'Mandorle (10pz)', details: 'Circa 70kcal', calories: 70 },
    { id: '4', name: 'Banana piccola', details: 'Circa 90kcal', calories: 90 },
  ] as QuickSnack[],
  dailyMeals: [ // Aggiunti pasti giornalieri
    { id: 'm1', name: 'Colazione', status: 'Completo', calories: 450, iconName: 'food-croissant' },
    { id: 'm2', name: 'Pranzo', status: 'Parziale', calories: 600, iconName: 'food-variant' },
    { id: 'm3', name: 'Cena', status: 'Mancante', iconName: 'food-steak' },
    { id: 'm4', name: 'Spuntini', status: 'Registrato', calories: 250, iconName: 'food-apple' },
  ] as MealSummary[],
  // ...altri dati necessari per i widget
};

export default function HomeScreen() {
  const router = useRouter();
  const [isSnackModalVisible, setIsSnackModalVisible] = useState(false);

  const handleAddWater = () => {
    console.log("Acqua aggiunta!");
  };

  const handleOpenSnackModal = () => {
    setIsSnackModalVisible(true);
  };

  const handleCloseSnackModal = () => {
    setIsSnackModalVisible(false);
  };

  const handleSelectSnack = (snack: QuickSnack) => {
    console.log("Spuntino selezionato:", snack.name);
  };

  const handlePressMeal = (mealId: string) => {
    console.log("Pasto premuto:", mealId);
    // router.push(`/(tabs)/planner?mealId=${mealId}`); // Esempio navigazione
  };

  const handleViewAllMeals = () => {
    console.log("Vedi tutti i pasti");
    router.push('/Planner'); // Corretto il percorso per la tab Planner
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScreenHeader
          title="Home" // Titolo rimane "Home" o quello che preferisci
          icon={<FontAwesome5 name="apple-alt" size={24} color="#333" />} // Icona esistente
          showSearch={true} // Mantenuto come da UI precedente
          showOptions={true} // Mantenuto
          onOptionsPress={() => router.push("/settings")}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Sezione Riepilogo Giornaliero */}
          <DailySummarySection
            score={USER_DATA.dailyScore}
            caloriesCurrent={USER_DATA.calories.current}
            caloriesTarget={USER_DATA.calories.target}
            onPress={() => router.push('/(tabs)/diary')} // Esempio di navigazione
          />

          {/* Divisore o Spaziatura */}
          <View style={styles.sectionDivider} />

          {/* 2. Sezione Macronutrienti */}
          <MacroNutrientsSection
            proteins={USER_DATA.macros.proteins}
            carbs={USER_DATA.macros.carbs}
            fats={USER_DATA.macros.fats}
            // onPress={() => console.log("Macro section pressed")} // Esempio interazione
          />
          
          {/* 3. Sezione Andamento Settimanale */}
          <View style={styles.sectionDivider} />
          <WeeklyTrendSection weeklyScores={USER_DATA.weeklyScores} />

          {/* 4. Sezione Quick Add */}
          <View style={styles.sectionDivider} />
          <QuickAddSection
            onAddWater={handleAddWater}
            onOpenSnackModal={handleOpenSnackModal}
          />
          
          {/* 5. Sezione Riepilogo Pasti (Opzionale) */}
          {USER_DATA.dailyMeals && USER_DATA.dailyMeals.length > 0 && (
            <>
              <View style={styles.sectionDivider} />
              <MealSummarySection
                meals={USER_DATA.dailyMeals}
                onPressMeal={handlePressMeal}
                onViewAllPress={handleViewAllMeals}
              />
            </>
          )}

           {/* Esempio di testo per vedere se lo scroll funziona */}
           <Text style={{padding: 20, textAlign: 'center', fontSize: 18, color: '#aaa'}}>Altri contenuti qui...</Text>
           <Text style={{padding: 20, textAlign: 'center', fontSize: 18, color: '#aaa'}}>Altri contenuti qui...</Text>
           <Text style={{padding: 20, textAlign: 'center', fontSize: 18, color: '#aaa'}}>Altri contenuti qui...</Text>
           <Text style={{padding: 20, textAlign: 'center', fontSize: 18, color: '#aaa'}}>Altri contenuti qui...</Text>
           <Text style={{padding: 20, textAlign: 'center', fontSize: 18, color: '#aaa'}}>Altri contenuti qui...</Text>


        </ScrollView>

        <QuickSnackModal
          visible={isSnackModalVisible}
          onClose={handleCloseSnackModal}
          onSelectSnack={handleSelectSnack}
          favoriteSnacks={USER_DATA.favoriteSnacks}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f8fa", // Colore di sfondo generale per SafeArea
  },
  container: {
    flex: 1,
    backgroundColor: "#f7f8fa", // Sfondo coerente
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: 16, // Spazio iniziale
    paddingBottom: 32, // Spazio finale per scroll, per non tagliare l'ultimo elemento
    paddingHorizontal: 16,
  },
  sectionDivider: {
    height: 20, // Aumentato leggermente per più respiro tra le sezioni
  },
  // Rimuovi gli stili delle vecchie card (scoreCard, weeklyCard, recentMealsCard, ecc.)
  // Gli stili specifici saranno definiti all'interno di ogni componente Sezione.
});
