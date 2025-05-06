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
  Alert,
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
  // onSelect now needs to handle an array of items and repetition info
  onSelect: (items: PlannedMealItem[], repetition?: { type: string, count: number }) => void;
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
  const [modalStage, setModalStage] = useState<'selecting' | 'enteringQuantities' | 'settingRepetition'>('selecting');
  const [quantitiesData, setQuantitiesData] = useState<Record<string, { quantity: string; unit: string }>>({});
  const [repetitionSettings, setRepetitionSettings] = useState<{ type: string, count: number } | null>(null);
  const [itemsToAdd, setItemsToAdd] = useState<PlannedMealItem[]>([]);
  const [customizing, setCustomizing] = useState(false);
  const [showCustomRepetition, setShowCustomRepetition] = useState(false);
  const [customRepetitionData, setCustomRepetitionData] = useState({
    type: 'day', // 'day', 'week', 'month'
    count: 1,
  });

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
      setRepetitionSettings(null);
      setItemsToAdd([]);
      setShowCustomRepetition(false);
      setCustomRepetitionData({
        type: 'day',
        count: 1,
      });
    } else {
      // Full reset on show for simplicity
      setSearchTerm('');
      setSelectedFoodIds([]);
      setModalStage('selecting');
      setQuantitiesData({});
      setRepetitionSettings(null);
      setItemsToAdd([]);
      setShowCustomRepetition(false);
      setCustomRepetitionData({
        type: 'day',
        count: 1,
      });
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

  // Handle confirmation of quantities and proceed to repetition stage
  const handleConfirmQuantities = () => {
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

    // Store the items to add in state for later use
    setItemsToAdd(itemsToAdd);

    // Proceed to repetition stage
    setModalStage('settingRepetition');
  };

  // Handle final confirmation with repetition
  const handleFinalConfirm = () => {
    if (itemsToAdd.length > 0) {
      onSelect(itemsToAdd, repetitionSettings || undefined);
    }
    onClose();
  };

  // Handle repetition selection
  const handleRepetitionSelect = (type: string, count: number) => {
    if (type === 'custom') {
      // Toggle custom repetition UI
      setShowCustomRepetition(!showCustomRepetition);
      if (showCustomRepetition) {
        // If we're closing the custom UI, apply the settings
        setRepetitionSettings({ 
          type: customRepetitionData.type, 
          count: customRepetitionData.count 
        });
      } else {
        // If we're opening the custom UI, clear other selections
        setRepetitionSettings(null);
      }
    } else {
      // For non-custom options, just set the repetition settings directly
      setRepetitionSettings({ type, count });
      // Close custom UI if open
      setShowCustomRepetition(false);
    }
  };

  // Handle changes to custom repetition data
  const handleCustomRepetitionChange = (field: 'type' | 'count', value: string | number) => {
    setCustomRepetitionData(prev => ({
      ...prev,
      [field]: value
    }));
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
  let modalTitle = '';
  if (modalStage === 'selecting') {
    modalTitle = mealType ? `Aggiungi a ${capitalize(mealType)}` : 'Seleziona Alimenti';
  } else if (modalStage === 'enteringQuantities') {
    modalTitle = 'Inserisci Quantità';
  } else {
    modalTitle = 'Imposta Ripetizione';
  }

  // Determine footer button properties based on stage
  let footerButtonLabel = 'Aggiungi'; // Default label
  let footerButtonOnPress = () => {}; // Default action
  let isFooterButtonDisabled = true; // Default disabled
  let footerButtonIcon: keyof typeof MaterialIcons.glyphMap = "add-circle"; // Default icon

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
  } else if (modalStage === 'enteringQuantities') {
    // Stage 2 (enteringQuantities) -> Show "Avanti"
    footerButtonLabel = 'Avanti';
    footerButtonOnPress = handleConfirmQuantities;
    // Disable if any quantity is invalid
    isFooterButtonDisabled = Object.values(quantitiesData).some(d => !d.quantity || parseFloat(d.quantity) <= 0 || isNaN(parseFloat(d.quantity)));
    footerButtonIcon = "arrow-forward";
  } else {
    // Stage 3 (settingRepetition) -> Show "Salva"
    footerButtonLabel = repetitionSettings ? 'Salva' : 'Salta';
    footerButtonOnPress = handleFinalConfirm;
    isFooterButtonDisabled = false;
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
              ) : modalStage === 'enteringQuantities' ? (
                // Stage 2: Entering Quantities
                <ScrollView style={styles.quantityScrollView}>
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
              ) : (
                // Stage 3: Setting Repetition
                <View style={[styles.repetitionContainer, {minHeight: 500, maxHeight: 600, justifyContent: 'flex-start'}]}>
                  {!showCustomRepetition && (
                    <>
                      <Text style={styles.repetitionTitle}>Vuoi ripetere questo pasto nei giorni successivi?</Text>
                      <Text style={styles.repetitionSubtitle}>Seleziona per quanti giorni, settimane o mesi vuoi ripetere questo pasto</Text>
                      <View style={styles.repetitionOptionsContainer}>
                        <TouchableOpacity
                          style={[
                            styles.repetitionOption,
                            repetitionSettings?.type === 'day' && repetitionSettings?.count === 7 && styles.repetitionOptionSelected
                          ]}
                          onPress={() => {
                            handleRepetitionSelect('day', 7);
                            setShowCustomRepetition(false);
                          }}
                        >
                          <MaterialIcons
                            name="today"
                            size={24}
                            color={repetitionSettings?.type === 'day' && repetitionSettings?.count === 7 ? "#fff" : "#2196F3"}
                          />
                          <Text style={[
                            styles.repetitionOptionText,
                            repetitionSettings?.type === 'day' && repetitionSettings?.count === 7 && styles.repetitionOptionTextSelected
                          ]}>7 giorni</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.repetitionOption,
                            repetitionSettings?.type === 'day' && repetitionSettings?.count === 14 && styles.repetitionOptionSelected
                          ]}
                          onPress={() => {
                            handleRepetitionSelect('day', 14);
                            setShowCustomRepetition(false);
                          }}
                        >
                          <MaterialIcons
                            name="date-range"
                            size={24}
                            color={repetitionSettings?.type === 'day' && repetitionSettings?.count === 14 ? "#fff" : "#2196F3"}
                          />
                          <Text style={[
                            styles.repetitionOptionText,
                            repetitionSettings?.type === 'day' && repetitionSettings?.count === 14 && styles.repetitionOptionTextSelected
                          ]}>14 giorni</Text>
                        </TouchableOpacity>

                        {/* Pulsante mese corrente */}
                        <TouchableOpacity
                          style={[
                            styles.repetitionOption,
                            repetitionSettings?.type === 'month-current' && styles.repetitionOptionSelected
                          ]}
                          onPress={() => {
                            const today = new Date();
                            const year = today.getFullYear();
                            const month = today.getMonth();
                            const lastDay = new Date(year, month + 1, 0).getDate();
                            const currentDay = today.getDate();
                            const daysLeft = lastDay - currentDay + 1;
                            handleRepetitionSelect('month-current', daysLeft);
                            setShowCustomRepetition(false);
                          }}
                        >
                          <MaterialIcons
                            name="event-available"
                            size={24}
                            color={repetitionSettings?.type === 'month-current' ? "#fff" : "#2196F3"}
                          />
                          <Text style={[
                            styles.repetitionOptionText,
                            repetitionSettings?.type === 'month-current' && styles.repetitionOptionTextSelected
                          ]}>
                            {(() => {
                              const today = new Date();
                              return today.toLocaleString('it-IT', { month: 'long', year: 'numeric' });
                            })()}
                          </Text>
                        </TouchableOpacity>

                        {/* Pulsante personalizza */}
                        <TouchableOpacity
                          style={[
                            styles.repetitionOption,
                            (repetitionSettings?.type === 'custom' || showCustomRepetition) && styles.repetitionOptionSelected
                          ]}
                          onPress={() => handleRepetitionSelect('custom', 0)}
                        >
                          <MaterialIcons
                            name="edit-calendar"
                            size={24}
                            color={(repetitionSettings?.type === 'custom' || showCustomRepetition) ? "#fff" : "#2196F3"}
                          />
                          <Text style={[
                            styles.repetitionOptionText,
                            (repetitionSettings?.type === 'custom' || showCustomRepetition) && styles.repetitionOptionTextSelected
                          ]}>Personalizza…</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                  {showCustomRepetition && (
                    <View style={styles.customRepetitionContainer}>
                      <Text style={styles.customRepetitionTitle}>Personalizza ripetizione</Text>
                      <View style={styles.customRepetitionRow}>
                        <Text style={styles.customRepetitionLabel}>Ripeti ogni</Text>
                        <TextInput
                          style={styles.customRepetitionInput}
                          value={customRepetitionData.count.toString()}
                          onChangeText={(text) => {
                            const count = parseInt(text) || 1;
                            handleCustomRepetitionChange('count', count);
                          }}
                          keyboardType="numeric"
                          maxLength={3}
                        />
                        <View style={styles.customRepetitionTypeContainer}>
                          <Picker
                            selectedValue={customRepetitionData.type}
                            onValueChange={(value) => handleCustomRepetitionChange('type', value)}
                            style={styles.customRepetitionTypePicker}
                          >
                            <Picker.Item label="Giorni" value="day" />
                            <Picker.Item label="Settimane" value="week" />
                            <Picker.Item label="Mesi" value="month" />
                          </Picker>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.customRepetitionApplyButton}
                        onPress={() => {
                          setRepetitionSettings({
                            type: customRepetitionData.type,
                            count: customRepetitionData.count
                          });
                          setShowCustomRepetition(false);
                        }}
                      >
                        <Text style={styles.customRepetitionApplyButtonText}>Applica</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {/* Preview scelta personalizzata */}
                  {showCustomRepetition && (
                    <Text style={styles.customRepetitionChoicePreview}>
                      {`Ripeti ogni ${customRepetitionData.count} ${
                        customRepetitionData.type === 'day'
                          ? customRepetitionData.count === 1 ? 'giorno' : 'giorni'
                          : customRepetitionData.type === 'week'
                          ? customRepetitionData.count === 1 ? 'settimana' : 'settimane'
                          : customRepetitionData.count === 1 ? 'mese' : 'mesi'
                      }`}
                    </Text>
                  )}

                  <Text style={styles.repetitionNote}>
                    {repetitionSettings
                      ? repetitionSettings.type === 'custom'
                        ? (() => {
                            let unitSing = '';
                            let unitPlur = '';
                            if (customRepetitionData.type === 'day') {
                              unitSing = 'giorno';
                              unitPlur = 'giorni';
                            } else if (customRepetitionData.type === 'week') {
                              unitSing = 'settimana';
                              unitPlur = 'settimane';
                            } else {
                              unitSing = 'mese';
                              unitPlur = 'mesi';
                            }
                            return `Questo pasto verrà ripetuto per ${repetitionSettings.count} ${repetitionSettings.count === 1 ? unitSing : unitPlur}`;
                          })()
                        : "Questo pasto verrà aggiunto automaticamente ai giorni selezionati"
                      : "Puoi anche saltare questo passaggio per aggiungere il pasto solo al giorno corrente"}
                  </Text>
                </View>
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
    justifyContent: 'flex-end', // Position at the bottom of the screen
  },
  keyboardView: {
    flex: 1, // Important for KeyboardAvoidingView
    justifyContent: 'flex-end', // Position at the bottom of the screen
  },
  modalContainer: {
    backgroundColor: '#f8f8f8', // Slightly lighter background
    borderTopLeftRadius: 24, // Rounded corners only at the top
    borderTopRightRadius: 24, // Rounded corners only at the top
    maxHeight: '90%', // Allow more height for content
    paddingBottom: Platform.OS === 'ios' ? 40 : 30, // More padding for home indicator on iOS
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
  // Repetition stage styles
  repetitionContainer: {
    flexGrow: 1,
    minHeight: 220,
    maxHeight: 400,
  },
  repetitionContentContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    padding: 16,
    paddingBottom: 32, // Extra padding at the bottom for better scrolling
  },
  repetitionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  repetitionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  repetitionOptionsContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 8,
    gap: 8,
  },
  repetitionOption: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2196F3',
    flexDirection: 'row',
    justifyContent: 'center',
    marginRight: 0,
  },
  repetitionOptionSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#1976d2',
  },
  repetitionOptionText: {
    color: '#2196F3',
    fontWeight: '500',
    fontSize: 15,
    marginLeft: 8,
  },
  repetitionOptionTextSelected: {
    color: '#fff',
  },
  repetitionNote: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  // Custom repetition styles
  customRepetitionContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 18,
    padding: 24,
    marginTop: 18,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
    alignItems: 'center',
    shadowColor: '#2196F3',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    minHeight: 220,
    justifyContent: 'center',
  },
  customRepetitionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1976d2',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  customRepetitionHelp: {
    fontSize: 14,
    color: '#666',
    marginBottom: 18,
    textAlign: 'center',
    fontStyle: 'italic',
    maxWidth: 320,
  },
  customRepetitionRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 18,
    width: '100%',
    justifyContent: 'center',
    gap: 12,
  },
  customRepetitionLabel: {
    fontSize: 15,
    color: '#1976d2',
    marginRight: 8,
    fontWeight: '500',
    marginBottom: 4,
  },
  customRepetitionInput: {
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    width: 70,
    textAlign: 'center',
    fontSize: 17,
    backgroundColor: '#fff',
    marginRight: 8,
    fontWeight: '600',
    color: '#1976d2',
  },
  customRepetitionTypeContainer: {
    flex: 1,
    marginLeft: 0,
    borderWidth: 1.5,
    borderColor: '#2196F3',
    borderRadius: 22,
    backgroundColor: '#fff',
    height: 54,
    justifyContent: 'center',
    overflow: 'hidden',
    minWidth: 180,
    maxWidth: 220,
    marginLeft: 8,
    marginRight: 8,
    elevation: 1,
  },
  customRepetitionTypePicker: {
    width: '100%',
    height: 54,
    color: '#1976d2',
    fontSize: 19,
    borderRadius: 22,
    paddingHorizontal: 8,
  },
  customRepetitionChoicePreview: {
    marginTop: 12,
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignSelf: 'center',
    minWidth: 120,
    maxWidth: 260,
  },
  customRepetitionButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 18,
    width: '100%',
  },
  customRepetitionApplyButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 0,
    elevation: 2,
  },
  customRepetitionCancelButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: '#2196F3',
    elevation: 0,
  },
  customRepetitionApplyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  customRepetitionCancelButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
