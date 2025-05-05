// Schermata tutorial 2 (placeholder)

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export default function Tutorial2() {
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
        Animated.timing(float1, { toValue: 12, duration: 1700, useNativeDriver: true }),
        Animated.timing(float1, { toValue: 0, duration: 1700, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(float2, { toValue: -16, duration: 2100, useNativeDriver: true }),
        Animated.timing(float2, { toValue: 0, duration: 2100, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.15, duration: 1200, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(fade, { toValue: 0.5, duration: 1100, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 1100, useNativeDriver: true }),
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
  const iconColor = Colors.light.tabIconDefault;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Pulsante indietro in alto a sinistra (dentro SafeArea) */}
      <View style={styles.header}>
        <Button
          mode="text"
          onPress={() => router.back()}
          style={styles.backButton}
          labelStyle={{ color: Colors.light.tabIconDefault, fontSize: 22, marginHorizontal: 0 }}
          contentStyle={styles.backButtonContent}
          accessibilityLabel="Torna indietro"
          icon="arrow-left"
        >
          {""}
        </Button>
      </View>

      {/* Contenuto principale centrato */}
      <View style={styles.content}>
        {/* Decorazioni dolci/snack, posizioni e animazioni diverse */}
        <Animated.View style={[styles.foodIcon, { top: 30, left: 100, transform: [{ scale }], opacity: fade }]}>
          <MaterialCommunityIcons name="cupcake" size={34} color="#BA68C8" />
        </Animated.View>
        <Animated.View style={[styles.foodIcon, { top: 160, right: 20, transform: [{ translateY: float1 }] }]}>
          <MaterialCommunityIcons name="ice-cream" size={32} color="#B2EBF2" />
        </Animated.View>
        <Animated.View style={[styles.foodIcon, { bottom: 60, left: 40, transform: [{ translateY: float2 }] }]}>
          <MaterialCommunityIcons name="cookie" size={36} color="#A1887F" />
        </Animated.View>
        <Animated.View style={[styles.foodIcon, { bottom: 120, right: 40, transform: [{ scale }] }]}>
          <MaterialCommunityIcons name="candy" size={28} color="#F06292" />
        </Animated.View>
        <Animated.View
          style={[
            styles.foodIcon,
            {
              top: 80,
              left: 20,
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
          <MaterialCommunityIcons name="popcorn" size={28} color="#FFD54F" />
        </Animated.View>
        <Animated.View
          style={[
            styles.foodIcon,
            {
              bottom: 40,
              right: 80,
              transform: [
                {
                  rotate: rotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
              opacity: fade,
            },
          ]}
        >
          <MaterialCommunityIcons name="pretzel" size={28} color="#A1887F" />
        </Animated.View>
        <MaterialCommunityIcons
          name="gesture-tap-button"
          size={64}
          color={iconColor}
          style={styles.icon}
        />
        <Text variant="headlineMedium" style={styles.title}>
          Tutorial: Personalizza la tua esperienza
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Qui potrai aggiungere altre informazioni utili per l’utente.
        </Text>
        <Button
          mode="contained"
          onPress={() => router.push('./PlannerSetup')}
          style={styles.button}
          labelStyle={styles.buttonLabel}
          contentStyle={styles.buttonContent}
          accessibilityLabel="Vai alla configurazione planner"
          icon="arrow-right"
        >
          Continua
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 50, // Altezza per contenere il pulsante
    width: '100%',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backButton: {
    minWidth: 0,
    width: 38,
    height: 38,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonContent: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    paddingTop: 0, // Rimuove padding superiore per compensare header
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
    minWidth: 140,
    paddingVertical: 2,
    backgroundColor: Colors.light.tabIconDefault,
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