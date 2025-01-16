import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform, StatusBar } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons, Entypo } from '@expo/vector-icons';

export const PlannerHeader = () => {
  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Entypo name="calendar" size={24} color="#000" />
        <ThemedText style={styles.title}>Planner</ThemedText>
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
  );
};

const { width, height } = Dimensions.get('window');
const STATUSBAR_HEIGHT = StatusBar.currentHeight || 0;

const styles = StyleSheet.create({
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
}); 