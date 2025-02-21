import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, TextInput, ScrollView, Dimensions, FlatList, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';

interface MealEntryModalProps {
  visible: boolean;
  mealType: string;
  onClose: () => void;
  onSave: (mealData: MealData) => void;
}

interface DishItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  isCustom: boolean;
  nutrition?: {
    calories?: string;
    proteins?: string;
    carbs?: string;
    fats?: string;
  };
}

interface MealData {
  dishes: DishItem[];
  datetime: Date;
}

import { loadFoods } from '@/utils/foodStorage';
import { Food } from '@/types/food';

interface SuggestedMeal {
  id: string;
  name: string;
  icon: string;
  color: string;
  score: number;
}

// Aggiungiamo una sezione per i piatti consigliati
const SUGGESTED_MEALS: SuggestedMeal[] = [
  { id: '1', name: 'Pasta', icon: 'restaurant', color: '#FF9800', score: 70 },
  { id: '2', name: 'Insalata', icon: 'eco', color: '#4CAF50', score: 90 },
  { id: '3', name: 'Pollo', icon: 'set-meal', color: '#F44336', score: 85 },
  { id: '4', name: 'Yogurt', icon: 'breakfast-dining', color: '#2196F3', score: 80 },
  { id: '5', name: 'Frutta', icon: 'nutrition', color: '#9C27B0', score: 95 },
  { id: '6', name: 'Riso', icon: 'rice-bowl', color: '#FF5722', score: 75 },
];

export const MealEntryModal: React.FC<MealEntryModalProps> = ({
  visible,
  mealType,
  onClose,
  onSave,
}) => {
  const [dishes, setDishes] = useState<DishItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const scrollViewRef = React.useRef<ScrollView>(null);
  
  const handleAddDish = (item?: Food) => {
    const newDish: DishItem = {
      id: Date.now().toString(),
      name: item?.name || '',
      quantity: '',
      unit: item?.defaultUnit || 'g',
      isCustom: !item,
      nutrition: {
        calories: '',
        proteins: '',
        carbs: '',
        fats: ''
      }
    };
    setDishes([newDish, ...dishes]);
    setShowQuickAdd(false);
    setSearchQuery('');

    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, 100);
  };

  const handleUpdateDish = (id: string, field: keyof DishItem, value: string) => {
    setDishes(dishes.map(dish => 
      dish.id === id ? { ...dish, [field]: value } : dish
    ));
  };

  const handleRemoveDish = (id: string) => {
    setDishes(dishes.filter(dish => dish.id !== id));
  };

  const handleSave = () => {
    onSave({
      dishes,
      datetime: selectedDate
    });
    setDishes([]);
    onClose();
  };

  const [availableFoods, setAvailableFoods] = useState<Food[]>([]);

  useEffect(() => {
    const fetchFoods = async () => {
      const result = await loadFoods();
      if (result.success) {
        setAvailableFoods(result.foods || []);
      } else {
        console.error('Error loading foods:', result.error);
        // TODO: Consider showing an error message to the user
      }
    };
    fetchFoods();
  }, [visible]); // Reload foods when modal becomes visible

  const filteredItems = availableFoods.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderDishItem = (dish: DishItem) => (
    <View key={dish.id} style={styles.dishItem}>
      <View style={styles.dishNameContainer}>
        <TextInput
          style={styles.dishNameInput}
          value={dish.name}
          onChangeText={(text) => handleUpdateDish(dish.id, 'name', text)}
          placeholder="Nome piatto"
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          onPress={() => handleRemoveDish(dish.id)}
          style={styles.removeButton}
        >
          <MaterialIcons name="close" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.quantityRow}>
        <View style={styles.quantityInputWrapper}>
          <TextInput
            style={styles.quantityInput}
            value={dish.quantity}
            onChangeText={(text) => handleUpdateDish(dish.id, 'quantity', text)}
            placeholder="0"
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.unitInput}
            value={dish.unit}
            onChangeText={(text) => handleUpdateDish(dish.id, 'unit', text)}
            placeholder="g"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {dish.isCustom && (
        <>
          <View style={styles.nutritionContainer}>
            <View style={styles.nutritionRow}>
              <View style={styles.nutritionField}>
                <ThemedText style={styles.nutritionLabel}>Calorie</ThemedText>
                <TextInput
                  style={styles.nutritionInput}
                  value={dish.nutrition?.calories}
                  onChangeText={(text) => handleUpdateNutrition(dish.id, 'calories', text)}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.nutritionField}>
                <ThemedText style={styles.nutritionLabel}>Proteine</ThemedText>
                <TextInput
                  style={styles.nutritionInput}
                  value={dish.nutrition?.proteins}
                  onChangeText={(text) => handleUpdateNutrition(dish.id, 'proteins', text)}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
            <View style={styles.nutritionRow}>
              <View style={styles.nutritionField}>
                <ThemedText style={styles.nutritionLabel}>Carboidrati</ThemedText>
                <TextInput
                  style={styles.nutritionInput}
                  value={dish.nutrition?.carbs}
                  onChangeText={(text) => handleUpdateNutrition(dish.id, 'carbs', text)}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.nutritionField}>
                <ThemedText style={styles.nutritionLabel}>Grassi</ThemedText>
                <TextInput
                  style={styles.nutritionInput}
                  value={dish.nutrition?.fats}
                  onChangeText={(text) => handleUpdateNutrition(dish.id, 'fats', text)}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => handleConfirmCustomDish(dish.id)}
            style={styles.confirmButton}
          >
            <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
            <ThemedText style={styles.confirmButtonText}>Conferma valori</ThemedText>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const handleUpdateNutrition = (id: string, field: keyof NonNullable<DishItem['nutrition']>, value: string) => {
    setDishes(dishes.map(dish => {
      if (dish.id === id && dish.nutrition) {
        return {
          ...dish,
          nutrition: {
            ...dish.nutrition,
            [field]: value
          }
        };
      }
      return dish;
    }));
  };

  const handleConfirmCustomDish = (id: string) => {
    setDishes(dishes.map(dish => {
      if (dish.id === id) {
        return {
          ...dish,
          isCustom: false // Una volta confermato, non è più custom
        };
      }
      return dish;
    }));
  };

  const handleSaveMeal = (mealData: MealData) => {
    console.log('Salvataggio pasto:', { type: mealType, ...mealData });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <BlurView intensity={20} style={styles.backdrop}>
        <View style={styles.modalContainer}>
          {/* Header più compatto */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <MaterialIcons 
                name={getMealTypeIcon(mealType)} 
                size={24} 
                color="#4CAF50" 
              />
              <ThemedText style={styles.title}>
                {getMealTypeLabel(mealType)}
              </ThemedText>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Barra di ricerca con suggerimenti rapidi */}
            <View style={styles.searchSection}>
              <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                  <MaterialIcons name="search" size={24} color="#666" />
                  <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={(text) => {
                      setSearchQuery(text);
                      setShowQuickAdd(true);
                    }}
                    placeholder="Cerca un alimento..."
                    placeholderTextColor="#999"
                  />
                </View>
                <TouchableOpacity 
                  style={styles.addCustomButton}
                  onPress={() => handleAddDish()}
                >
                  <MaterialIcons name="add" size={24} color="#4CAF50" />
                </TouchableOpacity>
              </View>

              {/* Suggerimenti di ricerca */}
              {showQuickAdd && searchQuery.length > 0 && (
                <View style={styles.quickAddContainer}>
                  {filteredItems.map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.quickAddItem}
                      onPress={() => handleAddDish(item)}
                    >
                      <MaterialIcons name="add-circle-outline" size={20} color="#4CAF50" />
                      <ThemedText style={styles.quickAddText}>{item.name}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Aggiungiamo una sezione per i piatti consigliati */}
            <View style={styles.suggestedSection}>
              <ThemedText style={styles.suggestedTitle}>Suggeriti</ThemedText>
              <ScrollView 
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestedScrollContent}
              >
                {SUGGESTED_MEALS.map((meal) => (
                  <TouchableOpacity
                    key={meal.id}
                    style={styles.suggestedCard}
                    onPress={() => handleAddDish({ 
                      id: meal.id, 
                      name: meal.name, 
                      defaultUnit: 'g',
                      score: meal.score
                    })}
                  >
                    <View style={[styles.suggestedIconContainer, { backgroundColor: meal.color }]}>
                      <MaterialIcons name={meal.icon as keyof typeof MaterialIcons.glyphMap} size={24} color="#fff" />
                    </View>
                    <ThemedText style={styles.suggestedText}>{meal.name}</ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Lista piatti con scroll */}
            <ScrollView 
              ref={scrollViewRef}
              style={styles.dishList}
            >
              {dishes.map(renderDishItem)}
            </ScrollView>

            {/* Suggerimenti quando non ci sono piatti */}
            {dishes.length === 0 && (
              <View style={styles.emptyState}>
                <MaterialIcons name="restaurant" size={48} color="#ddd" />
                <ThemedText style={styles.emptyStateTitle}>Aggiungi i tuoi piatti</ThemedText>
                <ThemedText style={styles.emptyStateText}>
                  Cerca tra gli alimenti disponibili o aggiungi un piatto personalizzato
                </ThemedText>
              </View>
            )}

            {/* Aggiungiamo gli stili */}
            <View style={styles.dateTimeSection}>
              <TouchableOpacity 
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <MaterialIcons name="calendar-today" size={18} color="#666" />
                <ThemedText style={styles.dateTimeText}>
                  {selectedDate.toLocaleDateString('it-IT', { 
                    day: 'numeric',
                    month: 'short'
                  })}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <MaterialIcons name="access-time" size={18} color="#666" />
                <ThemedText style={styles.dateTimeText}>
                  {selectedDate.toLocaleTimeString('it-IT', { 
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  })}
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Aggiungiamo i picker */}
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) {
                    const newDate = new Date(date);
                    newDate.setHours(selectedDate.getHours());
                    newDate.setMinutes(selectedDate.getMinutes());
                    setSelectedDate(newDate);
                  }
                }}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={(event, date) => {
                  setShowTimePicker(false);
                  if (date) {
                    setSelectedDate(date);
                  }
                }}
              />
            )}
          </View>

          {/* Footer con pulsante salva */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.saveButton]} 
              onPress={handleSave}
            >
              <MaterialIcons name="check" size={20} color="#fff" />
              <ThemedText style={styles.saveButtonText}>
                {dishes.length > 0 
                  ? `Salva ${getMealTypeLabel(mealType).toLowerCase()} (${dishes.length})`
                  : `Salva ${getMealTypeLabel(mealType).toLowerCase()}`}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  modalContainer: {
    width: width,
    height: height * 0.95,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 24,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    paddingTop: 6,
  },
  header: {
    display: 'none',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f1f1f',
  },
  closeButton: {
    padding: 6,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  searchSection: {
    padding: 12,
    paddingBottom: 0,
    backgroundColor: '#fff',
  },
  dishList: {
    flex: 1,
    padding: 12,
    paddingBottom: 80,
  },
  emptyState: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    zIndex: -1,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    maxWidth: '80%',
  },
  footer: {
    padding: 12,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 4,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 44,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  dishItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 1,
  },
  dishNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dishNameInput: {
    flex: 1,
    fontSize: 15,
    color: '#1f1f1f',
    fontWeight: '500',
  },
  dishActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f0f9f0',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  confirmButtonText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  removeButton: {
    padding: 2,
  },
  quantityRow: {
    marginBottom: 12,
  },
  quantityInputWrapper: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  quantityInput: {
    flex: 2,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: '#1f1f1f',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  unitInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: '#1f1f1f',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  nutritionContainer: {
    gap: 8,
  },
  nutritionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  nutritionField: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  nutritionInput: {
    fontSize: 15,
    color: '#1f1f1f',
    textAlign: 'center',
    padding: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#1f1f1f',
  },
  addCustomButton: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quickAddContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxHeight: height * 0.3,
  },
  quickAddItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  quickAddText: {
    fontSize: 16,
    color: '#1f1f1f',
  },
  suggestedSection: {
    paddingTop: 0,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  suggestedTitle: {
    display: 'none',
  },
  suggestedScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 6,
  },
  suggestedCard: {
    width: 56,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  suggestedIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  suggestedText: {
    fontSize: 10,
    color: '#1f1f1f',
    textAlign: 'center',
  },
  dateTimeSection: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateTimeText: {
    fontSize: 13,
    color: '#1f1f1f',
    flex: 1,
  },
});

// Funzioni helper per le icone e le etichette (mantenute da prima)
const getMealTypeIcon = (type: string) => {
  switch(type) {
    case 'breakfast': return 'free-breakfast';
    case 'lunch': return 'restaurant';
    case 'dinner': return 'dinner-dining';
    case 'snack': return 'icecream';
    default: return 'restaurant';
  }
};

const getMealTypeLabel = (type: string) => {
  switch(type) {
    case 'breakfast': return 'Colazione';
    case 'lunch': return 'Pranzo';
    case 'dinner': return 'Cena';
    case 'snack': return 'Spuntino';
    default: return 'Pasto';
  }
};
