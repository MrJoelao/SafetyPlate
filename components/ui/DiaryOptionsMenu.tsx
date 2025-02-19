import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Animated, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons } from '@expo/vector-icons';

interface DiaryOptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  onImportPress: () => void;
  onSettingsPress: () => void;
}

export function DiaryOptionsMenu({ 
  visible, 
  onClose, 
  onImportPress,
  onSettingsPress 
}: DiaryOptionsMenuProps) {
  const scale = new Animated.Value(visible ? 1 : 0.95);
  const opacity = new Animated.Value(visible ? 1 : 0);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Pressable 
      style={styles.container} 
      onPress={onClose}
    >
      <Animated.View 
        style={[
          styles.menuContainer,
          {
            opacity,
            transform: [{ scale }],
          }
        ]}
      >
        <Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed
            ]}
            onPress={() => {
              onImportPress();
              onClose();
            }}
          >
            <View style={styles.menuItemContent}>
              <View style={[styles.iconContainer, { backgroundColor: '#e8f5e9' }]}>
                <MaterialIcons name="upload-file" size={18} color="#4CAF50" />
              </View>
              <ThemedText style={styles.menuText}>Importa Alimenti</ThemedText>
            </View>
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed
            ]}
            onPress={() => {
              onSettingsPress();
              onClose();
            }}
          >
            <View style={styles.menuItemContent}>
              <View style={[styles.iconContainer, { backgroundColor: '#f5f5f5' }]}>
                <MaterialIcons name="settings" size={18} color="#757575" />
              </View>
              <ThemedText style={styles.menuText}>Impostazioni</ThemedText>
            </View>
          </Pressable>
        </Pressable>
      </Animated.View>
    </Pressable>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    alignItems: 'flex-end',
  },
  menuContainer: {
    position: 'absolute',
    top: 65,
    right: width * 0.05,
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 200,
    paddingVertical: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    overflow: 'hidden',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuItem: {
    padding: 8,
    paddingHorizontal: 12,
  },
  menuItemPressed: {
    backgroundColor: '#f5f5f5',
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 14,
    color: '#1f1f1f',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 4,
  },
});
