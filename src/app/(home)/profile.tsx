import { supabase } from '@/src/api/supabase';
import { fetchUser } from '@/src/api/users';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function ProfileScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const [editUsername, setEditUsername] = useState('');
  const [editDegree, setEditDegree] = useState('');

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout failed:", error.message);
      Alert.alert("Error", "Logout failed. Please try again.");
    } else {
      Alert.alert("Logged Out", "You have been signed out.");
      router.replace('../(auth)/signin');
    }
  };

  const handleChangeProfilePic = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Camera roll access is needed to change your photo');
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!pickerResult.canceled && pickerResult.assets.length > 0) {
        const imageUri = pickerResult.assets[0].uri;

        const response = await fetch(imageUri);
        const blob = await response.blob();

        const fileExt = imageUri.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `profile-pics/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, blob, { contentType: 'image/jpeg' });

        if (uploadError) {
          Alert.alert('Upload failed', uploadError.message);
          return;
        }

        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        const publicUrl = data.publicUrl;

        const { error: updateError } = await supabase
          .from('users')
          .update({ pfp_url: publicUrl })
          .eq('email', userData.email);

        if (updateError) {
          Alert.alert('Update failed', updateError.message);
        } else {
          setUserData({ ...userData, pfp_url: publicUrl });
          Alert.alert('Profile picture updated!');
        }
      }
    } catch (error) {
      Alert.alert('Failed', 'Something went wrong while updating profile picture');
      console.error('Error:', error);
    }
  };

  const handleEditProfile = () => {
    setEditUsername(userData.username);
    setEditDegree(userData.degree);
    setEditModalVisible(true);
  };

  const handleUpdateProfile = async () => {
    if (!editUsername.trim() || !editDegree.trim()) {
      Alert.alert('Validation Error', 'All fields are required');
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ username: editUsername.trim(), degree: editDegree.trim() })
        .eq('email', userData.email);

      if (error) {
        Alert.alert('Update Failed', error.message);
      } else {
        setUserData({ ...userData, username: editUsername.trim(), degree: editDegree.trim() });
        Alert.alert('Profile updated!');
        setEditModalVisible(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
      console.error(error);
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getUser();
        if (sessionError) throw sessionError;

        const userDetails = await fetchUser(sessionData.user.email!);
        if (userDetails && userDetails.length > 0) {
          setUserData(userDetails[0]);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {userData?.pfp_url ? (
              <Image source={{ uri: userData.pfp_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar} />
            )}
            <TouchableOpacity style={styles.editAvatarButton} onPress={handleChangeProfilePic}>
              <Ionicons name="camera" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{userData?.username || 'Loading...'}</Text>
          <Text style={styles.userHandle}>
            {userData?.email ? `@${userData.email.split('@')[0]}` : ''}
          </Text>
          <Text style={styles.userBio}>
            {userData?.degree
              ? `Studying ${userData.degree}`
              : 'This is where your bio would appear. Share a bit about yourself with others.'}
          </Text>

          <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Posts</Text>
        </View>
        
        <View style={styles.postsContainer}>
          {/* Empty state for posts */}
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={40} color="#CCC" />
            <Text style={styles.emptyStateText}>No posts yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Your posts will appear here
            </Text>
          </View>
        </View>

        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setEditModalVisible(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>

            <Text style={styles.title}>Edit Profile</Text>

            <TextInput
              style={styles.input}
              value={editUsername}
              placeholder="Username"
              onChangeText={setEditUsername}
            />

            <TextInput
              style={styles.input}
              value={editDegree}
              placeholder="Degree"
              onChangeText={setEditDegree}
            />

            <TouchableOpacity style={styles.updateButton} onPress={handleUpdateProfile}>
              <Text style={styles.updateButtonText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#085DB7',
  },  
  profileHeader: { alignItems: 'center', padding: 20 },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#DDD' },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0066CC',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userName: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  userHandle: { fontSize: 16, color: '#666', marginBottom: 12 },
  userBio: { textAlign: 'center', color: '#333', marginBottom: 24, paddingHorizontal: 20 },
  editProfileButton: {
    borderWidth: 1,
    borderColor: '#0066CC',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  editProfileText: { color: '#0066CC', fontWeight: 'bold' },
  logoutContainer: { padding: 20, borderTopWidth: 1, borderColor: '#EEE', marginTop: 20 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  logoutText: { color: '#FF3B30', fontWeight: 'bold', marginLeft: 8, fontSize: 16 },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButton: { alignSelf: 'flex-end' },
  input: {
    width: '100%',
    backgroundColor: '#eee',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginVertical: 10,
  },
  updateButton: {
    backgroundColor: '#0066CC',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
statsContainer: {
  flexDirection: 'row',
  width: '100%',
  marginBottom: 24,
  paddingHorizontal: 30,
  justifyContent: 'space-around',
},
statItem: {
  alignItems: 'center',
},
statNumber: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 5,
},
statLabel: {
  fontSize: 14,
  color: '#666',
},
divider: {
  width: 1,
  height: '100%',
  backgroundColor: '#EEE',
},

sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8F8F8',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  postsContainer: {
    padding: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  updateButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});