import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor'; // Importato

interface QuickAddSectionProps {
  onAddWater: () => void;
  onOpenSnackModal: () => void; // Modificato per aprire il modale
}

export const QuickAddSection: React.FC<QuickAddSectionProps> = ({
  onAddWater,
  onOpenSnackModal,
}) => {
  const themedBackgroundColor = useThemeColor({}, 'background');
  const themedTextColor = useThemeColor({}, 'text');
  const themedButtonBackgroundColor = useThemeColor({ light: '#f0f0f0', dark: '#2c2c2e' }, 'background');
  const themedIconColorWater = useThemeColor({ light: '#3498db', dark: '#5dade2' }, 'tint'); // Blu per acqua
  const themedIconColorSnack = useThemeColor({ light: '#27ae60', dark: '#2ecc71' }, 'tint'); // Verde per spuntino (o un altro colore del tema)


  return (
    <View style={[styles.container, { backgroundColor: themedBackgroundColor }]}>
      <Text style={[styles.title, { color: themedTextColor }]}>Aggiungi Rapido</Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={[styles.button, { backgroundColor: themedButtonBackgroundColor }]} onPress={onAddWater}>
          <MaterialCommunityIcons name="cup-water" size={26} color={themedIconColorWater} />
          <Text style={[styles.buttonText, { color: themedTextColor }]}>Acqua</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: themedButtonBackgroundColor }]} onPress={onOpenSnackModal}>
          <MaterialIcons name="fastfood" size={26} color={themedIconColorSnack} />
          <Text style={[styles.buttonText, { color: themedTextColor }]}>Spuntino</Text>
        </TouchableOpacity>
        {/* Aggiungere altri pulsanti rapidi se necessario */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor: '#FFFFFF', // Rimosso
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18, // Leggermente ridotto
    fontWeight: '600',
    // color: '#2c3e50', // Rimosso
    marginBottom: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  button: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    // backgroundColor: '#f8f9fa', // Rimosso
    borderRadius: 12,
    minWidth: 100,
    flex: 1,
    maxWidth: 150,
  },
  buttonText: {
    marginTop: 8,
    fontSize: 14,
    // color: '#34495e', // Rimosso
    fontWeight: '500',
  },
});