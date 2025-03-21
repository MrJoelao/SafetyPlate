import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Animated,
  FlatList,
  PanResponder,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons } from '@expo/vector-icons';
import { Food } from '@/types/food';
import { loadFoods, deleteFood } from '@/utils/foodStorage';
import { AddEditFoodModal } from './AddEditFoodModal';

interface SwipeableRow {
  rowRef: React.RefObject<View>;
  rowMap: Map<string, Animated.Value>;
}

export function InlineFoodManager() {
  const isMounted = useRef(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadFoodData();
    return () => {
      isMounted.current = false;
    };
  }, []);

  const [foods, setFoods] = useState<Food[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingFood, setEditingFood] = useState<Food | undefined>();
  const [isAddEditModalVisible, setIsAddEditModalVisible] = useState(false);

  // Animation refs
  const swipeableRow = useRef<SwipeableRow>({
    rowRef: React.createRef<View>(),
    rowMap: new Map()
  }).current;

  const loadFoodData = async () => {
    setIsLoading(true);
    const result = await loadFoods();
    if (result.success) {
      setFoods(result.foods || []);
    } else {
      Alert.alert('Errore', result.error || 'Errore nel caricamento degli alimenti');
    }
    setIsLoading(false);
  };

  const handleEdit = (food: Food) => {
    setEditingFood(food);
    setIsAddEditModalVisible(true);
  };

  const handleDelete = useCallback((foodId: string) => {
    Alert.alert(
      'Conferma',
      'Sei sicuro di voler eliminare questo alimento?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteFood(foodId);
            if (result.success) {
              loadFoodData();
            } else {
              Alert.alert('Errore', result.error || "Errore durante l'eliminazione");
            }
          },
        },
      ]
    );
  }, []);

  const getSwipeAnimation = (id: string) => {
    if (!swipeableRow.rowMap.has(id)) {
      swipeableRow.rowMap.set(id, new Animated.Value(0));
    }
    return swipeableRow.rowMap.get(id)!;
  };

  const createPanResponder = (id: string) => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, { dx }) => {
      const swipeAnim = getSwipeAnimation(id);
      swipeAnim.setValue(dx);
    },
    onPanResponderRelease: (_, { dx }) => {
      const swipeAnim = getSwipeAnimation(id);
      if (dx < -100) {
        // Swipe left to delete
        Animated.timing(swipeAnim, {
          toValue: -200,
          duration: 200,
          useNativeDriver: true,
        }).start(() => handleDelete(id));
      } else if (dx > 100) {
        // Swipe right to edit
        Animated.timing(swipeAnim, {
          toValue: 200,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          const food = foods.find(f => f.id === id);
          if (food) handleEdit(food);
        });
      } else {
        // Reset position
        Animated.spring(swipeAnim, {
          toValue: 0,
          useNativeDriver: true,
          friction: 5,
        }).start();
      }
    },
  });

  const renderFoodItem = ({ item, index }: { item: Food; index: number }) => {
    const swipeAnim = getSwipeAnimation(item.id);
    const panResponder = createPanResponder(item.id);

    return (
      <Animated.View
        style={[
          styles.foodItem,
          {
            transform: [{ translateX: swipeAnim }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Background actions */}
        <View style={styles.foodItemBackground}>
          <View style={styles.actionLeft}>
            <MaterialIcons name="edit" size={24} color="#fff" />
            <ThemedText style={styles.actionText}>Modifica</ThemedText>
          </View>
          <View style={styles.actionRight}>
            <MaterialIcons name="delete" size={24} color="#fff" />
            <ThemedText style={styles.actionText}>Elimina</ThemedText>
          </View>
        </View>

        {/* Content */}
        <View style={styles.foodContent}>
          <View style={styles.foodInfo}>
            <View style={styles.foodHeader}>
              <ThemedText style={styles.foodName}>{item.name}</ThemedText>
              <ThemedText style={styles.foodIndex}>{index + 1}</ThemedText>
            </View>
            <ThemedText style={styles.foodDetails}>
              Score: {item.score} • Unità: {item.defaultUnit}
            </ThemedText>
            {item.nutritionPer100g && (
              <ThemedText style={styles.nutritionInfo}>
                {item.nutritionPer100g.calories ? `${item.nutritionPer100g.calories} kcal • ` : ''}
                {item.nutritionPer100g.proteins ? `P: ${item.nutritionPer100g.proteins}g • ` : ''}
                {item.nutritionPer100g.carbs ? `C: ${item.nutritionPer100g.carbs}g • ` : ''}
                {item.nutritionPer100g.fats ? `G: ${item.nutritionPer100g.fats}g` : ''}
              </ThemedText>
            )}
          </View>
          <MaterialIcons 
            name="drag-indicator" 
            size={24} 
            color="#ccc"
            style={styles.dragHandle}
          />
        </View>
      </Animated.View>
    );
  };

  const filteredFoods = foods
    .filter(food => food.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cerca alimenti..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            <MaterialIcons name="close" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Food List */}
      <FlatList
        ref={flatListRef}
        data={filteredFoods}
        renderItem={renderFoodItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="no-meals" size={48} color="#ccc" />
            <ThemedText style={styles.emptyText}>
              {isLoading ? 'Caricamento...' : 'Nessun alimento trovato'}
            </ThemedText>
          </View>
        }
        ListHeaderComponent={
          filteredFoods.length > 0 ? (
            <ThemedText style={styles.listHeader}>
              {filteredFoods.length} {filteredFoods.length === 1 ? 'alimento' : 'alimenti'}
            </ThemedText>
          ) : null
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditingFood(undefined);
          setIsAddEditModalVisible(true);
        }}
      >
        <MaterialIcons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <AddEditFoodModal
        visible={isAddEditModalVisible}
        onClose={() => setIsAddEditModalVisible(false)}
        food={editingFood}
        onSave={async (food: Food) => {
          await loadFoodData();
          setIsAddEditModalVisible(false);
        }}
      />
    </KeyboardAvoidingView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 8,
  },
  clearButton: {
    padding: 8,
  },
  listHeader: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  listContent: {
    padding: 20,
    paddingTop: 8,
  },
  foodItem: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  foodItemBackground: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionLeft: {
    backgroundColor: '#2196F3',
    width: width * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  actionRight: {
    backgroundColor: '#F44336',
    width: width * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  foodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  foodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  foodIndex: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  foodDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  nutritionInfo: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  dragHandle: {
    marginLeft: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#006C51',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
});
