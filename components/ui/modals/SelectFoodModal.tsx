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
import { QuantityInput } from '@/components/ui/forms/QuantityInput';
import { ActionButton } from '@/components/ui/buttons/ActionButton';

interface SelectFoodModalProps {
  visible: boolean;
  mealType: keyof DailyPlan | null;
  allFoods: Food[];
  onClose: () => void;
  onSelect: (item: PlannedMealItem) => void;
}

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
  const [quantity, setQuantity] = useState<string>('');

  const filteredFoods = useMemo(() => {
    if (!searchTerm) return allFoods;
    return allFoods.filter((food) =>
      food.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allFoods, searchTerm]);

  useEffect(() => {
    if (!visible) {
      setSearchTerm('');
      setSelectedFood(null);
      setQuantity('');
    }
  }, [visible]);

  const handleFoodPress = (food: Food) => setSelectedFood(food);

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
      unit: selectedFood.defaultUnit,
    };
    onSelect(newItem);
    onClose();
  };

  // Define dummy functions for onEdit/onDelete as they are required by FoodListItem
  const handleDummyEdit = () => {};
  const handleDummyDelete = () => {};

  const renderFoodItem = ({ item }: { item: Food }) => (
    <TouchableOpacity
      onPress={() => handleFoodPress(item)}
      style={[
        styles.listItemTouchable,
        selectedFood?.id === item.id ? styles.selectedListItem : undefined
      ]}
    >
      <FoodListItem
        food={item}
        onEdit={handleDummyEdit} // Pass dummy function
        onDelete={handleDummyDelete} // Pass dummy function
        compact={true} // Use compact mode for the list

      />
    </TouchableOpacity>
  );

  const modalTitle = mealType ? `Aggiungi a ${capitalize(mealType)}` : 'Seleziona Alimento';

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          <View style={styles.modalContainer}>
            <ModalHeader
              title={modalTitle}
              onClose={onClose}
              showIcon={false}
            />
            <View style={styles.contentWrapper}>
              {!selectedFood ? (
                <>
                  <SearchBar
                    placeholder="Cerca alimento..."
                    value={searchTerm}
                    onChangeText={setSearchTerm}
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
                    <Text style={styles.noResultsText}>Nessun alimento trovato.</Text>
                  )}
                </>
              ) : (
                <View style={styles.quantitySection}>
                  <Text style={styles.selectedFoodText}>
                    Alimento: {selectedFood.name}
                  </Text>
                  <QuantityInput
                    label={`Quantità (${selectedFood.defaultUnit})`}
                    quantity={quantity}
                    onQuantityChange={setQuantity}
                    unit={selectedFood.defaultUnit}
                    onUnitChange={() => {}}
                  />
                  <TouchableOpacity onPress={() => setSelectedFood(null)} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Cambia Alimento</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View style={styles.footer}>
              <ActionButton
                label="Aggiungi"
                onPress={handleSelectAndClose}
                disabled={!selectedFood || !quantity}
                icon="add-circle"
                style={styles.addButton} 
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 25,
    overflow: 'hidden',
  },
  contentWrapper: {
    flexGrow: 1,
    flexShrink: 1,
    paddingHorizontal: 15,
    paddingTop: 10, // Add padding to move SearchBar up slightly
  },
  list: {},
  listContent: {
    paddingBottom: 10,
  },
  selectedListItem: {
    backgroundColor: '#e0f2f7',
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  quantitySection: {
    flex: 1,
    justifyContent: 'center',
  },
  selectedFoodText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#000000',
  },
  backButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007bff',
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 10,
  },
  addButton: {
    borderRadius: 30,
    paddingVertical: 14,
  },
  listItemTouchable: {
    marginHorizontal: 5,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
});