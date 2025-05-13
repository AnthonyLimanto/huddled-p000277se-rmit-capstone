import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createGroup } from '@/src/api/group';

const MOCK_USERS = [
  { id: 'u1', name: 'Jovie AU' },
  { id: 'u2', name: 'Shannon' },
  { id: 'u3', name: 'Michael AU' },
  { id: 'u4', name: 'Felix AU' },
];

export default function NewGroupScreen() {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const toggleUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Enter group name');
      return;
    }

    if (selectedUsers.length < 2) {
      Alert.alert('Select at least 2 users');
      return;
    }
    try {
      const result = await createGroup(groupName, selectedUsers);

      if (!result?.group?.id) {
        throw new Error('Group creation failed');
      }

      // ✅ Use real UUID from Supabase
      router.push(`/chat/${result.group.id}`);
    } catch (error: any) {
      console.error('Group creation error:', error);
      Alert.alert('Failed to create group', error.message || 'Something went wrong');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Create New Group</Text>

      <TextInput
        placeholder="Group name"
        style={styles.input}
        value={groupName}
        onChangeText={setGroupName}
      />

      <Text style={styles.label}>Add members:</Text>

      <FlatList
        data={MOCK_USERS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const selected = selectedUsers.includes(item.id);
          return (
            <TouchableOpacity style={styles.userRow} onPress={() => toggleUser(item.id)}>
              <Ionicons
                name={selected ? 'checkbox' : 'square-outline'}
                size={24}
                color="#1357DA"
              />
              <Text style={styles.userName}>{item.name}</Text>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup}>
        <Text style={styles.buttonText}>Create Group</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  label: { fontWeight: 'bold', marginBottom: 8 },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  userName: { fontSize: 16, marginLeft: 10 },
  createButton: {
    marginTop: 24,
    backgroundColor: '#1357DA',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
