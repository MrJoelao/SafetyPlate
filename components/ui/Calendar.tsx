import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '../ThemedText';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect }) => {
  // Genera un array di date per il mese corrente
  const getDatesInMonth = () => {
    const dates = [];
    const currentDate = new Date(selectedDate);
    currentDate.setDate(1); // Vai al primo del mese
    
    // Aggiungi date fino alla fine del mese
    while (currentDate.getMonth() === selectedDate.getMonth()) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.monthSelector}>
        <TouchableOpacity>
          <MaterialIcons name="chevron-left" size={30} color="#666" />
        </TouchableOpacity>
        <ThemedText style={styles.monthText}>
          {format(selectedDate, 'MMMM yyyy', { locale: it })}
        </ThemedText>
        <TouchableOpacity>
          <MaterialIcons name="chevron-right" size={30} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysContainer}>
        {getDatesInMonth().map((date, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onDateSelect(date)}
            style={[
              styles.dateContainer,
              date.getDate() === selectedDate.getDate() && styles.selectedDate,
            ]}>
            <ThemedText style={styles.dayName}>
              {format(date, 'EEE', { locale: it })}
            </ThemedText>
            <ThemedText 
              style={[
                styles.dateText,
                date.getDate() === selectedDate.getDate() && styles.selectedDateText
              ]}>
              {date.getDate()}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  daysContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  dateContainer: {
    width: 60,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 12,
  },
  selectedDate: {
    backgroundColor: '#4CAF50',
  },
  dayName: {
    fontSize: 13,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 20,
    fontWeight: '600',
  },
  selectedDateText: {
    color: '#fff',
  },
}); 