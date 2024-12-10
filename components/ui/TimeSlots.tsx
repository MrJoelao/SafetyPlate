import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '../ThemedText';
import { MaterialIcons } from '@expo/vector-icons';

interface TimeSlot {
  time: string;
  activities?: {
    id: string;
    title: string;
    type: 'meal' | 'activity' | 'note';
    color?: string;
  }[];
}

const timeSlots: TimeSlot[] = Array.from({ length: 24 }, (_, i) => ({
  time: `${i.toString().padStart(2, '0')}:00`,
}));

interface TimeSlotsProps {
  textColor?: string;
}

export const TimeSlots: React.FC<TimeSlotsProps> = ({ textColor = '#000' }) => {
  // Esempio di dati
  const mockActivities: TimeSlot[] = [
    {
      time: '08:00',
      activities: [{
        id: '1',
        title: 'Colazione',
        type: 'meal',
        color: '#4CAF50'
      }]
    },
    // ... altri slot
  ];

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {timeSlots.map((slot, index) => (
        <View key={index} style={styles.timeSlot}>
          <View style={styles.timeContainer}>
            <ThemedText style={[styles.timeText, { color: textColor }]}>
              {slot.time}
            </ThemedText>
          </View>
          
          <View style={styles.contentContainer}>
            {slot.activities?.map(activity => (
              <View 
                key={activity.id} 
                style={[styles.activity, { backgroundColor: activity.color }]}
              >
                <ThemedText style={styles.activityTitle}>
                  {activity.title}
                </ThemedText>
                {activity.type === 'meal' && (
                  <MaterialIcons name="restaurant" size={20} color="#FFF" />
                )}
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  timeSlot: {
    flexDirection: 'row',
    minHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  timeContainer: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  slotTitle: {
    fontSize: 16,
  },
  emptySlot: {
    flex: 1,
    height: '100%',
  },
  activity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  activityTitle: {
    color: '#FFF',
    fontWeight: '500',
  },
}); 