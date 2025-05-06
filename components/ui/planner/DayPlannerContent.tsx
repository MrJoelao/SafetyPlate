// DayPlannerContent: contenuti giornalieri integrati senza card, stile Material flat
import React from "react";
import {View, StyleSheet, Text, TouchableOpacity} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export interface DayPlannerContentProps {
  date: string;
  goals: { kcal: number; protein: number; carbs: number; fat: number };
  progress: { kcal: number; protein: number; carbs: number; fat: number };
  meals: {
    type: "colazione" | "pranzo" | "cena" | "spuntino";
    items: { name: string; quantity: string }[];
  }[];
  selectedMealType?: string; // Add selected meal type prop
  onAddMeal: (mealType: string) => void;
}

export const DayPlannerContent: React.FC<DayPlannerContentProps> = ({
  date,
  goals,
  progress,
  meals,
  selectedMealType,
  onAddMeal,
}) => {
  return (
    <View style={styles.root}>
      {/* Header */}
      {/* Header rimosso: la data è ora solo nella pill in alto */}
      {/* Sezioni pasti integrate */}
      <View style={styles.meals}>
        {meals.map((meal) => (
          <TouchableOpacity 
            key={meal.type} 
            style={[
              styles.mealSection,
              selectedMealType === meal.type && styles.selectedMealSection
            ]}
            onPress={() => onAddMeal(meal.type)}
            activeOpacity={0.7}
          >
            <View style={styles.mealHeader}>
              <MaterialIcons 
                name="restaurant" 
                size={20} 
                color={selectedMealType === meal.type ? "#2196F3" : "#888"} 
              />
              <Text 
                style={[
                  styles.mealTitle,
                  selectedMealType === meal.type && styles.selectedMealTitle
                ]}
              >
                {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
              </Text>
              <View
                style={{
                  marginLeft: "auto",
                  backgroundColor: selectedMealType === meal.type ? "#e3f2fd" : "#f0f7fa",
                  borderRadius: 20,
                  padding: 2,
                  shadowColor: "#1976d2",
                  shadowOpacity: selectedMealType === meal.type ? 0.12 : 0.06,
                  shadowRadius: 4,
                  shadowOffset: { width: 0, height: 1 },
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialIcons
                  name="add-circle"
                  size={26}
                  color={selectedMealType === meal.type ? "#2196F3" : "#b0b0b0"}
                  style={{
                    alignSelf: "center",
                  }}
                />
              </View>
            </View>
            {meal.items.length === 0 ? (
              <Text style={styles.emptyText}>
                Nessun alimento
              </Text>
            ) : (
              meal.items.map((item, idx) => (
                <View key={idx} style={styles.foodRow}>
                  <MaterialIcons 
                    name="lunch-dining" 
                    size={18} 
                    color={selectedMealType === meal.type ? "#2196F3" : "#aaa"} 
                  />
                  <Text style={styles.foodName}>{item.name}</Text>
                  <Text style={styles.foodQty}>{item.quantity}</Text>
                </View>
              ))
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// Chip obiettivo con progress bar
const GoalChip: React.FC<{ label: string; value: number; goal: number; color: string }> = ({
  label,
  value,
  goal,
  color,
}) => {
  const percent = Math.min(100, Math.round((value / goal) * 100));
  return (
    <View style={[goalChipStyles.chip, { borderColor: color }]}>
      <Text style={[goalChipStyles.label, { color }]}>{label}</Text>
      <View style={goalChipStyles.barBg}>
        <View style={[goalChipStyles.bar, { width: `${percent}%`, backgroundColor: color }]} />
      </View>
      <Text style={goalChipStyles.value}>{value}/{goal}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 8,
    backgroundColor: "#f7f7f7",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: "transparent",
  },
  date: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
  },
  goalsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  meals: {
    paddingHorizontal: 8,
    marginTop: 8,
  },
  mealSection: {
    backgroundColor: "#f8fafd",
    borderRadius: 20,
    marginBottom: 12,
    paddingVertical: 18,
    paddingHorizontal: 18,
    elevation: 1,
    borderWidth: 1.5,
    borderColor: "#e3eaf6",
    shadowColor: "#1976d2",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    position: "relative",
    minHeight: 80,
    flex: 1,
  },
  selectedMealSection: {
    backgroundColor: "#e3f2fd",
    borderColor: "#2196F3",
    elevation: 3,
    shadowColor: "#1976d2",
    shadowOpacity: 0.13,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  mealHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
    paddingBottom: 4,
    borderBottomWidth: 0,
    borderBottomColor: "transparent",
    minHeight: 32,
  },
  mealTitle: {
    fontWeight: "700",
    fontSize: 17,
    marginLeft: 8,
    color: "#1976d2",
    letterSpacing: 0.2,
    flex: 1,
  },
  selectedMealTitle: {
    color: "#2196F3",
    fontSize: 18,
    fontWeight: "800",
  },
  emptyText: {
    color: "#bbb",
    fontStyle: "italic",
    marginLeft: 8,
    marginBottom: 4,
    marginTop: 2,
    fontSize: 14,
    fontWeight: "500",
  },
  foodRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    marginLeft: 0,
    gap: 8,
    paddingVertical: 4,
    borderBottomWidth: 0,
    borderBottomColor: "transparent",
    minHeight: 28,
  },
  foodName: {
    flex: 1,
    color: "#222",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.1,
    marginLeft: 2,
  },
  foodQty: {
    color: "#1976d2",
    fontSize: 14,
    marginLeft: 8,
    fontWeight: "700",
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: "hidden",
    minWidth: 38,
    textAlign: "center",
  },
});

const goalChipStyles = StyleSheet.create({
  chip: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: "center",
    flexDirection: "row",
    marginRight: 6,
    backgroundColor: "#fff",
    minWidth: 64,
  },
  label: {
    fontWeight: "bold",
    fontSize: 13,
    marginRight: 4,
  },
  barBg: {
    flex: 1,
    height: 6,
    backgroundColor: "#eee",
    borderRadius: 3,
    marginHorizontal: 4,
    overflow: "hidden",
  },
  bar: {
    height: 6,
    borderRadius: 3,
  },
  value: {
    fontSize: 12,
    color: "#555",
    marginLeft: 4,
  },
});
