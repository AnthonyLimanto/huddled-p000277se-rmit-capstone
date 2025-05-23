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
import { fetchUsers, getSessionUser } from '@/src/api/users';

export default function NewGroupScreen() {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const user = await getSessionUser();
        const fetchedUsers = await fetchUsers();

        if (!Array.isArray(fetchedUsers)) {
          throw new Error('Invalid user data received');
        }

        const filteredUsers = fetchedUsers.filter((u) => u.user_id !== user.id);
        setUsers(filteredUsers);
        setCurrentUser(user);
        setSelectedUsers([user.id]);
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
      Alert.alert('Select at least one additional user');
      return;
    }

    try {
      const result = await createGroup(groupName, selectedUsers);

      if (!result?.group?.id) {
        throw new Error('Group creation failed');
      }

      // ✅ Redirect to the Groups tab
      router.replace({ pathname: '/messages', params: { tab: 'Groups' } });
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
      {/* 🔙 Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#085DB7" />
        </TouchableOpacity>
        <Text style={styles.title}>Create New Group</Text>
        {/* Invisible spacer to balance center */}
        <View style={{ width: 28 }} />
      </View>

      <TextInput
        placeholder="Insert Group Name Here"
        style={styles.input}
        value={groupName}
        onChangeText={setGroupName}
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Add members:</Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item.user_id || item.id}
        renderItem={({ item }) => {
          const userId = item.user_id || item.id;
          const isSelected = selectedUsers.includes(userId);

          return (
            <View style={styles.userBox}>
              {/* Avatar */}
              <View style={styles.avatar} />

              {/* Name and subtitle */}
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.full_name || item.username}</Text>
                <Text style={styles.userSub}>{item.subtitle || 'Master of IT'}</Text>
              </View>

              {/* Add button */}
              <TouchableOpacity
                style={[
                  styles.addBtn,
                  isSelected && styles.addedBtn
                ]}
                onPress={() => toggleUser(userId)}
              >
                <Text style={styles.addBtnText}>
                  {isSelected ? 'Added' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 24 }}
      />

      <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup}>
        <Text style={styles.buttonText}>Create Group</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 10,
  },
  backButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#085DB7',
    flex: 1,
    textAlign: 'center',
  },
  input: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#F0F9FF',
    marginHorizontal: 22,
    color: '#222',
    borderWidth: 1,
    borderColor: '#0066CC',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 18,
    marginLeft: 24,
    fontSize: 18,
    color: '#085DB7',
  },

  // --- USER BOX DESIGN ---
  userBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    marginBottom: 18,
    padding: 16,
    marginHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D9D9D9',
    marginRight: 18,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#222',
    marginBottom: 2,
  },
  userSub: {
    color: '#222',
    fontSize: 14,
    opacity: 0.7,
  },
  addBtn: {
    backgroundColor: '#085DB7',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addedBtn: {
    backgroundColor: '#7db5f8',
  },
  addBtnText: {
    color: '#FFF',
    fontWeight: '500',
    fontSize: 16,
  },
  createButton: {
    marginTop: 14,
    backgroundColor: '#1357DA',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 22,
  },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
