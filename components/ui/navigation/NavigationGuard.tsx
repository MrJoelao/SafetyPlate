import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/common/ThemedText';

interface NavigationGuardProps {
  children: React.ReactNode;
  fallbackRoute: string;
  checkCondition: () => Promise<boolean>;
  loadingMessage?: string;
}

/**
 * A component that guards navigation to protected routes
 * If the condition is not met, redirects to the fallback route
 */
export function NavigationGuard({
  children,
  fallbackRoute,
  checkCondition,
  loadingMessage = 'Loading...',
}: NavigationGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    async function checkAccess() {
      try {
        setIsLoading(true);
        const allowed = await checkCondition();
        setIsAllowed(allowed);
        
        if (!allowed) {
          // Redirect to fallback route if condition is not met
          router.replace(fallbackRoute);
        }
      } catch (error) {
        console.error('Error checking access:', error);
        // On error, redirect to fallback route
        router.replace(fallbackRoute);
      } finally {
        setIsLoading(false);
      }
    }

    checkAccess();
  }, [checkCondition, fallbackRoute, router]);

  // Show loading indicator while checking
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <ThemedText style={styles.text}>{loadingMessage}</ThemedText>
      </View>
    );
  }

  // If allowed, render children
  return isAllowed ? <>{children}</> : null;
}

/**
 * A guard that checks if onboarding has been completed
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const checkOnboarding = async () => {
    try {
      const value = await AsyncStorage.getItem('onboardingCompleted');
      return value === 'true';
    } catch (e) {
      console.error('Error checking onboarding status:', e);
      return false;
    }
  };

  return (
    <NavigationGuard
      fallbackRoute="/(onboarding)/Welcome"
      checkCondition={checkOnboarding}
      loadingMessage="Checking onboarding status..."
    >
      {children}
    </NavigationGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
});