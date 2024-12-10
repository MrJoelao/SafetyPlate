import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { ThemedText } from '../ThemedText';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const { width } = Dimensions.get('window');
const DATE_ITEM_WIDTH = width * 0.11; // Ridotto da 0.15 a 0.13 per far entrare più date
const HORIZONTAL_SPACING = 7; // Spazio tra le date
const ARROW_BUTTON_SIZE = 40; // Dimensione del cerchio per i pulsanti

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
        <TouchableOpacity 
          style={[styles.arrowButton, styles.arrowButtonCircle]}
        >
          <MaterialIcons name="chevron-left" size={24} color="#000" />
        </TouchableOpacity>
        
        <ThemedText style={[styles.monthText, { color: '#000' }]}>
          {format(selectedDate, 'MMMM yyyy', { locale: it })}
        </ThemedText>
        
        <TouchableOpacity 
          style={[styles.arrowButton, styles.arrowButtonCircle]}
        >
          <MaterialIcons name="chevron-right" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.daysContainer}
        contentContainerStyle={styles.daysContentContainer}
        snapToInterval={DATE_ITEM_WIDTH + HORIZONTAL_SPACING} // Aggiunto snap per uno scrolling più fluido
        decelerationRate="fast"
      >
        {getDatesInMonth().map((date, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onDateSelect(date)}
            style={[
              styles.dateContainer,
              date.getDate() === selectedDate.getDate() && styles.selectedDate,
            ]}>
            <ThemedText style={[styles.dayName, { color: '#000' }]}>
              {format(date, 'EEE', { locale: it })}
            </ThemedText>
            <ThemedText 
              style={[
                styles.dateText,
                { color: date.getDate() === selectedDate.getDate() ? '#fff' : '#000' }
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
    paddingVertical: 15,
    borderRadius: 10,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0, // Ridotto il padding per avvicinare i pulsanti ai bordi
    marginBottom: 15,
  },
  arrowButton: {
    width: ARROW_BUTTON_SIZE,
    height: ARROW_BUTTON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowButtonCircle: {
    backgroundColor: '#f0f0f0',
    borderRadius: ARROW_BUTTON_SIZE / 2,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'capitalize',
    flex: 1, // Permette al testo di occupare lo spazio centrale
    textAlign: 'center', // Centra il testo
  },
  daysContainer: {
    flexDirection: 'row',
  },
  daysContentContainer: {
    paddingLeft: width * 0.05,
    paddingRight: width * 0.05 - HORIZONTAL_SPACING, // Compensiamo il marginRight dell'ultimo elemento
  },
  dateContainer: {
    width: DATE_ITEM_WIDTH,
    height: DATE_ITEM_WIDTH * 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: HORIZONTAL_SPACING,
    borderRadius: 12,
  },
  selectedDate: {
    backgroundColor: '#4CAF50',
  },
  dayName: {
    fontSize: 13,
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 20,
    fontWeight: '600',
  },
}); 