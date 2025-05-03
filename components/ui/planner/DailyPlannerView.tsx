import React from 'react';
import { View, StyleSheet, Text } from 'react-native'; // Import Text
// Remove ThemedView and ThemedText imports as they will be replaced
// import { ThemedView } from '@/components/common/ThemedView';
// import { ThemedText } from '@/components/common/ThemedText';
import { DailyPlan, PlannedMealItem } from '@/types/planner';
import { Food } from '@/types/food';
import { IconButton } from '@/components/ui/buttons/IconButton';
// Import Collapsible or Accordion if needed later
// import { Collapsible } from '@/components/ui/disclosure/Collapsible';
// import { List } from 'react-native-paper'; // Example if using react-native-paper

interface DailyPlannerViewProps {
  /** The daily plan data to display, or null if no plan exists for the date. */
  plan: DailyPlan | null;
  /** Function to call when the user wants to add an item to a meal. */
  onAddItem: (mealType: keyof DailyPlan) => void;
  /** Function to call when the user wants to remove an item from a meal. */
  onRemoveItem: (mealType: keyof DailyPlan, foodId: string) => void;
  /** Function to retrieve food details by ID. */
  getFoodById: (id: string) => Food | undefined;
}

// Placeholder for the component that will display a single planned food item
const PlannedFoodItemDisplay: React.FC<{
  item: PlannedMealItem;
  food: Food | undefined;
  onRemove: () => void;
}> = ({ item, food, onRemove }) => {
  // TODO: Implement using adapted FoodListItem or similar
  return (
    <View style={styles.plannedItem}>
      {/* Replace ThemedText with Text */}
      <Text style={styles.itemName}>{food?.name || 'Alimento non trovato'}: {item.quantity} {item.unit}</Text>
      <IconButton icon="delete" size={20} onPress={onRemove} color="#e53935" />
    </View>
  );
};

// Placeholder for a meal section (e.g., Breakfast)
const MealSection: React.FC<{
  title: string;
  items: PlannedMealItem[];
  mealType: keyof DailyPlan;
  onAddItem: (mealType: keyof DailyPlan) => void;
  onRemoveItem: (mealType: keyof DailyPlan, foodId: string) => void;
  getFoodById: (id: string) => Food | undefined;
}> = ({ title, items, mealType, onAddItem, onRemoveItem, getFoodById }) => {
  return (
    <View style={styles.mealSection}>
      <View style={styles.mealHeader}>
        {/* Replace ThemedText with Text */}
        <Text style={styles.mealTitle}>{title}</Text>
        <IconButton icon="add-circle-outline" size={24} onPress={() => onAddItem(mealType)} color="#4CAF50" />
      </View>
      {items && items.length > 0 ? (
        items.map((item) => (
          <PlannedFoodItemDisplay
            key={item.foodId} // Assuming foodId is unique within a meal
            item={item}
            food={getFoodById(item.foodId)}
            onRemove={() => onRemoveItem(mealType, item.foodId)}
          />
        ))
      ) : (
        // Replace ThemedText with Text
        <Text style={styles.emptyText}>Nessun alimento aggiunto.</Text>
      )}
    </View>
  );
};


export const DailyPlannerView: React.FC<DailyPlannerViewProps> = ({
  plan,
  onAddItem,
  onRemoveItem,
  getFoodById,
}) => {
  // Initialize plan with empty arrays if null
  const currentPlan = plan || { breakfast: [], lunch: [], dinner: [], snack: [] };

  return (
    // Replace ThemedView with View
    <View style={styles.container}>
      <MealSection
        title="Colazione"
        items={currentPlan.breakfast}
        mealType="breakfast"
        onAddItem={onAddItem}
        onRemoveItem={onRemoveItem}
        getFoodById={getFoodById}
      />
      <MealSection
        title="Pranzo"
        items={currentPlan.lunch}
        mealType="lunch"
        onAddItem={onAddItem}
        onRemoveItem={onRemoveItem}
        getFoodById={getFoodById}
      />
      <MealSection
        title="Cena"
        items={currentPlan.dinner}
        mealType="dinner"
        onAddItem={onAddItem}
        onRemoveItem={onRemoveItem}
        getFoodById={getFoodById}
      />
      {/* Optionally render Snack section */}
      <MealSection
        title="Spuntino"
        items={currentPlan.snack || []} // Handle optional snack array
        mealType="snack"
        onAddItem={onAddItem}
        onRemoveItem={onRemoveItem}
        getFoodById={getFoodById}
      />
    </View> // Correct the closing tag
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ffffff', // Force white background for the main container
  },
  mealSection: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f9f9f9', // Light background for section
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000', // Force black color for meal titles
  },
  plannedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 5,
    backgroundColor: '#fff', // White background for items
    borderRadius: 4,
    marginBottom: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
  },
  itemName: { // Added style for item name text
    flex: 1,
    marginRight: 8,
    color: '#000000', // Force black color for item names
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
});