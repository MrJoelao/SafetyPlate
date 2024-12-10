import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface FABProps {
  onPress: () => void;
}

export const FloatingActionButton: React.FC<FABProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
      <MaterialIcons name="add" size={24} color="#FFFFFF" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 28,
    elevation: 8,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.25)',
  },
});