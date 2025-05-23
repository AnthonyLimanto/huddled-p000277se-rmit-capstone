import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const user = await getSessionUser();
        const fetchedUsers = await fetchUsers();

        if (!Array.isArray(fetchedUsers)) {
          throw new Error('Invalid user data received');
        }

        const filteredUsers = fetchedUsers.filter((u) => u.user_id !== user.id);

        // Alphabetical sort by name (A-Z, case-insensitive)
        const sortedUsers = filteredUsers.sort((a, b) => {
          const nameA =
            a.full_name ||
            a.username ||
            (a.profile && (a.profile.full_name || a.profile.username)) ||
            '';
          const nameB =
            b.full_name ||
            b.username ||
            (b.profile && (b.profile.full_name || b.profile.username)) ||
            '';
          return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
        });

        setUsers(sortedUsers);
        setCurrentUser(user);
        setSelectedUsers([user.id]);
      } catch (error) {
        setErrorMsg('Failed to load users');
        setShowError(true);
        setTimeout(() => setShowError(false), 1200);
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
      setErrorMsg('Enter group name');
      setShowError(true);
      setTimeout(() => setShowError(false), 1600);
      return;
    }
    if (selectedUsers.length < 2) {
      setErrorMsg('Select at least one additional user');
      setShowError(true);
      setTimeout(() => setShowError(false), 1600);
      return;
    }
    try {
      const result = await createGroup(groupName, selectedUsers);
      if (!result?.group?.id) {
        throw new Error('Group creation failed');
      }

      // Show the message box
      setShowSuccess(true);

      // After 1 second, redirect
      setTimeout(() => {
        setShowSuccess(false);
        router.replace({ pathname: '/messages', params: { tab: 'Groups' } });
      }, 1000);

    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to create group');
      setShowError(true);
      setTimeout(() => setShowError(false), 1600);
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
      {/* Success Message Box */}
      {showSuccess && (
        <View style={styles.successBoxOverlay}>
          <View style={styles.successBox}>
            <Text style={styles.successText}>Group created successfully!</Text>
          </View>
        </View>
      )}
      {/* Error Message Box */}
      {showError && (
        <View style={styles.successBoxOverlay}>
          <View style={styles.successBox}>
            <Text style={[styles.successText, { color: '#D11B1B' }]}>{errorMsg}</Text>
          </View>
        </View>
      )}

      {/* 🔙 Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#085DB7" />
        </TouchableOpacity>
        <Text style={styles.title}>Create New Group</Text>
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
          const profile = item.profile || {};
          const name =
            item.full_name ||
            item.username ||
            profile.full_name ||
            profile.username ||
            '';
          const degree = item.degree || profile.degree || '';
          const avatarUrl = item.pfp_url || profile.pfp_url;
          const isSelected = selectedUsers.includes(userId);

          return (
            <View style={styles.userBox}>
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.avatar} />
              )}
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{name}</Text>
                <Text style={styles.userSub}>{degree}</Text>
              </View>
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
    overflow: 'hidden',
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
  successBoxOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  successBox: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 42,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  successText: {
    color: '#085DB7',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },
});
