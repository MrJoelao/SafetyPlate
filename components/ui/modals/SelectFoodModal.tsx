import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  TouchableOpacity,
  Text, // Use Text for simple messages
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Food } from '@/types/food';
import { PlannedMealItem, DailyPlan } from '@/types/planner';
import { ModalHeader } from '@/components/ui/common/ModalHeader';
// Assuming ModalFooter might not fit perfectly, create a simple footer here
// import { ModalFooter } from '@/components/ui/common/ModalFooter';
import { SearchBar } from '@/components/ui/forms/SearchBar';
import { FoodListItem } from '@/components/ui/food/FoodListItem'; // Reuse FoodListItem
import { QuantityInput } from '@/components/ui/forms/QuantityInput';
import { ActionButton } from '@/components/ui/buttons/ActionButton';
// Remove ThemedText import
// import { ThemedText } from '@/components/common/ThemedText';

interface SelectFoodModalProps {
  visible: boolean;
  mealType: keyof DailyPlan | null; // Meal type to add to (for title)
  allFoods: Food[]; // List of all available foods
  onClose: () => void;
  onSelect: (item: PlannedMealItem) => void; // Callback with the selected item
}

// Helper to capitalize meal type for the title
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function SelectFoodModal({
  visible,
  mealType,
  allFoods,
  onClose,
  onSelect,
}: SelectFoodModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState<string>(''); // QuantityInput usually handles strings

  // Filter foods based on search term
  const filteredFoods = useMemo(() => {
    if (!searchTerm) {
      return allFoods; // Show all if search is empty
    }
    return allFoods.filter((food) =>
      food.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allFoods, searchTerm]);

  // Reset state when modal closes or opens
  useEffect(() => {
    if (!visible) {
      setSearchTerm('');
      setSelectedFood(null);
      setQuantity('');
    }
  }, [visible]);

  const handleFoodPress = (food: Food) => {
    setSelectedFood(food);
    // Optionally prefill quantity or unit if needed
    // setQuantity('1'); // Example: default quantity to 1
  };

  const handleSelectAndClose = () => {
    if (!selectedFood || !quantity) {
      alert('Seleziona un alimento e inserisci la quantità.');
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      alert('Inserisci una quantità valida.');
      return;
    }

    const newItem: PlannedMealItem = {
      foodId: selectedFood.id,
      quantity: quantityNum,
      unit: selectedFood.defaultUnit, // Use default unit for now
    };

    onSelect(newItem);
    onClose(); // Close modal after selection
  };

  // Define dummy functions for onEdit/onDelete as they are required by FoodListItem
  const handleDummyEdit = () => {};
  const handleDummyDelete = () => {};

  const renderFoodItem = ({ item }: { item: Food }) => (
    <TouchableOpacity
      onPress={() => handleFoodPress(item)}
      style={[
        styles.listItemTouchable, // Add a base style for the touchable area
        selectedFood?.id === item.id ? styles.selectedListItem : undefined
      ]}
    >
      <FoodListItem
        food={item}
        onEdit={handleDummyEdit} // Pass dummy function
        onDelete={handleDummyDelete} // Pass dummy function
        compact={true} // Use compact mode for the list
        // style prop is now accepted by FoodListItem but we apply selection style to TouchableOpacity
      />
    </TouchableOpacity>
  );

  const modalTitle = mealType ? `Aggiungi a ${capitalize(mealType)}` : 'Seleziona Alimento';

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      {/* Temporarily comment out BlurView to isolate the error */}
      {/* <BlurView intensity={20} style={styles.backdrop}> */}
        {/* Apply backdrop style directly to View for testing */}
        <View style={styles.backdrop}>
          {/* Ensure KeyboardAvoidingView takes up space */}
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
            <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />

            <ModalHeader
              title={modalTitle}
              onClose={onClose}
              icon={{ name: 'shopping-cart', color: '#4CAF50' }} // Use valid Feather icon name
            />
            {/* Wrap conditional content in a flexible view */}
            <View style={styles.contentWrapper}>
              {!selectedFood ? (
                // Stage 1: Search and Select Food
                <>
                  <SearchBar
                  placeholder="Cerca alimento..."
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  // style prop removed as it's not accepted by SearchBar
                />
                {filteredFoods.length > 0 ? (
                  <FlatList
                    data={filteredFoods}
                    renderItem={renderFoodItem}
                    keyExtractor={(item) => item.id}
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                  />
                ) : (
                  // Replace ThemedText with Text
                  <Text style={styles.noResultsText}>Nessun alimento trovato.</Text>
                )}
              </>
            ) : (
              // Stage 2: Enter Quantity
              <View style={styles.quantitySection}>
                {/* Replace ThemedText with Text */}
                <Text style={styles.selectedFoodText}>
                  Alimento: {selectedFood.name}
                </Text>
                <QuantityInput
                  label={`Quantità (${selectedFood.defaultUnit})`}
                  quantity={quantity} // Changed from value
                  onQuantityChange={setQuantity} // Changed from onChangeText
                  unit={selectedFood.defaultUnit}
                  onUnitChange={() => {}} // Pass dummy function for unit change
                  // keyboardType="numeric" is handled internally by QuantityInput
                />
                {/* Button to go back to search */}
                <TouchableOpacity onPress={() => setSelectedFood(null)} style={styles.backButton}>
                   {/* Replace ThemedText with Text */}
                   <Text style={styles.backButtonText}>Cambia Alimento</Text>
                </TouchableOpacity>
              </View>
              )}
            </View> {/* End contentWrapper */}

            {/* Custom Footer */}
            <View style={styles.footer}>
              <ActionButton
                label="Aggiungi" // Changed from title to label
                onPress={handleSelectAndClose}
                disabled={!selectedFood || !quantity} // Disable if no food or quantity
                icon="add-circle" // MaterialIcons icon
                style={styles.addButton}
              />
            </View>
          </View>
          </KeyboardAvoidingView>
        </View>
      {/* </BlurView> */}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end', // Align modal to bottom initially
  },
  keyboardView: {
    flex: 1, // Allow KeyboardAvoidingView to manage flex space
    justifyContent: 'flex-end', // Keep modal pushed to the bottom
  },
  modalContainer: {
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%', // Increase max height
    paddingBottom: 25, // Increase bottom padding slightly
    overflow: 'hidden', // Prevent content overflow issues
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 10,
  },
  contentWrapper: { // Style for the flexible content area
    flexGrow: 1, // Allow content to grow
    flexShrink: 1, // Allow content to shrink if needed
    paddingHorizontal: 15, // Add horizontal padding consistent with SearchBar/Footer
  },
  // searchBar style removed as it's applied within the component itself
  list: {
    // Removed maxHeight: 300 - let flexbox handle height within contentWrapper
    // marginHorizontal: 5, // Padding is now on contentWrapper
  },
  listContent: {
    paddingBottom: 10,
  },
  selectedListItem: {
    backgroundColor: '#e0f2f7', // Light blue background for selected item
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  quantitySection: {
    // padding: 20, // Padding is now on contentWrapper
    flex: 1, // Allow quantity section to take space
    justifyContent: 'center', // Center content vertically in this section
  },
  selectedFoodText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#000000', // Ensure text color is visible
  },
  backButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007bff', // Standard link color
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 15, // Match contentWrapper padding
    paddingTop: 15, // Add more top padding for separation
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 10,
  },
  addButton: {
    // Style for the main action button if needed
  },
  listItemTouchable: { // Style for the TouchableOpacity wrapping FoodListItem
    marginHorizontal: 5, // Match list margin
    borderRadius: 8, // Add some rounding
    overflow: 'hidden', // Ensure background color respects border radius
    marginBottom: 8, // Space between items
  },
});