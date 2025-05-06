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
      {/* Header obiettivi */}
      <View style={styles.header}>
        <Text style={styles.date}>{date}</Text>
        <View style={styles.goalsRow}>
          <GoalChip label="Kcal" value={progress.kcal} goal={goals.kcal} color="#FFB300" />
          <GoalChip label="P" value={progress.protein} goal={goals.protein} color="#4CAF50" />
          <GoalChip label="C" value={progress.carbs} goal={goals.carbs} color="#2196F3" />
          <GoalChip label="F" value={progress.fat} goal={goals.fat} color="#E57373" />
        </View>
      </View>
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
              <MaterialIcons
                name="add-circle-outline"
                size={22}
                color={selectedMealType === meal.type ? "#2196F3" : "#4CAF50"}
                style={{ marginLeft: "auto" }}
              />
            </View>
            {meal.items.length === 0 ? (
              <Text style={styles.emptyText}>
                {selectedMealType === meal.type 
                  ? "Clicca sul + in basso per aggiungere alimenti" 
                  : "Nessun alimento"}
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
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    marginBottom: 16,
    padding: 14,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    position: "relative", // For absolute positioning of children
  },
  selectedMealSection: {
    backgroundColor: "#e3f2fd",
    borderColor: "#2196F3",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  mealHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  mealTitle: {
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 4,
    color: "#333",
    letterSpacing: 0.3,
  },
  selectedMealTitle: {
    color: "#2196F3",
    fontSize: 17,
    fontWeight: "700",
  },
  emptyText: {
    color: "#999",
    fontStyle: "italic",
    marginLeft: 24,
    marginBottom: 6,
    marginTop: 2,
    fontSize: 14,
  },
  foodRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    marginLeft: 8,
    gap: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.03)",
  },
  foodName: {
    flex: 1,
    color: "#444",
    fontSize: 15,
    fontWeight: "500",
  },
  foodQty: {
    color: "#666",
    fontSize: 14,
    marginLeft: 8,
    fontWeight: "500",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
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
