import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
// import { MaterialIcons } from '@expo/vector-icons'; // Non usato al momento
import { useThemeColor } from '@/hooks/useThemeColor'; // Importato

interface ScoreDataPoint {
  value: number;
  label?: string; // Giorno della settimana
  // Altre proprietà per gifted-charts se necessario (es. dataPointText, etc.)
}

interface WeeklyTrendSectionProps {
  weeklyScores: Array<{ day: string; score: number }>; // Es: [{day: "Lun", score: 75}, ...]
  onPress?: () => void;
}

const screenWidth = Dimensions.get('window').width;

export const WeeklyTrendSection: React.FC<WeeklyTrendSectionProps> = ({
  weeklyScores,
  onPress,
}) => {
  const themedBackgroundColor = useThemeColor({}, 'background');
  const themedTextColor = useThemeColor({}, 'text');
  const themedSecondaryTextColor = useThemeColor({light: '#7f8c8d', dark: '#95a5a6'}, 'text');
  const themedTintColor = useThemeColor({}, 'tint'); // Colore principale per la linea
  const themedGridColor = useThemeColor({light: '#E0E0E0', dark: '#39393c'}, 'icon'); // Colore per la griglia/assi

  if (!weeklyScores || weeklyScores.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: themedBackgroundColor }]}>
        <Text style={[styles.title, { color: themedTextColor }]}>Andamento Settimanale</Text>
        <Text style={[styles.noDataText, { color: themedSecondaryTextColor }]}>Nessun dato disponibile.</Text>
      </View>
    );
  }

  const chartData: ScoreDataPoint[] = weeklyScores.map(item => ({
    value: item.score,
    label: item.day,
  }));

  const maxYValue = Math.max(100, ...weeklyScores.map(s => s.score)) + 10;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, { backgroundColor: themedBackgroundColor }]}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.titleHeader}>
        <Text style={[styles.title, { color: themedTextColor }]}>Andamento Settimanale</Text>
      </View>
      <View style={styles.chartWrapper}>
        <LineChart
          data={chartData}
          height={160} // Altezza ridotta per un look più compatto
          spacing={(screenWidth - 80 - (chartData.length > 0 ? 10 : 0)) / (chartData.length > 1 ? chartData.length -1 : 1)}
          initialSpacing={5} // Ridotto
          endSpacing={5}    // Ridotto
          
          textColor={themedSecondaryTextColor} // Colore per label X e Y (se non sovrascritto)
          textFontSize={11}
          
          yAxisLabelSuffix="pt"
          yAxisTextStyle={{ color: themedSecondaryTextColor, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: themedSecondaryTextColor, fontSize: 10, paddingTop: 3 }}
          
          color={themedTintColor} // Colore linea principale
          thickness={2} // Linea più sottile
          
          // Punti dati minimalisti
          dataPointsColor={themedTintColor}
          dataPointsRadius={3} // Punti più piccoli
          
          // Area sotto la linea (rimossa per minimalismo, o molto tenue)
          // areaChart
          // startFillColor={`${themedTintColor}1A`} // Molto tenue
          // endFillColor={`${themedTintColor}05`}   // Molto tenue
          
          // Griglia e assi minimalisti
          hideRules={true} // Nasconde la griglia orizzontale
          yAxisColor={themedGridColor}
          xAxisColor={themedGridColor}
          yAxisThickness={1}
          xAxisThickness={1}
          
          maxValue={maxYValue}
          noOfSections={4} // Meno sezioni per un look più pulito
          
          isAnimated
          animationDuration={600}

          // Tooltip al tap
          showDataPointOnFocus
          focusEnabled
          showTextOnFocus
          dataPointLabelComponent={(item: any) => ( // Custom label per tooltip
            <View style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
                backgroundColor: themedTextColor, // Sfondo tooltip
            }}>
                <Text style={{color: themedBackgroundColor, fontSize: 12, fontWeight: 'bold'}}>{item.value} pt</Text>
            </View>
          )}
          dataPointLabelShiftY={-25} // Spostamento tooltip
          dataPointLabelShiftX={0}
          
          hideYAxisText={false} // Manteniamo l'asse Y per riferimento
        />
      </View>
    </TouchableOpacity>
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
    marginBottom: 15, // Leggermente ridotto
  },
  title: {
    fontSize: 18, // Leggermente ridotto
    fontWeight: '600',
    // color: '#2c3e50', // Rimosso
  },
  chartWrapper: {
    // Nessun marginLeft/marginRight specifico, il grafico dovrebbe adattarsi
  },
  noDataText: {
    textAlign: 'center',
    // color: '#7f8c8d', // Rimosso
    fontSize: 14,
    paddingVertical: 40,
  },
});