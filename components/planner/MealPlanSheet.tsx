import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons } from '@expo/vector-icons';
import type { MaterialIcons as MaterialIconsType } from '@expo/vector-icons/MaterialIcons';

interface MealType {
  id: string;
  label: string;
  icon: keyof typeof MaterialIconsType.glyphMap;
  time: string;
}

const MEAL_TYPES: MealType[] = [
  { id: 'breakfast', label: 'Colazione', icon: 'free-breakfast', time: '08:00' },
  { id: 'lunch', label: 'Pranzo', icon: 'restaurant', time: '13:00' },
  { id: 'dinner', label: 'Cena', icon: 'dinner-dining', time: '20:00' },
  { id: 'snack', label: 'Spuntini', icon: 'icecream', time: 'Vari' },
];

interface MealPlanSheetProps {
  date: Date;
}

export const MealPlanSheet = ({ date }: MealPlanSheetProps) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {MEAL_TYPES.map((meal) => (
        <View key={meal.id} style={styles.mealSection}>
          <View style={styles.mealHeader}>
            <View style={styles.mealInfo}>
              <MaterialIcons name={meal.icon} size={24} color="#4CAF50" />
              <View>
                <ThemedText style={styles.mealType}>{meal.label}</ThemedText>
                <ThemedText style={styles.mealTime}>{meal.time}</ThemedText>
              </View>
            </View>
            <TouchableOpacity style={styles.addButton}>
              <MaterialIcons name="add" size={24} color="#4CAF50" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.plannedMeals}>
            <TouchableOpacity style={styles.emptyState}>
              <MaterialIcons name="add-circle-outline" size={24} color="#666" />
              <ThemedText style={styles.emptyStateText}>
                Pianifica {meal.label.toLowerCase()}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mealSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mealType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f1f1f',
  },
  mealTime: {
    fontSize: 13,
    color: '#666',
  },
  addButton: {
    padding: 8,
    borderRadius: 20,
  },
  plannedMeals: {
    minHeight: 80,
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
  },
}); 