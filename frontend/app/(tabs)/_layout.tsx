// app/(tabs)/_layout.tsx  эсвэл TabLayout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, Text } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FaHistory } from "react-icons/fa";
import { AiOutlineProfile } from "react-icons/ai";
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const tint = Colors[colorScheme].tint;
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: tint,
        tabBarInactiveTintColor: '#94a3b8',
        tabBarShowLabel: true,
        tabBarStyle: {
          position: 'absolute',
          bottom: 20 + insets.bottom / 2, // iPhone notch-д зөв байрлана
          left: 20,
          right: 20,
          height: 76,
          borderRadius: 38,
          backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.92)' : '#ffffff',
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.12,
          shadowRadius: 20,
          paddingHorizontal: 10,
          paddingBottom: 0,
          paddingTop: 10,
          backdropFilter: 'blur(20px)', // iOS эффект
        },
        tabBarItemStyle: {
          borderRadius: 30,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      {/* Нүүр */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Нүүр',
          tabBarIcon: ({ focused, color }) => (
            <IconSymbol
              name="house.fill"
              size={focused ? 32 : 26}
              color={focused ? tint : '#94a3b8'}
              style={{ marginTop: focused ? -10 : 0 }}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{ color: focused ? tint : '#94a3b8', fontWeight: focused ? '700' : '500', fontSize: 11 }}>
              Нүүр
            </Text>
          ),
        }}
      />

      {/* Түүх */}
      <Tabs.Screen
        name="history"
        options={{
          title: 'Түүх',
          tabBarIcon: ({ focused, color }) => (
            <FaHistory
              name="clock.fill"
              size={focused ? 32 : 26}
              color={focused ? tint : '#94a3b8'}
              style={{ marginTop: focused ? -10 : 0 }}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{ color: focused ? tint : '#94a3b8', fontWeight: focused ? '700' : '500', fontSize: 11 }}>
              Түүх
            </Text>
          ),
        }}
      />

      {/* Профайл */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профайл',
          tabBarIcon: ({ focused, color }) => (
            <AiOutlineProfile 
              name="person.fill"
              size={focused ? 32 : 26}
              color={focused ? tint : '#94a3b8'}
              style={{ marginTop: focused ? -10 : 0 }}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{ color: focused ? tint : '#94a3b8', fontWeight: focused ? '700' : '500', fontSize: 11 }}>
              Профайл
            </Text>
          ),
        }}
      />
    </Tabs>
  );
}