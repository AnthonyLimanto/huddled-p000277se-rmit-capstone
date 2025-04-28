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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchUsers } from '@/src/api/users';
import { addGroupMembers, fetchGroupMembers } from '@/src/api/group';



export default function InviteToGroupScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const params = useLocalSearchParams();
  console.log(params);  

  // ✅ Load all users from Supabase
  useEffect(() => {
    const loadUsers = async () => {
      try {
        // Fetch all users
        const allUsers = await fetchUsers();
    
        // Fetch users already in the group
        const groupMembers = await fetchGroupMembers(params.groupId); // Replace with your API to fetch group members
    
        // Filter out users who are already in the group
        const filteredUsers = allUsers.filter(
          (user) => !groupMembers.some((member) => member.user_id === user.user_id)
        );
    
        setUsers(filteredUsers);
      } catch (error) {
        Alert.alert('Failed to load users');
        console.error('Fetch users error:', error);
      }
    };
    loadUsers();
  }, []);

  // ✅ Select or deselect a user
  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  // ✅ Add selected users to group
  const handleInvite = async () => {
    if (selected.length === 0) return;

    try {
      const group = await addGroupMembers(params.groupId, selected); // Use groupId from props
      Alert.alert('Users added to group');
      router.back();
    } catch (error: any) {
      console.error('Error adding group members:', params.groupId);
      Alert.alert('Error adding users', error.message || 'Something went wrong');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔙 Back + Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007aff" />
        </TouchableOpacity>
        <Text style={styles.title}>Invite Users</Text>
      </View>

      {/* 👥 User list */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.user_id || item.id}
        renderItem={({ item }) => {
          const userId = item.user_id || item.id;
          const isSelected = selected.includes(userId);

          return (
            <TouchableOpacity
              style={styles.userRow}
              onPress={() => toggleSelect(userId)}
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

      {/* ➕ Invite button */}
      <TouchableOpacity style={styles.inviteButton} onPress={handleInvite}>
        <Text style={styles.inviteText}>Add to Group</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 12,
  },
  title: { fontSize: 22, fontWeight: 'bold' },
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