// messages/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function MessagesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="messages" />
    </Stack>
  );
}