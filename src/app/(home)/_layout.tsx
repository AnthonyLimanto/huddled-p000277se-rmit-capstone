import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0066CC',
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarAccessibilityLabel: "Home Tab",
          tabBarIcon: ({ color, size }) => <Ionicons testID="home-icon" name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarAccessibilityLabel: "Search Tab",
          tabBarIcon: ({ color, size }) => <Ionicons testID="search-icon" name="search" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Post',
          tabBarAccessibilityLabel: "Create Post Tab",
          tabBarIcon: ({ color, size }) => <Ionicons testID="create-icon" name="add-circle" size={size + 4} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarAccessibilityLabel: "Messages Tab",
          tabBarIcon: ({ color, size }) => <Ionicons testID="messages-icon" name="chatbubble" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarAccessibilityLabel: "Profile Tab",
          tabBarIcon: ({ color, size }) => <Ionicons testID="profile-icon" name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}