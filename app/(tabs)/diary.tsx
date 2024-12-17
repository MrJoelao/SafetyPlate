import { StyleSheet, View, SafeAreaView, Dimensions, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { useState } from 'react';
import { Calendar } from '@/components/ui/Calendar';
import { TimeSlots } from '@/components/ui/TimeSlots';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { ThemedText } from '@/components/ThemedText';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { MealTypeMenu } from '@/components/ui/MealTypeMenu';
import { MealEntryModal } from '@/components/ui/MealEntryModal';

export default function DiaryScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('');

  const handleMealSelect = (mealType: string) => {
    setSelectedMealType(mealType);
    setIsMenuOpen(false);
    setIsModalVisible(true);
  };

  const handleSaveMeal = (mealData: any) => {
    console.log('Salvataggio pasto:', { type: selectedMealType, ...mealData });
    // Qui implementeremo la logica per salvare il pasto
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <FontAwesome name="bookmark" size={24} color="#000" />
            <ThemedText style={styles.title}>Diary</ThemedText>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <MaterialIcons name="search" size={24} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <MaterialIcons name="more-vert" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.stickyHeader}>
          <Calendar 
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </View>
        
        <View style={styles.scrollableContent}>
          <TimeSlots textColor="#000" />
        </View>
        
        <View style={styles.fabContainer}>
          <MealTypeMenu 
            visible={isMenuOpen}
            onSelect={handleMealSelect}
            onClose={() => setIsMenuOpen(false)}
          />
          <FloatingActionButton 
            onPress={() => setIsMenuOpen(!isMenuOpen)}
            isOpen={isMenuOpen}
          />
        </View>

        <MealEntryModal
          visible={isModalVisible}
          mealType={selectedMealType}
          onClose={() => setIsModalVisible(false)}
          onSave={handleSaveMeal}
        />
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
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: width * 0.05,
    paddingTop: Platform.OS === 'ios' ? height * 0.05 : STATUSBAR_HEIGHT + height * 0.02,
    paddingBottom: height * 0.01,
    backgroundColor: '#fff',
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: Platform.OS === 'ios' ? 80 : 70,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 2,
    height: 36,
  },
  title: {
    fontSize: Math.min(26, width * 0.065),
    fontWeight: '600',
    color: '#000',
    letterSpacing: 0.5,
    lineHeight: 30,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickyHeader: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    zIndex: 1,
    marginTop: -4,
  },
  scrollableContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fabContainer: {
    position: 'absolute',
    right: width * 0.05,
    bottom: BOTTOM_TAB_HEIGHT + 16,
    zIndex: 2,
    alignItems: 'flex-end',
  },
});