import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/shared/constants/theme';
import { Platform } from 'react-native';

export default function TabsLayout() {
    // Инициализируем Telegram при старте приложения в вебе
  useEffect(() => {
    if (Platform.OS === 'web') {
      const tg = (global as any).window?.Telegram?.WebApp;
      if (tg) {
        tg.ready();  // Сообщаем ТГ, что мини-апп загрузился
        tg.expand(); // Раскрываем мини-апп на всю высоту экрана телефона
        console.log("Приложение успешно запущено внутри Telegram Web App!");
      }
    }
  }, []);


  return (
        <Tabs
        screenOptions={{
          headerShown: false,
        
          sceneStyle: {
            backgroundColor: COLORS.background,
          },
        
          tabBarStyle: {
            position: 'absolute',

            marginHorizontal: 20,
          
            left: 26,
            right: 26,
            bottom: 22,
          
            height: 64,
            backgroundColor: COLORS.surface,
          
            borderRadius: 32,
            borderWidth: 1,
            borderColor: COLORS.border,
            borderTopWidth: 1,
          
            paddingTop: 6,
            paddingBottom: 6,
          
            shadowColor: '#000000',
            shadowOffset: {
              width: 0,
              height: 6,
            },
            shadowOpacity: 0.3,
            shadowRadius: 10,
          
            elevation: 10,
          },
        
          tabBarItemStyle: {
            borderRadius: 24,
            paddingVertical: 3,
          },
        
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textMuted,
        
          tabBarLabelStyle: {
            fontSize: 11,
          },
        
          tabBarHideOnKeyboard: true,
        }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Главная',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Упражнения',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="fitness" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Цели',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flag" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'История',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
