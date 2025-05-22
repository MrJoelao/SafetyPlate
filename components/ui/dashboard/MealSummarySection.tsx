import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { MealItem } from './MealItem'; // P1144

export interface MealSummary {
  id: string;
  name: 'Colazione' | 'Pranzo' | 'Cena' | 'Spuntini';
  status: 'Completo' | 'Parziale' | 'Mancante' | 'Registrato';
  calories?: number;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
}

interface MealSummarySectionProps {
  meals: MealSummary[];
  onPressMeal?: (mealId: string) => void;
  onViewAllPress?: () => void;
}

const FALLBACK_PARTIAL_COLOR = '#f39c12';

export const MealSummarySection: React.FC<MealSummarySectionProps> = ({
  meals,
  onPressMeal,
  onViewAllPress,
}) => {
  const themedBackgroundColor = useThemeColor({}, 'background');
  const themedTextColor = useThemeColor({}, 'text');
  const themedSecondaryTextColor = useThemeColor({ light: '#7f8c8d', dark: '#95a5a6' }, 'text');
  const themedIconColor = useThemeColor({}, 'icon');
  const themedTintColor = useThemeColor({}, 'tint');
  const themedBorderColor = useThemeColor({ light: '#ecf0f1', dark: '#39393c' }, 'icon');

  const successStatusColor = themedTintColor;
  const partialStatusColor = FALLBACK_PARTIAL_COLOR;
  const missingStatusColor = themedSecondaryTextColor;

  if (!meals || meals.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: themedBackgroundColor }]}>
      <View style={styles.titleHeader}>
        <Text style={[styles.title, { color: themedTextColor }]}>Pasti di Oggi</Text>
        {onViewAllPress && (
          <TouchableOpacity onPress={onViewAllPress}>
            <Text style={[styles.viewAllText, { color: themedTintColor }]}>Vedi Tutti</Text>
          </TouchableOpacity>
        )}
      </View>
      {meals.map((item, index) => (
        <View key={item.id}>
          <MealItem
            item={item}
            onPress={onPressMeal}
            textColor={themedTextColor}
            secondaryTextColor={themedSecondaryTextColor}
            iconColor={themedIconColor}
            successColor={successStatusColor}
            partialColor={partialStatusColor}
            missingColor={missingStatusColor}
          />
          {index < meals.length - 1 && <View style={[styles.separator, { backgroundColor: themedBorderColor }]} />}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  titleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    marginVertical: 4,
    marginLeft: 65,
  },
});
