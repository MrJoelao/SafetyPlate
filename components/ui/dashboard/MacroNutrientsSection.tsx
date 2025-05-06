import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor'; // Importato

interface MacroData {
  current: number;
  target: number;
}

interface MacroNutrientsSectionProps {
  proteins: MacroData;
  carbs: MacroData;
  fats: MacroData;
  onPress?: () => void; // Opzionale, per navigare a dettagli macro
}

interface MacroDisplayProps {
  name: string;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap; // Tipo per icone da MaterialCommunityIcons
  data: MacroData;
  color: string;
  // Aggiunte per il tema
  itemBackgroundColor: string;
  textColor: string;
  secondaryTextColor: string;
}

// Unificato: questo sarà il nostro MacroDisplay
const MacroDisplay: React.FC<MacroDisplayProps> = ({
  name,
  iconName,
  data,
  color,
  itemBackgroundColor,
  textColor,
  secondaryTextColor
}) => {
  const progressPercent = data.target > 0 ? (data.current / data.target) * 100 : 0;
  return (
    <View style={[styles.macroItem, {backgroundColor: itemBackgroundColor}]}>
      <View style={styles.macroHeader}>
        <MaterialCommunityIcons name={iconName} size={22} color={color} />
        <Text style={[styles.macroName, { color }]}>{name}</Text>
      </View>
      <View style={styles.macroValues}>
        <Text style={[styles.macroCurrent, {color: textColor}]}>{data.current}g</Text>
        <Text style={[styles.macroTarget, {color: secondaryTextColor}]}> / {data.target}g</Text>
      </View>
      <View style={[styles.progressBarContainer, {backgroundColor: secondaryTextColor + '30'}]}>
        <View style={[styles.progressBar, { width: `${Math.min(progressPercent, 100)}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};


export const MacroNutrientsSection: React.FC<MacroNutrientsSectionProps> = ({
  proteins,
  carbs,
  fats,
  onPress,
}) => {
  const themedBackgroundColor = useThemeColor({}, 'background');
  const themedTextColor = useThemeColor({}, 'text');
  const themedSecondaryTextColor = useThemeColor({light: '#7f8c8d', dark: '#95a5a6'}, 'text');
  const themedItemBackgroundColor = useThemeColor({ light: '#f8f9fa', dark: '#2c2c2e' }, 'background'); // Sfondo per item macro

  // Colori specifici per macro (potrebbero essere derivati dal tema o definiti nel tema)
  const proteinColor = useThemeColor({ light: '#3498db', dark: '#5dade2' }, 'tint'); // Blu/Azzurro
  const carbsColor = useThemeColor({ light: '#f1c40f', dark: '#f5d040' }, 'tint');   // Giallo (usando tint come base, ma idealmente un colore a sé)
  const fatsColor = useThemeColor({ light: '#e74c3c', dark: '#ec7063' }, 'tint');     // Rosso (usando tint come base, ma idealmente un colore a sé)


  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, { backgroundColor: themedBackgroundColor }]}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.titleHeader}>
        <Text style={[styles.title, { color: themedTextColor }]}>Macronutrienti</Text>
      </View>
      <View style={styles.macrosContainer}>
        <MacroDisplay name="Proteine" iconName="food-drumstick" data={proteins} color={proteinColor} itemBackgroundColor={themedItemBackgroundColor} textColor={themedTextColor} secondaryTextColor={themedSecondaryTextColor}/>
        <MacroDisplay name="Carboidrati" iconName="barley" data={carbs} color={carbsColor} itemBackgroundColor={themedItemBackgroundColor} textColor={themedTextColor} secondaryTextColor={themedSecondaryTextColor}/>
        <MacroDisplay name="Grassi" iconName="oil" data={fats} color={fatsColor} itemBackgroundColor={themedItemBackgroundColor} textColor={themedTextColor} secondaryTextColor={themedSecondaryTextColor}/>
      </View>
    </TouchableOpacity>
  );
};

// Rimosse le definizioni duplicate e la sovrascrittura
// const ThemedMacroDisplay ...
// const MacroDisplay = ThemedMacroDisplay;


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
    fontSize: 18, // Uniformato a 18px
    fontWeight: '600',
    // color: '#2c3e50', // Rimosso
  },
  macrosContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-between', // Rimosso per lasciare che flex e gap gestiscano
    gap: 10, // Leggermente ridotto il gap
  },
  macroItem: {
    flex: 1, // Mantiene la distribuzione equa
    alignItems: 'flex-start',
    padding: 8, // Leggermente ridotto il padding interno
    // backgroundColor: '#f8f9fa', // Rimosso
    borderRadius: 10, // Leggermente ridotto
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroName: {
    fontSize: 14, // Leggermente ridotto
    fontWeight: '500',
    marginLeft: 5, // Leggermente ridotto
  },
  macroValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 5, // Leggermente ridotto
  },
  macroCurrent: {
    fontSize: 16, // Leggermente ridotto
    fontWeight: 'bold',
  },
  macroTarget: {
    fontSize: 12, // Leggermente ridotto
  },
  progressBarContainer: {
    width: '100%',
    height: 7,
    // backgroundColor: '#ecf0f1', // Rimosso
    borderRadius: 3.5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3.5,
  },
});