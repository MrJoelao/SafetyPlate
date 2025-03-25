import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface ScoreBadgeProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export function ScoreBadge({ score, size = 'medium', showLabel = true }: ScoreBadgeProps) {
  const badgeColor = useMemo(() => {
    if (score >= 8) return '#4CAF50'; // Verde per punteggi alti
    if (score >= 5) return '#FFC107'; // Giallo per punteggi medi
    return '#F44336'; // Rosso per punteggi bassi
  }, [score]);

  const styles = StyleSheet.create({
    badge: {
      backgroundColor: `${badgeColor}20`, // Colore con opacità 20%
      borderWidth: 1,
      borderColor: badgeColor,
      paddingVertical: size === 'small' ? 2 : size === 'medium' ? 3 : 4,
      paddingHorizontal: size === 'small' ? 6 : size === 'medium' ? 8 : 10,
      borderRadius: size === 'small' ? 10 : size === 'medium' ? 12 : 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: badgeColor,
      fontSize: size === 'small' ? 12 : size === 'medium' ? 14 : 16,
      fontWeight: '600',
    }
  });

  return (
    <View style={styles.badge}>
      <ThemedText style={styles.text}>
        {showLabel ? `Score: ${score}` : `${score}`}
      </ThemedText>
    </View>
  );
}
