import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CustomTabBar } from '@/components/ui/CustomTabBar';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 100 : 80,
          paddingBottom: Platform.OS === 'ios' ? 20 : 0,
        }
      }}
      tabBar={(props) => <CustomTabBar {...props} />}>
      <Tabs.Screen
        name="diary"
        options={{
          title: 'Diary',
        }}
      />
      <Tabs.Screen
        name="Planner"
        options={{
          title: 'Planner',
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Saved',
        }}
      />
    </Tabs>
  );
}