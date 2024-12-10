import { StyleSheet, View, SafeAreaView, Dimensions, Platform, StatusBar } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { useState } from 'react';
import { Calendar } from '@/components/ui/Calendar';
import { TimeSlots } from '@/components/ui/TimeSlots';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { ThemedText } from '@/components/ThemedText';

export default function DiaryScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={[styles.title, { color: '#000' }]}>Diary</ThemedText>
        </View>

        <View style={styles.calendarContainer}>
          <Calendar 
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </View>
        
        <View style={styles.timeSlotsWrapper}>
          <TimeSlots textColor="#000" />
        </View>
        
        <FloatingActionButton 
          onPress={() => {
            console.log('Aggiungi nuova attività');
          }} 
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get('window');
const STATUSBAR_HEIGHT = StatusBar.currentHeight || 0;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: width * 0.05,
    paddingTop: Platform.OS === 'ios' ? height * 0.06 : STATUSBAR_HEIGHT + height * 0.04,
    paddingBottom: height * 0.02,
    backgroundColor: '#fff',
    marginBottom: height * 0.01,
  },
  title: {
    fontSize: Math.min(32, width * 0.08),
    fontWeight: 'bold',
    lineHeight: 40,
  },
  calendarContainer: {
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.02,
    backgroundColor: '#fff',
    maxHeight: height * 0.35,
  },
  timeSlotsWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: height * 0.02,
  },
});