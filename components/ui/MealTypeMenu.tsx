// Componente per il menu di selezione del tipo di pasto
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

interface MealTypeMenuProps {
  visible: boolean;
  onSelect: (mealType: string) => void;
  onClose: () => void;
}

const MEAL_TYPES = [
  { id: 'breakfast', icon: 'free-breakfast', label: 'Colazione' },
  { id: 'lunch', icon: 'restaurant', label: 'Pranzo' },
  { id: 'dinner', icon: 'dinner-dining', label: 'Cena' },
  { id: 'snack', icon: 'icecream', label: 'Spuntino' },
];

export const MealTypeMenu: React.FC<MealTypeMenuProps> = ({
  visible,
  onSelect,
  onClose,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      // Animazione di apertura
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Animazione di chiusura
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [
            { scale: scaleAnim },
            { translateY: scaleAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0]
            })}
          ],
          opacity: opacityAnim,
          // Nascondiamo il menu quando è completamente chiuso
          pointerEvents: visible ? 'auto' : 'none'
        }
      ]}
    >
      {MEAL_TYPES.map((meal) => (
        <TouchableOpacity
          key={meal.id}
          style={[
            styles.menuItem,
            { backgroundColor: 'transparent' }
          ]}
          onPress={() => onSelect(meal.id)}
        >
          <View style={[
            styles.iconContainer,
            { backgroundColor: getMealTypeColor(meal.id) }
          ]}>
            <MaterialIcons 
              name={meal.icon as any} 
              size={18} 
              color="#fff" 
            />
          </View>
          <ThemedText style={styles.menuText}>{meal.label}</ThemedText>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 75,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    gap: 2,
    width: 160,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f1f1f',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
});

const getMealTypeColor = (type: string) => {
  switch(type) {
    case 'breakfast': return '#FF9800';
    case 'lunch': return '#4CAF50';
    case 'dinner': return '#F44336';
    case 'snack': return '#2196F3';
    default: return '#9E9E9E';
  }
}; 