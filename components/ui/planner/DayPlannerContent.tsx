// DayPlannerContent: contenuti giornalieri integrati senza card, stile Material flat
import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export interface DayPlannerContentProps {
  date: string;
  goals: { kcal: number; protein: number; carbs: number; fat: number };
  progress: { kcal: number; protein: number; carbs: number; fat: number };
  meals: {
    type: "colazione" | "pranzo" | "cena" | "spuntino";
    items: { name: string; quantity: string }[];
  }[];
  onAddMeal: (mealType: string) => void;
  onAddFood: () => void;
}

export const DayPlannerContent: React.FC<DayPlannerContentProps> = ({
  date,
  goals,
  progress,
  meals,
  onAddMeal,
  onAddFood,
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
          <View key={meal.type} style={styles.mealSection}>
            <View style={styles.mealHeader}>
              <MaterialIcons name="restaurant" size={20} color="#888" />
              <Text style={styles.mealTitle}>{meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}</Text>
              <MaterialIcons
                name="add-circle-outline"
                size={22}
                color="#4CAF50"
                style={{ marginLeft: "auto" }}
                onPress={() => onAddMeal(meal.type)}
              />
            </View>
            {meal.items.length === 0 ? (
              <Text style={styles.emptyText}>Nessun alimento</Text>
            ) : (
              meal.items.map((item, idx) => (
                <View key={idx} style={styles.foodRow}>
                  <MaterialIcons name="lunch-dining" size={18} color="#aaa" />
                  <Text style={styles.foodName}>{item.name}</Text>
                  <Text style={styles.foodQty}>{item.quantity}</Text>
                </View>
              ))
            )}
          </View>
        ))}
      </View>
      {/* FAB integrato: apertura modal */}
      <View style={styles.fabContainer}>
        <MaterialIcons
          name="add"
          size={28}
          color="#fff"
          style={styles.fab}
          onPress={onAddFood}
          accessibilityLabel="Aggiungi alimento"
          accessibilityRole="button"
        />
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
    backgroundColor: "#f3f3f3",
    borderRadius: 14,
    marginBottom: 14,
    padding: 10,
    elevation: 0,
  },
  mealHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  mealTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 4,
    color: "#333",
  },
  emptyText: {
    color: "#aaa",
    fontStyle: "italic",
    marginLeft: 24,
    marginBottom: 4,
  },
  foodRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
    marginLeft: 8,
    gap: 6,
  },
  foodName: {
    flex: 1,
    color: "#444",
    fontSize: 15,
  },
  foodQty: {
    color: "#888",
    fontSize: 14,
    marginLeft: 8,
  },
  fabContainer: {
    position: "absolute",
    right: 24,
    bottom: 24,
    backgroundColor: "#2196F3",
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  fab: {
    alignSelf: "center",
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