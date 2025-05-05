// Schermata di configurazione planner per onboarding

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
const { width } = Dimensions.get('window');

export default function PlannerSetup() {
  const router = useRouter();
  const theme = useTheme();
  // Animazioni per le icone decorative (variegate)
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float1, { toValue: -16, duration: 1600, useNativeDriver: true }),
        Animated.timing(float1, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(float2, { toValue: 18, duration: 2100, useNativeDriver: true }),
        Animated.timing(float2, { toValue: 0, duration: 2100, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(float3, { toValue: -12, duration: 1200, useNativeDriver: true }),
        Animated.timing(float3, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotate, { toValue: 1, duration: 3200, useNativeDriver: true }),
        Animated.timing(rotate, { toValue: 0, duration: 3200, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.25, duration: 1400, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 1400, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(fade, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Colori decorativi
  const iconColor = Colors.light.tint;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Pulsante indietro in alto a sinistra (dentro SafeArea) */}
      <View style={styles.header}>
        <Button
          mode="text"
          onPress={() => router.back()}
          style={styles.backButton}
          labelStyle={{ color: Colors.light.tint, fontSize: 22, marginHorizontal: 0 }}
          contentStyle={styles.backButtonContent}
          accessibilityLabel="Torna indietro"
          icon="arrow-left"
        >
          {""}
        </Button>
      </View>

      {/* Contenuto principale centrato */}
      <View style={styles.content}>
        {/* Decorazioni piatti principali, posizioni e animazioni diverse */}
        <Animated.View style={[styles.foodIcon, { top: 30, left: 30, transform: [{ scale }], opacity: fade }]}>
          <MaterialCommunityIcons name="pizza" size={38} color="#FFA726" />
        </Animated.View>
        <Animated.View style={[styles.foodIcon, { top: 160, right: 50, transform: [{ translateY: float1 }] }]}>
          <MaterialCommunityIcons name="rice" size={32} color="#FFF9C4" />
        </Animated.View>
        <Animated.View style={[styles.foodIcon, { bottom: 60, left: 90, transform: [{ translateY: float2 }] }]}>
          <MaterialCommunityIcons name="fish" size={36} color="#4FC3F7" />
        </Animated.View>
        <Animated.View style={[styles.foodIcon, { bottom: 120, right: 30, transform: [{ scale }] }]}>
          <MaterialCommunityIcons name="noodles" size={28} color="#FFD54F" />
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
          <MaterialCommunityIcons name="food-variant" size={28} color="#81C784" />
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
          <MaterialCommunityIcons name="hamburger" size={28} color="#FFB300" />
        </Animated.View>
        <MaterialCommunityIcons
          name="calendar-check"
          size={70}
          color={iconColor}
          style={styles.icon}
        />
        <Text variant="headlineLarge" style={styles.title}>
          Configura il tuo Planner
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Inserisci gli alimenti che consumi abitualmente e pianifica la tua dieta settimanale o mensile.
          Puoi aggiungere alimenti, impostare i pasti e organizzare il tuo piano alimentare direttamente dal Planner.
        </Text>
        <Button
          mode="contained"
          onPress={async () => {
            await AsyncStorage.setItem('onboardingCompleted', 'true');
            router.replace('../(tabs)/Planner');
          }}
          style={styles.button}
          labelStyle={styles.buttonLabel}
          contentStyle={styles.buttonContent}
          accessibilityLabel="Termina onboarding"
          icon="check"
        >
          Completa
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
  circle: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    opacity: 0.16,
    zIndex: 0,
  },
  badge: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    opacity: 0.22,
    zIndex: 0,
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