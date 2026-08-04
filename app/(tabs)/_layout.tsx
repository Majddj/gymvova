import React from 'react';
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../../src/shared/constants/theme';

export default function TabsLayout() {


  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        sceneStyle: {
          backgroundColor: COLORS.background,
        },

        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          marginHorizontal: 12,

          height: 72,
          backgroundColor: COLORS.surface,

          borderRadius: 36,
          borderWidth: 1,
          borderTopWidth: 1,
          borderColor: COLORS.border,
          borderTopColor: COLORS.border,

          paddingTop: 7,
          paddingBottom: 7,

          shadowColor: '#000000',
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.3,
          shadowRadius: 10,

          elevation: 10,
        },

        tabBarItemStyle: {
          paddingTop: 3,
          paddingBottom: 3,
        },

        tabBarLabelStyle: {
          fontSize: 9,
          marginBottom: 2,
        },

        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,

        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Главная',
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="home"
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Упражнения',
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="fitness"
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="goals"
        options={{
          title: 'Цели',
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="flag"
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: 'История',
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="time"
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}