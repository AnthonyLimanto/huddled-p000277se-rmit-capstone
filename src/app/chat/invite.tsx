import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchUsers } from '@/src/api/users';
import { addGroupMembers } from '@/src/api/group';

export default function InviteToGroupScreen() {
  const { groupId } = useLocalSearchParams();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const allUsers = await fetchUsers();
        setUsers(allUsers);
      } catch (error) {
        Alert.alert('Failed to load users');
      }
    };
    loadUsers();
  }, []);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleInvite = async () => {
    if (selected.length === 0) return;

    try {
      await addGroupMembers(groupId as string, selected);
      Alert.alert('Users added to group');
      router.back(); // Go back to chat
    } catch (error) {
      Alert.alert('Error adding users');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Invite Users</Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item.user_id || item.id}
        renderItem={({ item }) => {
          const isSelected = selected.includes(item.user_id || item.id);
          return (
            <TouchableOpacity
              style={styles.userRow}
              onPress={() => toggleSelect(item.user_id || item.id)}
            >
              <Ionicons
                name={isSelected ? 'checkbox' : 'square-outline'}
                size={24}
                color="#007aff"
              />
              <Text style={styles.username}>{item.username}</Text>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity style={styles.inviteButton} onPress={handleInvite}>
        <Text style={styles.inviteText}>Add to Group</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  username: { fontSize: 16, marginLeft: 12 },
  inviteButton: {
    marginTop: 20,
    backgroundColor: '#007aff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  inviteText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
