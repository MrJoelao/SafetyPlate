import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ScrollView,
  Alert
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { ModalHeader } from '@/components/ui/common/ModalHeader';
import { Food } from '@/types/food';
import { DailyPlan, PlannedMealItem } from '@/types/planner';
import * as foodStorage from '@/utils/foodStorage';

interface MealDetailModalProps {
  visible: boolean;
  mealType: string; // "colazione", "pranzo", "cena", "spuntino"
  storageMealType: keyof DailyPlan; // "breakfast", "lunch", "dinner", "snack"
  items: { name: string; quantity: string; id?: string }[];
  date: string;
  onClose: () => void;
  onAddFood: (mealType: string) => void;
  onDeleteItem: (mealType: string, itemId: string) => void;
  onEditItem: (mealType: string, itemId: string) => void;
  allFoods: Food[];
}

export function MealDetailModal({
  visible,
  mealType,
  storageMealType,
  items,
  date,
  onClose,
  onAddFood,
  onDeleteItem,
  onEditItem,
  allFoods
}: MealDetailModalProps) {
  const [foodDetails, setFoodDetails] = useState<Record<string, Food>>({});
  const [totalNutrition, setTotalNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  // Carica i dettagli degli alimenti quando cambiano gli elementi
  useEffect(() => {
    const loadFoodDetails = async () => {
      const details: Record<string, Food> = {};
      let totalCals = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;

      // Per ogni elemento, trova i dettagli dell'alimento
      for (const item of items) {
        if (item.id) {
          // Cerca prima nell'array allFoods
          const foodFromArray = allFoods.find(f => f.id === item.id);
          
          if (foodFromArray) {
            details[item.id] = foodFromArray;
            
            // Estrai la quantità numerica dalla stringa (es. "100g" -> 100)
            const quantityMatch = item.quantity.match(/^([\d.]+)/);
            const quantity = quantityMatch ? parseFloat(quantityMatch[1]) : 0;
            
            // Calcola i valori nutrizionali in base alla quantità
            totalCals += (foodFromArray.calories || 0) * quantity / 100;
            totalProtein += (foodFromArray.protein || 0) * quantity / 100;
            totalCarbs += (foodFromArray.carbs || 0) * quantity / 100;
            totalFat += (foodFromArray.fat || 0) * quantity / 100;
          }
        }
      }

      setFoodDetails(details);
      setTotalNutrition({
        calories: Math.round(totalCals),
        protein: Math.round(totalProtein),
        carbs: Math.round(totalCarbs),
        fat: Math.round(totalFat)
      });
    };

    if (visible && items.length > 0) {
      loadFoodDetails();
    }
  }, [visible, items, allFoods]);

  // Funzione per ottenere il colore in base al tipo di pasto
  const getMealColor = () => {
    return '#2196F3'; // Colore uniforme per tutti i pasti
  };

  // Funzione per ottenere l'icona in base al tipo di pasto
  const getMealIcon = () => {
    switch (storageMealType) {
      case 'breakfast': return 'free-breakfast';
      case 'lunch': return 'lunch-dining';
      case 'dinner': return 'dinner-dining';
      case 'snack': return 'icecream';
      default: return 'restaurant';
    }
  };

  // Funzione per confermare l'eliminazione di un elemento
  const handleDeleteItem = (itemId: string) => {
    Alert.alert(
      'Conferma eliminazione',
      'Sei sicuro di voler eliminare questo alimento?',
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Elimina', 
          style: 'destructive',
          onPress: () => onDeleteItem(mealType, itemId)
        }
      ]
    );
  };

  // Renderizza un elemento della lista
  const renderFoodItem = ({ item }: { item: { name: string; quantity: string; id?: string } }) => {
    const foodDetail = item.id ? foodDetails[item.id] : null;
    
    return (
      <View style={styles.foodItem}>
        <View style={styles.foodItemHeader}>
          <View style={styles.foodItemMain}>
            <MaterialIcons name="restaurant" size={20} color={getMealColor()} />
            <Text style={styles.foodName}>{item.name}</Text>
            <Text style={[styles.foodQty, { backgroundColor: `${getMealColor()}20` }]}>
              {item.quantity}
            </Text>
          </View>
          
          <View style={styles.foodItemActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onEditItem(mealType, item.id || '')}
            >
              <MaterialIcons name="edit" size={22} color="#4CAF50" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleDeleteItem(item.id || '')}
            >
              <MaterialIcons name="delete" size={22} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>
        
        {foodDetail && (
          <View style={styles.nutritionInfo}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Calorie</Text>
              <Text style={styles.nutritionValue}>
                {Math.round((foodDetail.calories || 0) * parseFloat(item.quantity) / 100)} kcal
              </Text>
            </View>
            
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Proteine</Text>
              <Text style={styles.nutritionValue}>
                {Math.round((foodDetail.protein || 0) * parseFloat(item.quantity) / 100)}g
              </Text>
            </View>
            
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Carboidrati</Text>
              <Text style={styles.nutritionValue}>
                {Math.round((foodDetail.carbs || 0) * parseFloat(item.quantity) / 100)}g
              </Text>
            </View>
            
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Grassi</Text>
              <Text style={styles.nutritionValue}>
                {Math.round((foodDetail.fat || 0) * parseFloat(item.quantity) / 100)}g
              </Text>
            </View>
          </View>
        )}
      </View>
    );
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
          <View style={styles.modalHandle} />
          
          <ModalHeader
            title={`${mealType.charAt(0).toUpperCase() + mealType.slice(1)} - ${date}`}
            onClose={onClose}
            icon={{
              name: getMealIcon(),
              color: getMealColor(),
            }}
          />
          
          {/* Riepilogo nutrizionale */}
          <View style={[styles.summaryCard, { borderColor: `${getMealColor()}40` }]}>
            <Text style={styles.summaryTitle}>Riepilogo Nutrizionale</Text>
            
            <View style={styles.summaryContent}>
              <View style={styles.summaryItem}>
                <MaterialIcons name="local-fire-department" size={22} color="#FF5722" />
                <Text style={styles.summaryLabel}>Calorie</Text>
                <Text style={styles.summaryValue}>{totalNutrition.calories} kcal</Text>
              </View>
              
              <View style={styles.summaryItem}>
                <MaterialIcons name="fitness-center" size={22} color="#8BC34A" />
                <Text style={styles.summaryLabel}>Proteine</Text>
                <Text style={styles.summaryValue}>{totalNutrition.protein}g</Text>
              </View>
              
              <View style={styles.summaryItem}>
                <MaterialIcons name="grain" size={22} color="#FF9800" />
                <Text style={styles.summaryLabel}>Carboidrati</Text>
                <Text style={styles.summaryValue}>{totalNutrition.carbs}g</Text>
              </View>
              
              <View style={styles.summaryItem}>
                <MaterialIcons name="opacity" size={22} color="#FFC107" />
                <Text style={styles.summaryLabel}>Grassi</Text>
                <Text style={styles.summaryValue}>{totalNutrition.fat}g</Text>
              </View>
            </View>
          </View>
          
          {/* Lista degli alimenti */}
          <View style={styles.listContainer}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Alimenti ({items.length})</Text>
              
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: getMealColor() }]}
                onPress={() => onAddFood(mealType)}
              >
                <MaterialIcons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Aggiungi</Text>
              </TouchableOpacity>
            </View>
            
            {items.length > 0 ? (
              <FlatList
                data={items}
                renderItem={renderFoodItem}
                keyExtractor={(item, index) => item.id || `${index}`}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="no-meals" size={48} color="#ccc" />
                <Text style={styles.emptyText}>Nessun alimento aggiunto</Text>
                <Text style={styles.emptySubtext}>Premi "Aggiungi" per inserire alimenti</Text>
              </View>
            )}
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  modalContainer: {
    width: width,
    height: height * 0.9,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 24,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginTop: 12,
    alignSelf: 'center',
  },
  summaryCard: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.3)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  summaryContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 24,
  },
  foodItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  foodItemHeader: {
    flexDirection: 'column',
    marginBottom: 8,
  },
  foodItemMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  foodName: {
    flex: 1,
    color: '#222',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  foodQty: {
    color: '#1976d2',
    fontSize: 15,
    fontWeight: '700',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 38,
    textAlign: 'center',
  },
  foodItemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  nutritionInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  nutritionItem: {
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#666',
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});