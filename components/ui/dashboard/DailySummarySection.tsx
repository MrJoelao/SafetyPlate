import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor'; // Importato

interface DailySummarySectionProps {
  score: number;
  caloriesCurrent: number;
  caloriesTarget: number;
  onPress?: () => void;
}

// Nota: i colori per warning/error andrebbero definiti in Colors.ts
const FALLBACK_WARNING_COLOR = '#FFD166'; // Giallo
const FALLBACK_ERROR_COLOR = '#FF6B6B';   // Rosso

const getMotivationalMessage = (score: number): string => {
  if (score < 50) return "C'è spazio per migliorare oggi!";
  if (score < 75) return 'Buon lavoro, continua così!';
  return 'Ottimo! Stai andando alla grande!';
};

export const DailySummarySection: React.FC<DailySummarySectionProps> = ({
  score,
  caloriesCurrent,
  caloriesTarget,
  onPress,
}) => {
  const themedBackgroundColor = useThemeColor({}, 'background');
  const themedTextColor = useThemeColor({}, 'text');
  const themedSecondaryTextColor = useThemeColor({light: '#7f8c8d', dark: '#95a5a6'}, 'text'); // Esempio per secondario
  const themedIconColor = useThemeColor({}, 'icon');
  const themedTintColor = useThemeColor({}, 'tint'); // Colore principale per successo

  const getScoreColor = (currentScore: number): string => {
    const successColor = themedTintColor;
    // Idealmente, warningColor e errorColor dovrebbero venire dal tema
    // const warningColor = useThemeColor({light: FALLBACK_WARNING_COLOR, dark: FALLBACK_WARNING_COLOR}, 'warning');
    // const errorColor = useThemeColor({light: FALLBACK_ERROR_COLOR, dark: FALLBACK_ERROR_COLOR}, 'error');
    if (currentScore < 50) return FALLBACK_ERROR_COLOR;
    if (currentScore < 75) return FALLBACK_WARNING_COLOR;
    return successColor;
  };
  
  const scoreColor = getScoreColor(score);
  const motivationalMessage = getMotivationalMessage(score);
  const progressPercent = caloriesTarget > 0 ? (caloriesCurrent / caloriesTarget) * 100 : 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, { backgroundColor: themedBackgroundColor }]}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: themedTextColor }]}>Riepilogo Giornaliero</Text>
        {onPress && <MaterialIcons name="chevron-right" size={24} color={themedIconColor} />}
      </View>

      <View style={styles.content}>
        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreText, { color: scoreColor }]}>{score}</Text>
          <Text style={[styles.scoreLabel, { color: themedSecondaryTextColor }]}>/ 100 Punti</Text>
        </View>

        <View style={styles.caloriesContainer}>
          <Text style={[styles.caloriesValue, { color: themedTextColor }]}>
            {caloriesCurrent} <Text style={[styles.caloriesUnit, {color: themedSecondaryTextColor}]}>kcal</Text>
          </Text>
          <View style={[styles.caloriesProgressBarContainer, {backgroundColor: themedSecondaryTextColor + '30'}]}>
            <View style={[styles.caloriesProgressBar, { width: `${Math.min(progressPercent, 100)}%`, backgroundColor: scoreColor }]} />
          </View>
          <Text style={[styles.caloriesTarget, { color: themedSecondaryTextColor }]}>Obiettivo: {caloriesTarget} kcal</Text>
        </View>
      </View>

      <View style={[styles.motivationContainer, {backgroundColor: themedBackgroundColor === '#FFFFFF' || themedBackgroundColor === '#fff' ? '#f8f9fa' : themedBackgroundColor + 'DD'}]}>
        <MaterialIcons name={score >= 75 ? "thumb-up-alt" : "info-outline"} size={20} color={scoreColor} />
        <Text style={[styles.motivationText, { color: scoreColor }]}>{motivationalMessage}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor: '#FFFFFF', // Rimosso, gestito da themedBackgroundColor
    borderRadius: 16,
    padding: 20,
  },
  header: {
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
  content: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    flex: 1,
  },
  scoreText: {
    fontSize: 52,
    fontWeight: 'bold',
    lineHeight: 60,
  },
  scoreLabel: {
    fontSize: 14,
    // color: '#7f8c8d', // Rimosso
    marginTop: 4,
  },
  caloriesContainer: {
    alignItems: 'center',
    flex: 1.5,
    paddingLeft: 10,
  },
  caloriesValue: {
    fontSize: 22,
    fontWeight: '600',
    // color: '#34495e', // Rimosso
  },
  caloriesUnit: {
    fontSize: 16,
    // color: '#7f8c8d', // Rimosso
  },
  caloriesProgressBarContainer: {
    width: '100%',
    height: 8,
    // backgroundColor: '#ecf0f1', // Rimosso
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 4,
    overflow: 'hidden',
  },
  caloriesProgressBar: {
    height: '100%',
    borderRadius: 4,
  },
  caloriesTarget: {
    fontSize: 13,
    // color: '#95a5a6', // Rimosso
  },
  motivationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: '#f8f9fa', // Rimosso
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  motivationText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
  },
});