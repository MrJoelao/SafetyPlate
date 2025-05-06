import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'; // FlatList rimosso dagli import diretti
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor'; // Importato

export interface MealSummary {
  id: string;
  name: 'Colazione' | 'Pranzo' | 'Cena' | 'Spuntini';
  status: 'Completo' | 'Parziale' | 'Mancante' | 'Registrato'; // O altri stati rilevanti
  calories?: number;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
}

interface MealSummarySectionProps {
  meals: MealSummary[];
  onPressMeal?: (mealId: string)
 => void;
  onViewAllPress?: () => void;
}

// Nota: il colore per "Parziale" andrebbe definito in Colors.ts
const FALLBACK_PARTIAL_COLOR = '#f39c12'; // Arancione/Giallo

const MealItem: React.FC<{
  item: MealSummary;
  onPress?: (mealId: string) => void;
  // Props per i colori del tema
  textColor: string;
  secondaryTextColor: string;
  iconColor: string;
  successColor: string; // per Completo/Registrato
  partialColor: string; // per Parziale
  missingColor: string; // per Mancante
}> = ({
  item,
  onPress,
  textColor,
  secondaryTextColor,
  iconColor,
  successColor,
  partialColor,
  missingColor
}) => {
  let statusColor = missingColor;
  if (item.status === 'Completo' || item.status === 'Registrato') statusColor = successColor;
  else if (item.status === 'Parziale') statusColor = partialColor;

  return (
    <TouchableOpacity
      style={styles.mealItemContainer}
      onPress={() => onPress && onPress(item.id)}
      disabled={!onPress}
    >
      <View style={[styles.mealIconContainer, { backgroundColor: `${statusColor}2A` }]}> {/* Leggermente più trasparente */}
        <MaterialCommunityIcons name={item.iconName} size={24} color={statusColor} />
      </View>
      <View style={styles.mealInfo}>
        <Text style={[styles.mealName, {color: textColor}]}>{item.name}</Text>
        <Text style={[styles.mealStatus, { color: statusColor }]}>{item.status}</Text>
      </View>
      {item.calories !== undefined && (
        <Text style={[styles.mealCalories, {color: textColor}]}>{item.calories} kcal</Text>
      )}
      {onPress && <MaterialIcons name="chevron-right" size={22} color={iconColor} />}
    </TouchableOpacity>
  );
};


export const MealSummarySection: React.FC<MealSummarySectionProps> = ({
  meals,
  onPressMeal,
  onViewAllPress,
}) => {
  const themedBackgroundColor = useThemeColor({}, 'background');
  const themedTextColor = useThemeColor({}, 'text');
  const themedSecondaryTextColor = useThemeColor({light: '#7f8c8d', dark: '#95a5a6'}, 'text');
  const themedIconColor = useThemeColor({}, 'icon');
  const themedTintColor = useThemeColor({}, 'tint'); // Usato per link "Vedi Tutti" e status "success"
  const themedBorderColor = useThemeColor({light: '#ecf0f1', dark: '#39393c'}, 'icon');

  // Colori di stato
  const successStatusColor = themedTintColor; // Verde/Blu del tema
  const partialStatusColor = FALLBACK_PARTIAL_COLOR; // Arancione/Giallo (da tema se disponibile)
  const missingStatusColor = themedSecondaryTextColor; // Grigio


  if (!meals || meals.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, {backgroundColor: themedBackgroundColor}]}>
      <View style={styles.titleHeader}>
        <Text style={[styles.title, {color: themedTextColor}]}>Pasti di Oggi</Text>
        {onViewAllPress && (
          <TouchableOpacity onPress={onViewAllPress}>
            <Text style={[styles.viewAllText, {color: themedTintColor}]}>Vedi Tutti</Text>
          </TouchableOpacity>
        )}
      </View>
      {meals.map((item, index) => (
        // Tentativo: sostituire React.Fragment con View per vedere se l'errore cambia
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
          {index < meals.length - 1 && <View style={[styles.separator, {backgroundColor: themedBorderColor}]} />}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor: '#FFFFFF', // Rimosso
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
    fontSize: 18, // Leggermente ridotto
    fontWeight: '600',
    // color: '#2c3e50', // Rimosso
  },
  viewAllText: {
    fontSize: 14,
    // color: '#3498db', // Rimosso
    fontWeight: '500',
  },
  mealItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  mealIconContainer: {
    padding: 10,
    borderRadius: 25,
    marginRight: 15,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 17,
    fontWeight: '500',
    // color: '#34495e', // Rimosso
  },
  mealStatus: { // Colore gestito da statusColor
    fontSize: 13,
    marginTop: 2,
  },
  mealCalories: { // Colore gestito da textColor
    fontSize: 15,
    fontWeight: '500',
    // color: '#34495e', // Rimosso
    marginHorizontal: 10,
  },
  separator: {
    height: 1,
    // backgroundColor: '#ecf0f1', // Rimosso
    marginVertical: 4,
    marginLeft: 65,
  },
});