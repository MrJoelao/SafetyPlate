import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, Platform, StatusBar } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { PlannerCalendar } from '@/components/planner/PlannerCalendar';
import { MealPlanSheet } from '@/components/planner/MealPlanSheet';
import { PlannerHeader } from '@/components/planner/PlannerHeader';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { MealTypeMenu } from '@/components/ui/MealTypeMenu';
import { MealEntryModal } from '@/components/ui/MealEntryModal';
import { MealData } from '@/components/ui/MealEntryModal';

export default function PlannerScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('');

  const handleMealSelect = (mealType: string) => {
    setSelectedMealType(mealType);
    setIsMenuOpen(false);
    setIsModalVisible(true);
  };

  const handleSaveMeal = (mealData: MealData) => {
    console.log('Salvataggio pasto:', { type: selectedMealType, ...mealData });
    // Qui implementeremo la logica per salvare il pasto
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <PlannerHeader />
        <PlannerCalendar 
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
        <MealPlanSheet 
          date={selectedDate}
        />
        
        <View style={styles.fabContainer}>
          <MealTypeMenu 
            visible={isMenuOpen}
            onSelect={handleMealSelect}
            onClose={() => setIsMenuOpen(false)}
          />
          <FloatingActionButton 
            onPress={() => setIsMenuOpen(!isMenuOpen)}
            isOpen={isMenuOpen}
          />
        </View>

        <MealEntryModal
          visible={isModalVisible}
          mealType={selectedMealType}
          onClose={() => setIsModalVisible(false)}
          onSave={handleSaveMeal}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'ios' ? 100 : 80,
    zIndex: 2,
    alignItems: 'flex-end',
  },
});