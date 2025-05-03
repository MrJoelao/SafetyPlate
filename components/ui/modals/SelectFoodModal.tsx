import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  TouchableOpacity,
  Text,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Food } from '@/types/food';
import { PlannedMealItem, DailyPlan } from '@/types/planner';
import { ModalHeader } from '@/components/ui/common/ModalHeader';
import { SearchBar } from '@/components/ui/forms/SearchBar';
import { FoodListItem } from '@/components/ui/food/FoodListItem';
// QuantityInput might be reused later, keep for now
import { QuantityInput } from '@/components/ui/forms/QuantityInput';
import { ActionButton } from '@/components/ui/buttons/ActionButton';
// Import Picker, ScrollView, TextInput, Image, and MaterialIcons
import { Picker } from '@react-native-picker/picker';
import { ScrollView, TextInput, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Import MaterialIcons

interface SelectFoodModalProps {
  visible: boolean;
  mealType: keyof DailyPlan | null;
  allFoods: Food[];
  onClose: () => void;
  // onSelect now needs to handle an array of items
  onSelect: (items: PlannedMealItem[]) => void;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Define available units
const availableUnits = ['g', 'kg', 'ml', 'l', 'pz', 'porzione', 'lb', 'oz'];

export function SelectFoodModal({
  visible,
  mealType,
  allFoods,
  onClose,
  onSelect,
}: SelectFoodModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFoodIds, setSelectedFoodIds] = useState<string[]>([]);
  const [modalStage, setModalStage] = useState<'selecting' | 'enteringQuantities'>('selecting');
  const [quantitiesData, setQuantitiesData] = useState<Record<string, { quantity: string; unit: string }>>({});

  // Filter foods based on search term
  const filteredFoods = useMemo(() => {
    if (!searchTerm) return allFoods;
    return allFoods.filter((food) =>
      food.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allFoods, searchTerm]);

  // Reset state when modal visibility changes
  useEffect(() => {
    if (!visible) {
      // Full reset when hiding
      setSearchTerm('');
      setSelectedFoodIds([]);
      setModalStage('selecting');
      setQuantitiesData({});
    } else {
      // Partial reset when showing (keep search term maybe?)
      // setModalStage('selecting'); // Ensure starting at selection
      // setSelectedFoodIds([]); // Clear selections on reopen
      // setQuantitiesData({});
      // Decided to do a full reset on show as well for simplicity
      setSearchTerm('');
      setSelectedFoodIds([]);
      setModalStage('selecting');
      setQuantitiesData({});
    }
  }, [visible]);

  // Toggle food selection
  const handleFoodPress = (food: Food) => {
    setSelectedFoodIds((prevIds) =>
      prevIds.includes(food.id)
        ? prevIds.filter((id) => id !== food.id)
        : [...prevIds, food.id]
    );
  };

  // Proceed to quantity entry stage
  const handleProceedToQuantities = () => {
    if (selectedFoodIds.length === 0) return;
    const initialQuantities: Record<string, { quantity: string; unit: string }> = {};
    selectedFoodIds.forEach(id => {
      const food = allFoods.find(f => f.id === id);
      initialQuantities[id] = { quantity: '', unit: food?.defaultUnit || availableUnits[0] }; // Default unit or first available
    });
    setQuantitiesData(initialQuantities);
    setModalStage('enteringQuantities');
  };

  // Handle final confirmation
  const handleConfirmAdd = () => {
    const itemsToAdd: PlannedMealItem[] = [];
    let allValid = true;
    for (const foodId in quantitiesData) {
      const data = quantitiesData[foodId];
      const quantityNum = parseFloat(data.quantity);
      if (!data.quantity || isNaN(quantityNum) || quantityNum <= 0) {
        allValid = false;
        break;
      }
      itemsToAdd.push({ foodId, quantity: quantityNum, unit: data.unit });
    }

    if (!allValid) {
      alert('Inserisci una quantità valida (> 0) per tutti gli alimenti.');
      return;
    }
    if (itemsToAdd.length > 0) {
      onSelect(itemsToAdd);
    }
    onClose();
  };

  // Update quantity/unit state
  const updateQuantityData = (foodId: string, field: 'quantity' | 'unit', value: string) => {
    setQuantitiesData(prevData => ({
      ...prevData,
      [foodId]: { ...prevData[foodId], [field]: value },
    }));
  };

  // Dummy handlers for FoodListItem props
  const handleDummyEdit = () => {};
  const handleDummyDelete = () => {};

  // Render list item for selection stage
  const renderFoodItem = ({ item }: { item: Food }) => (
    <TouchableOpacity
      onPress={() => handleFoodPress(item)}
      // Remove selectedListItem style from TouchableOpacity
      style={styles.listItemTouchable}
    >
      <FoodListItem
        food={item}
        onEdit={handleDummyEdit}
        onDelete={handleDummyDelete}
        compact={true}
        isSelected={selectedFoodIds.includes(item.id)}
        showActions={false}
        scorePosition='right' // Move score to the right in this list
      />
    </TouchableOpacity>
  );

  // Determine modal title based on stage
  const modalTitle = modalStage === 'selecting'
    ? (mealType ? `Aggiungi a ${capitalize(mealType)}` : 'Seleziona Alimenti')
    : 'Inserisci Quantità';

  // Determine footer button properties based on stage (Revised Logic)
  let footerButtonLabel = 'Aggiungi'; // Default label
  let footerButtonOnPress = () => {}; // Default action
  let isFooterButtonDisabled = true; // Default disabled
  let footerButtonIcon: keyof typeof MaterialIcons.glyphMap = "add-circle"; // Default icon (Declare outside)

  if (modalStage === 'selecting') {
    if (selectedFoodIds.length > 0) {
      // Stage 1, items selected -> Show "Avanti"
      footerButtonLabel = 'Avanti';
      footerButtonOnPress = handleProceedToQuantities;
      isFooterButtonDisabled = false;
      footerButtonIcon = "arrow-forward";
    } else {
      // Stage 1, no items selected -> Show "Aggiungi" (disabled)
      footerButtonLabel = 'Aggiungi';
      isFooterButtonDisabled = true;
      footerButtonIcon = "add-circle";
    }
  } else {
    // Stage 2 (enteringQuantities) -> Show "Salva"
    footerButtonLabel = 'Salva';
    footerButtonOnPress = handleConfirmAdd;
    // Disable if any quantity is invalid
    isFooterButtonDisabled = Object.values(quantitiesData).some(d => !d.quantity || parseFloat(d.quantity) <= 0 || isNaN(parseFloat(d.quantity)));
    footerButtonIcon = "save";
  }

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          <View style={styles.modalContainer}>
            {/* Header with conditional Back button */}
            <ModalHeader
              title={modalTitle}
              onClose={onClose}
              showIcon={false}
              onBack={modalStage === 'enteringQuantities' ? () => setModalStage('selecting') : undefined} // Pass onBack only in quantity stage
            />

            {/* Content Area */}
            <View style={styles.contentWrapper}>
              {modalStage === 'selecting' ? (
                // Stage 1: Selecting Food
                <>
                  {/* Wrap SearchBar in a View to apply margin */}
                  <View style={styles.searchBarContainer}>
                    <SearchBar
                      placeholder="Cerca alimento..."
                      value={searchTerm}
                      onChangeText={setSearchTerm}
                      // style prop removed from SearchBar itself
                    />
                  </View>
                  {filteredFoods.length > 0 ? (
                    <FlatList
                      data={filteredFoods}
                      renderItem={renderFoodItem}
                      keyExtractor={(item) => item.id}
                      style={styles.list}
                      contentContainerStyle={styles.listContent}
                      extraData={selectedFoodIds} // Ensure re-render on selection change
                    />
                  ) : (
                    <Text style={styles.noResultsText}>Nessun alimento trovato.</Text>
                  )}
                </>
              ) : (
                // Stage 2: Entering Quantities
                <ScrollView style={styles.quantityScrollView}>
                  {/* Remove textual back button */}
                  {/* <TouchableOpacity onPress={() => setModalStage('selecting')} style={styles.backButton}>
                      <Text style={styles.backButtonText}>{"<"} Torna alla Selezione</Text>
                   </TouchableOpacity> */}
                  {selectedFoodIds.map((id) => {
                    const food = allFoods.find(f => f.id === id);
                    if (!food) return null;
                    const currentData = quantitiesData[id];
                    return (
                      // Apply container style, remove background/border later in styles
                      <View key={id} style={styles.quantityItemContainer}>
                         {/* Use food.imageUri */}
                         {food.imageUri ? (
                            <Image source={{ uri: food.imageUri }} style={styles.foodImage} />
                         ) : (
                            <View style={styles.foodImagePlaceholder} />
                         )}
                         <View style={styles.quantityDetailsContainer}>
                            <Text style={styles.quantityItemName}>{food.name}</Text>
                            <View style={styles.quantityInputRow}>
                              <TextInput
                                style={styles.quantityInput}
                                placeholder="Quantità"
                                value={currentData.quantity}
                                onChangeText={(text) => updateQuantityData(id, 'quantity', text.replace(/[^0-9.]/g, ''))}
                                keyboardType="numeric"
                                placeholderTextColor="#999"
                              />
                              <View style={styles.pickerContainer}>
                                <Picker
                                  selectedValue={currentData.unit}
                                  onValueChange={(itemValue: string) => updateQuantityData(id, 'unit', itemValue)}
                                  style={styles.unitPicker}
                                  itemStyle={styles.unitPickerItem}
                                  mode="dropdown"
                                >
                                  {availableUnits.map(unit => (
                                    <Picker.Item key={unit} label={unit} value={unit} />
                                  ))}
                                </Picker>
                              </View>
                            </View>
                         </View>
                      </View>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <ActionButton
                label={footerButtonLabel}
                onPress={footerButtonOnPress}
                disabled={isFooterButtonDisabled}
                icon={footerButtonIcon} // Use corrected variable
                style={styles.addButton}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// --- Styles --- (Includes styles for both stages)
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    flex: 1, // Important for KeyboardAvoidingView
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#f8f8f8', // Slightly lighter background
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 30 : 25, // More padding for home indicator on iOS
    overflow: 'hidden',
  },
  contentWrapper: {
    flexGrow: 1, // Allow content to take space
    flexShrink: 1, // Allow content to shrink
    paddingHorizontal: 15,
    paddingTop: 10, // Space below header
    paddingBottom: 10,
  },
  // --- Selection Stage Styles ---
  searchBarContainer: { // Container for SearchBar margin
    marginBottom: 15,
  },
  list: {},
  listContent: {
    paddingBottom: 10, // Space at the end of the list
  },
  listItemTouchable: {
    marginHorizontal: 5,
    borderRadius: 25, // More rounded
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: 'transparent', // Make touchable transparent
    // Remove border from touchable
    // borderWidth: 1,
    // borderColor: '#eee',
  },
  // selectedListItem style removed as it's now handled within FoodListItem
  // selectedListItem: { ... },
  noResultsText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#666',
    fontSize: 16,
  },
  // --- Quantity Stage Styles ---
  quantityScrollView: {
    // flex: 1,
  },
  // backButton styles removed as the element is removed
  // backButton: { ... },
  // backButtonText: { ... },
  quantityItemContainer: {
    flexDirection: 'row', // Arrange image and details side-by-side
    alignItems: 'center', // Center items vertically
    marginBottom: 15,
    paddingVertical: 10, // Vertical padding for the row
    // Remove background and border from container
    // backgroundColor: '#fff',
    // borderRadius: 12,
    // borderWidth: 1,
    // borderColor: '#e0e0e0',
    // Remove shadow
  },
  foodImage: {
    width: 45, // Smaller image
    height: 45,
    borderRadius: 22.5, // Adjust radius
    marginRight: 12, // Reduce margin
    backgroundColor: '#eee',
  },
  foodImagePlaceholder: {
    width: 45, // Smaller placeholder
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
    backgroundColor: '#e0e0e0',
  },
  quantityDetailsContainer: {
    flex: 1,
  },
  quantityItemName: {
    fontSize: 15, // Smaller font size
    fontWeight: '500',
    marginBottom: 8, // Reduce margin
    color: '#222',
  },
  quantityInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quantityInput: {
    flex: 3,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 22, // More rounded input
    paddingHorizontal: 15, // More padding
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
    backgroundColor: '#fff',
    height: 45,
  },
  pickerContainer: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 22, // More rounded picker container
    backgroundColor: '#fff',
    justifyContent: 'center',
    height: 45,
    overflow: 'hidden',
  },
  unitPicker: {
    flex: 1,
    width: '100%', // Ensure picker takes full width of container
    // backgroundColor: 'transparent', // Make background transparent if container handles it
    // color: '#000', // Explicit text color if needed
  },
  unitPickerItem: {
    // iOS specific styling (limited)
    // fontSize: 16,
    // height: 150, // Adjust height for picker wheel items on iOS
  },
  // --- Footer Styles ---
  footer: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 5, // Reduce bottom padding inside footer
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    // marginTop: 10,
  },
  addButton: {
    borderRadius: 30,
    paddingVertical: 14,
  },
});