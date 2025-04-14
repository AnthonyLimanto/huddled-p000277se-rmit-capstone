import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const MOCK_USERS = [
  { id: 'u1', name: 'Jovie' },
  { id: 'u2', name: 'Nicholas' },
  { id: 'u3', name: 'Anthony' },
  { id: 'u4', name: 'Yulun' },
];

export default function NewMessageScreen() {
  const router = useRouter();

  const handleStartChat = (userId: string) => {
    // For now just use userId to simulate a chat ID
    router.push(`/chat/${userId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>New Message</Text>

      <FlatList
        data={MOCK_USERS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.userItem} onPress={() => handleStartChat(item.id)}>
            <Ionicons name="person-circle-outline" size={32} color="#444" />
            <Text style={styles.userName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  userName: {
    fontSize: 16,
    marginLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#EEE',
  },
});
