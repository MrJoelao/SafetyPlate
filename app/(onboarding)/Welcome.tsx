// Schermata di benvenuto per l'onboarding

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export default function Welcome() {
  const router = useRouter();
  const theme = useTheme();

  // Animazioni per le icone decorative (variegate)
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const fade = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float1, { toValue: 14, duration: 1700, useNativeDriver: true }),
        Animated.timing(float1, { toValue: 0, duration: 1700, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(float2, { toValue: -12, duration: 2100, useNativeDriver: true }),
        Animated.timing(float2, { toValue: 0, duration: 2100, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.18, duration: 1400, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 1400, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(fade, { toValue: 0.5, duration: 1200, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotate, { toValue: 1, duration: 3200, useNativeDriver: true }),
        Animated.timing(rotate, { toValue: 0, duration: 3200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Colori icona
  const iconColor = Colors.light.tint;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Decorazioni solo frutta, posizioni uniche */}
      <Animated.View style={[styles.foodIcon, { top: 18, left: 24, transform: [{ scale }], opacity: fade }]}>
        <MaterialCommunityIcons name="food-apple" size={38} color="#E57373" />
      </Animated.View>
      <Animated.View style={[styles.foodIcon, { top: 40, right: 60, transform: [{ translateY: float1 }] }]}>
        <MaterialCommunityIcons name="fruit-cherries" size={32} color="#D32F2F" />
      </Animated.View>
      <Animated.View style={[styles.foodIcon, { bottom: 30, left: 90, transform: [{ translateY: float2 }] }]}>
        <MaterialCommunityIcons name="fruit-pineapple" size={36} color="#FBC02D" />
      </Animated.View>
      <Animated.View style={[styles.foodIcon, { bottom: 100, right: 40, transform: [{ scale }] }]}>
        <MaterialCommunityIcons name="fruit-watermelon" size={30} color="#388E3C" />
      </Animated.View>
      <Animated.View
        style={[
          styles.foodIcon,
          {
            top: 180,
            left: 10,
            transform: [
              {
                rotate: rotate.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '-360deg'],
                }),
              },
            ],
            opacity: fade,
          },
        ]}
      >
        <MaterialCommunityIcons name="fruit-grapes" size={28} color="#7B1FA2" />
      </Animated.View>
      <MaterialCommunityIcons
        name="food-apple"
        size={72}
        color={iconColor}
        style={styles.icon}
      />
      <Text variant="headlineLarge" style={styles.title}>
        Benvenuto su SafetyPlate!
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        L'app che ti aiuta a gestire la tua alimentazione in modo sicuro e consapevole.
      </Text>
      <Button
        mode="contained"
        onPress={() => router.push('./Tutorial1')}
        style={styles.button}
        labelStyle={styles.buttonLabel}
        contentStyle={styles.buttonContent}
        accessibilityLabel="Vai al tutorial"
        icon="arrow-right"
      >
        Avanti
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 18,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 36,
    color: '#666',
    maxWidth: 400,
    fontSize: 17,
    lineHeight: 24,
  },
  button: {
    borderRadius: 32,
    elevation: 2,
    minWidth: 180,
    paddingVertical: 2,
    backgroundColor: Colors.light.tint,
    marginTop: 8,
    marginBottom: 8,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    color: '#fff',
  },
  buttonContent: {
    height: 48,
  },
  foodIcon: {
    position: 'absolute',
    zIndex: 0,
    opacity: 0.85,
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 6,
    elevation: 2,
  },
});