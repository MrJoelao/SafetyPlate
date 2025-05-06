import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useThemeColor } from '@/hooks/useThemeColor'; // Importato

// Definizione del tipo per uno spuntino
export interface QuickSnack {
  id: string;
  name: string;
  calories?: number; // Opzionale
  details?: string; // Es. "Mela media"
}

interface QuickSnackModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectSnack: (snack: QuickSnack) => void;
  favoriteSnacks: QuickSnack[]; // Lista di spuntini preferiti
}

export const QuickSnackModal: React.FC<QuickSnackModalProps> = ({
  visible,
  onClose,
  onSelectSnack,
  favoriteSnacks,
}) => {
  const themedBackgroundColor = useThemeColor({}, 'background');
  const themedTextColor = useThemeColor({}, 'text');
  const themedSecondaryTextColor = useThemeColor({light: '#7f8c8d', dark: '#95a5a6'}, 'text');
  const themedIconColor = useThemeColor({}, 'icon');
  const themedTintColor = useThemeColor({}, 'tint'); // Per accenti come calorie o icona spuntino
  const themedBorderColor = useThemeColor({light: '#eee', dark: '#39393c'}, 'icon');
  const themedItemIconBg = useThemeColor({light: '#e8f5e9', dark: `${themedTintColor}20`}, 'background');


  const renderSnackItem = ({ item }: { item: QuickSnack }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => {
      onSelectSnack(item);
      onClose();
    }}>
      <View style={[styles.itemIcon, {backgroundColor: themedItemIconBg}]}>
        <MaterialIcons name="fastfood" size={24} color={themedTintColor} />
      </View>
      <View style={styles.itemTextContainer}>
        <Text style={[styles.itemName, {color: themedTextColor}]}>{item.name}</Text>
        {item.details && <Text style={[styles.itemDetails, {color: themedSecondaryTextColor}]}>{item.details}</Text>}
      </View>
      {item.calories && <Text style={[styles.itemCalories, {color: themedTintColor}]}>{item.calories} kcal</Text>}
      <MaterialIcons name="chevron-right" size={24} color={themedIconColor} />
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <BlurView intensity={20} tint={useThemeColor({light: 'light', dark: 'dark'}, 'background') === '#fff' ? 'light' : 'dark'} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.modalContainer, {backgroundColor: themedBackgroundColor}]}>
          <View style={[styles.header, {borderBottomColor: themedBorderColor}]}>
            <Text style={[styles.headerTitle, {color: themedTextColor}]}>Scegli Spuntino</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={28} color={themedTextColor} />
            </TouchableOpacity>
          </View>

          {favoriteSnacks.length > 0 ? (
            <FlatList
              data={favoriteSnacks}
              renderItem={renderSnackItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContentContainer}
              ItemSeparatorComponent={() => <View style={[styles.separator, {backgroundColor: themedBorderColor}]} />}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="sentiment-dissatisfied" size={48} color={themedSecondaryTextColor} />
              <Text style={[styles.emptyText, {color: themedSecondaryTextColor}]}>Nessuno spuntino preferito.</Text>
              <Text style={[styles.emptySubText, {color: themedSecondaryTextColor}]}>Aggiungili dalle impostazioni.</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    // backgroundColor: '#ffffff', // Rimosso
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 5,
    maxHeight: '70%',
    shadowColor: '#000', // Manteniamo ombra per modale
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
    borderBottomWidth: 1,
    // borderBottomColor: '#eee', // Rimosso
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    // color: '#2c3e50', // Rimosso
  },
  closeButton: {
    padding: 5,
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    // borderBottomWidth: 1, // Rimosso, gestito da ItemSeparatorComponent
    // borderBottomColor: '#f0f0f0', // Rimosso
  },
  separator: {
    height: 1,
    // backgroundColor: '#f0f0f0', // Rimosso
    marginLeft: 20, // Allineamento con testo
    marginRight: 20,
  },
  itemIcon: {
    marginRight: 15,
    // backgroundColor: '#e8f5e9', // Rimosso
    padding: 8,
    borderRadius: 20,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 17,
    fontWeight: '500',
    // color: '#34495e', // Rimosso
  },
  itemDetails: {
    fontSize: 13,
    // color: '#7f8c8d', // Rimosso
    marginTop: 2,
  },
  itemCalories: {
    fontSize: 14,
    // color: '#27ae60', // Rimosso
    fontWeight: '500',
    marginHorizontal: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    // color: '#7f8c8d', // Rimosso
    marginTop: 15,
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: 14,
    // color: '#95a5a6', // Rimosso
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  }
});