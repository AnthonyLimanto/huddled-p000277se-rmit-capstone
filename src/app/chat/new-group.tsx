import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createGroup } from '@/src/api/group';
import { fetchUsers } from '@/src/api/users'; // Replace with your actual API for fetching users

export default function NewGroupScreen() {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch users dynamically
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const fetchedUsers = await fetchUsers(); // Replace with your actual API call
  
        // Validate the response
        if (!Array.isArray(fetchedUsers)) {
          throw new Error('Invalid user data received');
        }
  
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        Alert.alert('Failed to load users', error.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
  
    loadUsers();
  }, []);

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

      // Navigate to the new group chat
      router.push(`/chat/${result.group.id}`);
    } catch (error: any) {
      console.error('Group creation error:', error);
      Alert.alert('Failed to create group', error.message || 'Something went wrong');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#1357DA" />
      </SafeAreaView>
    );
  }

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

      {/* 👥 User list */}
        <FlatList
          data={users}
          keyExtractor={(item) => item.user_id || item.id}
          renderItem={({ item }) => {
            const userId = item.user_id || item.id;
            const isSelected = selectedUsers.includes(userId);
  
            return (
              <TouchableOpacity
                style={styles.userRow}
                onPress={() => toggleUser(userId)}
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