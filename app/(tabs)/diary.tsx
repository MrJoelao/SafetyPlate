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
        
        <View style={styles.fabContainer}>
          <FloatingActionButton 
            onPress={() => {
              console.log('Aggiungi nuova attività');
            }} 
          />
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get('window');
const STATUSBAR_HEIGHT = StatusBar.currentHeight || 0;
const BOTTOM_TAB_HEIGHT = Platform.OS === 'ios' ? 100 : 80;

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
    paddingTop: Platform.OS === 'ios' ? height * 0.04 : STATUSBAR_HEIGHT + height * 0.02,
    paddingBottom: height * 0.01,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: Math.min(32, width * 0.08),
    fontWeight: 'bold',
    lineHeight: 36,
  },
  calendarContainer: {
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.01,
    backgroundColor: '#fff',
    maxHeight: height * 0.35,
  },
  timeSlotsWrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fabContainer: {
    position: 'absolute',
    right: width * 0.05,
    bottom: BOTTOM_TAB_HEIGHT + 5,
    zIndex: 1,
  },
});