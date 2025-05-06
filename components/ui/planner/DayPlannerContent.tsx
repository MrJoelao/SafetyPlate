// DayPlannerContent: contenuti giornalieri integrati senza card, stile Material flat
import React from "react";
import {View, StyleSheet, Text, TouchableOpacity, Alert} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export interface DayPlannerContentProps {
  date: string;
  goals: { kcal: number; protein: number; carbs: number; fat: number };
  progress: { kcal: number; protein: number; carbs: number; fat: number };
  meals: {
    type: "colazione" | "pranzo" | "cena" | "spuntino";
    items: { name: string; quantity: string; id?: string }[];
  }[];
  selectedMealType?: string;
  onAddMeal: (mealType: string) => void;
  onDeleteItem?: (mealType: string, itemId: string) => void;
  onEditItem?: (mealType: string, itemId: string) => void;
}

export const DayPlannerContent: React.FC<DayPlannerContentProps> = ({
  date,
  goals,
  progress,
  meals,
  selectedMealType,
  onAddMeal,
  onDeleteItem,
  onEditItem,
}) => {
  // Funzione per gestire l'eliminazione di un elemento
  const handleDeleteItem = (mealType: string, itemId: string) => {
    if (onDeleteItem) {
      Alert.alert(
        "Conferma eliminazione",
        "Sei sicuro di voler eliminare questo alimento?",
        [
          { text: "Annulla", style: "cancel" },
          { 
            text: "Elimina", 
            style: "destructive",
            onPress: () => onDeleteItem(mealType, itemId)
          }
        ]
      );
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.meals}>
        {meals.map((meal) => (
          <View 
            key={meal.type} 
            style={[
              styles.mealSection,
              selectedMealType === meal.type && styles.selectedMealSection
            ]}
          >
            {/* Header del pasto con titolo e pulsante di aggiunta */}
            <View style={styles.mealHeader}>
              <View style={styles.mealTitleContainer}>
                <MaterialIcons 
                  name="restaurant" 
                  size={20} 
                  color={selectedMealType === meal.type ? "#2196F3" : "#666"} 
                />
                <Text 
                  style={[
                    styles.mealTitle,
                    selectedMealType === meal.type && styles.selectedMealTitle
                  ]}
                >
                  {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
                </Text>
              </View>
              
              {/* Pulsante per aggiungere alimenti */}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => onAddMeal(meal.type)}
                accessibilityLabel={`Aggiungi alimento a ${meal.type}`}
                accessibilityRole="button"
              >
                <MaterialIcons
                  name="add"
                  size={22}
                  color="#fff"
                />
                <Text style={styles.addButtonText}>Aggiungi</Text>
              </TouchableOpacity>
            </View>

            {/* Contenuto del pasto */}
            <View style={styles.mealContent}>
              {meal.items.length === 0 ? (
                <Text style={styles.emptyText}>
                  Nessun alimento aggiunto
                </Text>
              ) : (
                <View style={styles.foodList}>
                  {meal.items.map((item, idx) => (
                    <View key={idx} style={styles.foodItem}>
                      <View style={styles.foodItemMain}>
                        <MaterialIcons 
                          name="lunch-dining" 
                          size={20} 
                          color={"#1976d2"} 
                        />
                        <Text style={styles.foodName}>{item.name}</Text>
                        <Text style={styles.foodQty}>{item.quantity}</Text>
                      </View>
                      
                      {/* Pulsanti per modificare ed eliminare */}
                      <View style={styles.foodItemActions}>
                        {onEditItem && (
                          <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => onEditItem(meal.type, item.id || '')}
                            accessibilityLabel={`Modifica ${item.name}`}
                          >
                            <MaterialIcons name="edit" size={22} color="#4CAF50" />
                          </TouchableOpacity>
                        )}
                        
                        {onDeleteItem && (
                          <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => handleDeleteItem(meal.type, item.id || '')}
                            accessibilityLabel={`Elimina ${item.name}`}
                          >
                            <MaterialIcons name="delete" size={22} color="#F44336" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
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
  meals: {
    paddingHorizontal: 12,
    marginTop: 8,
    paddingBottom: 80, // Increased to allow scrolling to see bottom cards
  },
  mealSection: {
    backgroundColor: "#f8fafd",
    borderRadius: 20,
    marginBottom: 12, // Reduced from 16 to 12
    paddingVertical: 12, // Reduced from 16 to 12
    paddingHorizontal: 14, // Reduced from 16 to 14
    elevation: 2,
    borderWidth: 1.5,
    borderColor: "#e3eaf6",
    shadowColor: "#1976d2",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    position: "relative",
    minHeight: 90, // Reduced from 100 to 90
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
    justifyContent: "space-between",
    marginBottom: 8, // Reduced from 12 to 8
    paddingBottom: 6, // Reduced from 8 to 6
    borderBottomWidth: 1,
    borderBottomColor: "rgba(25, 118, 210, 0.1)",
  },
  mealTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6, // Reduced from 8 to 6
  },
  mealTitle: {
    fontWeight: "600", // Reduced from 700 to 600
    fontSize: 16, // Reduced from 18 to 16
    color: "#1976d2",
    letterSpacing: 0.2,
  },
  selectedMealTitle: {
    color: "#2196F3",
    fontWeight: "700", // Reduced from 800 to 700
  },
  mealContent: {
    paddingHorizontal: 4,
  },
  emptyText: {
    color: "#bbb",
    fontStyle: "italic",
    marginLeft: 8,
    marginBottom: 4,
    marginTop: 2,
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    paddingVertical: 12,
  },
  foodList: {
    gap: 8,
  },
  foodItem: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    flexDirection: "column",
    borderWidth: 1,
    borderColor: "rgba(25, 118, 210, 0.1)",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  foodItemMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  foodName: {
    flex: 1,
    color: "#222",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  foodQty: {
    color: "#1976d2",
    fontSize: 15,
    fontWeight: "700",
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
    minWidth: 38,
    textAlign: "center",
  },
  foodItemActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    paddingTop: 8,
    marginTop: 4,
  },
  actionButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2196F3",
    paddingHorizontal: 12, // Reduced from 14 to 12
    paddingVertical: 6, // Reduced from 8 to 6
    borderRadius: 20, // Increased from 16 to 20 for more rounded corners
    gap: 4, // Reduced from 6 to 4
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14, // Reduced from 15 to 14
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
