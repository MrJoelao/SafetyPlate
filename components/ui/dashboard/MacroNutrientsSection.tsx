import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';

interface MacroData {
  current: number;
  target: number;
}

interface MacroNutrientsSectionProps {
  proteins: MacroData;
  carbs: MacroData;
  fats: MacroData;
  onPress?: () => void;
}

interface MacroDisplayProps {
  name: string;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  data: MacroData;
  color: string;
  itemBackgroundColor: string;
  textColor: string;
  secondaryTextColor: string;
}

const MacroDisplay: React.FC<MacroDisplayProps> = (props) => {
  const progressPercent = props.data.target > 0 ? (props.data.current / props.data.target) * 100 : 0;
  return (
    <View style={[styles.macroItem, {backgroundColor: props.itemBackgroundColor}]}>
      <View style={styles.macroHeader}>
        <MaterialCommunityIcons name={props.iconName} size={20} color={props.color} />
        <Text style={[styles.macroName, { color: props.color, flexShrink: 1 }]}>{props.name}</Text>
      </View>
      <View style={styles.macroValues}>
        <Text style={[styles.macroCurrent, {color: props.textColor}]}>{props.data.current}g</Text>
        <Text style={[styles.macroTarget, {color: props.secondaryTextColor}]}> / {props.data.target}g</Text>
      </View>
      <View style={[styles.progressBarContainer, {backgroundColor: props.secondaryTextColor + '30'}]}>
        <View style={[styles.progressBar, { width: `${Math.min(progressPercent, 100)}%`, backgroundColor: props.color }]} />
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
  const themedItemBackgroundColor = useThemeColor({ light: '#f8f9fa', dark: '#2c2c2e' }, 'background');

  const proteinColor = useThemeColor({ light: '#3498db', dark: '#5dade2' }, 'tint');
  const carbsColor = useThemeColor({ light: '#f1c40f', dark: '#f5d040' }, 'tint');
  const fatsColor = useThemeColor({ light: '#e74c3c', dark: '#ec7063' }, 'tint');


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
  macrosContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  macroItem: {
    flex: 1,
    alignItems: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroName: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  macroValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 5,
  },
  macroCurrent: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  macroTarget: {
    fontSize: 12,
  },
  progressBarContainer: {
    width: '100%',
    height: 7,
    borderRadius: 3.5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3.5,
  },
});
