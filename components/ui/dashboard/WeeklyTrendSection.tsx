import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ScoreDataPoint {
  value: number;
  label?: string;
}

interface WeeklyTrendSectionProps {
  weeklyScores: Array<{ day: string; score: number }>;
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
  const themedTintColor = useThemeColor({}, 'tint');
  const themedGridColor = useThemeColor({light: '#E0E0E0', dark: '#39393c'}, 'icon');

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
          height={160}
          spacing={(screenWidth - 80 - (chartData.length > 0 ? 10 : 0)) / (chartData.length > 1 ? chartData.length -1 : 1)}
          initialSpacing={5}
          endSpacing={5}
          textColor={themedSecondaryTextColor}
          textFontSize={11}
          yAxisLabelSuffix="pt"
          yAxisTextStyle={{ color: themedSecondaryTextColor, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: themedSecondaryTextColor, fontSize: 10, paddingTop: 3 }}
          color={themedTintColor}
          thickness={2}
          dataPointsColor={themedTintColor}
          dataPointsRadius={3}
          hideRules={true}
          yAxisColor={themedGridColor}
          xAxisColor={themedGridColor}
          yAxisThickness={1}
          xAxisThickness={1}
          maxValue={maxYValue}
          noOfSections={4}
          isAnimated
          animationDuration={600}
          showDataPointOnFocus
          focusEnabled
          showTextOnFocus
          dataPointLabelComponent={(item: any) => (
            <View style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
                backgroundColor: themedTextColor,
            }}>
                <Text style={{color: themedBackgroundColor, fontSize: 12, fontWeight: 'bold'}}>{item.value} pt</Text>
            </View>
          )}
          dataPointLabelShiftY={-25}
          dataPointLabelShiftX={0}
          hideYAxisText={false}
        />
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
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  chartWrapper: {},
  noDataText: {
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 40,
  },
});
