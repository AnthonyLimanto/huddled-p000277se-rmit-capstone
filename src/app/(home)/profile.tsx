import { supabase } from '@/src/api/supabase';
import { fetchUser } from '@/src/api/users';
import { fetchPostsByUserId } from '@/src/api/posts';
import PostCard from '@/src/components/PostCard';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editDegree, setEditDegree] = useState('');

  // For user's posts
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // --- Logout and Edit functions ---
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

  const [editBio, setEditBio] = useState('');

  const handleEditProfile = () => {
    setEditUsername(userData?.username || '');
    setEditBio(userData?.bio || '');
    setEditModalVisible(true);
  };  

  const handleUpdateProfile = async () => {
    if (!editUsername.trim()) {
      Alert.alert('Validation Error', 'Username is required');
      return;
    }
  
    try {
      const { error } = await supabase
        .from('users')
        .update({ username: editUsername.trim(), bio: editBio.trim() })
        .eq('email', userData.email);
  
      if (error) {
        Alert.alert('Update Failed', error.message);
      } else {
        setUserData({ ...userData, username: editUsername.trim(), bio: editBio.trim() });
        Alert.alert('Profile updated!');
        setEditModalVisible(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
      console.error(error);
    }
  };
  

  // --- Load user and posts ---
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getUser();
        console.log('Session email:', sessionData?.user?.email);
        if (sessionError) throw sessionError;
        const userDetails = await fetchUser(sessionData.user.email!);
        console.log('User details from DB:', userDetails);
        if (userDetails) {
          setUserData(userDetails); // userDetails is an object!
        } else {
          setUserData(null);
        }        
      } catch (error) {
        console.error("Error loading user data:", error);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, []);

  useEffect(() => {
    const loadPosts = async () => {
      if (!userData?.user_id) return;
      setLoadingPosts(true);
      try {
        const userPosts = await fetchPostsByUserId(userData.user_id);
        setPosts(userPosts || []);
      } catch (error) {
        setPosts([]);
      } finally {
        setLoadingPosts(false);
      }
    };
    if (userData?.user_id) loadPosts();
  }, [userData]);

  // --- Render ---
  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#075DB6" />
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>User not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity style={styles.headerLogoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Profile Info */}
        <View style={styles.profileHeader}>
          <View style={{ position: 'relative' }}>
            {userData?.pfp_url ? (
              <Image source={{ uri: userData.pfp_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: '#ccc' }]} />
            )}
            <TouchableOpacity style={styles.editAvatarButton} onPress={handleChangeProfilePic}>
              <Ionicons name="camera" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{userData.username}</Text>
          <Text style={styles.userHandle}>@{userData.email?.split('@')[0]}</Text>
          <Text style={styles.userBio}>
            {userData?.degree
              ? `Studying ${userData.degree}`
              : 'This is where your bio would appear. Share a bit about yourself with others.'}
          </Text>

          <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* User's Posts */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
          <Text style={{ fontSize: 24, color: '#085DB7', fontWeight: 'bold', marginBottom: 18 }}>
            Posts
          </Text>
          {loadingPosts ? (
            <ActivityIndicator size="small" color="#075DB6" />
          ) : posts.length === 0 ? (
            <Text style={{ color: '#888', textAlign: 'center' }}>No posts yet.</Text>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#085DB7" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setEditModalVisible(false)}>
              <Ionicons name="close" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.editProfileTitle}>Edit Profile</Text>

            <TextInput
              style={styles.input}
              value={editUsername}
              placeholder="Username"
              placeholderTextColor="#B0B0B0"
              onChangeText={setEditUsername}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              value={editBio}
              placeholder="Bio"
              placeholderTextColor="#B0B0B0"
              onChangeText={setEditBio}
              multiline={true}
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
  container: { flex: 1, backgroundColor: '#F0F9FF' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#085DB7',
    flex: 1,
    textAlign: 'left',
  },
  headerLogoutButton: {
    marginLeft: 'auto',
    padding: 6,
  },
  profileHeader: { alignItems: 'center', padding: 20 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    backgroundColor: '#ccc',
  },
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
  editProfileTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#085DB7',
    textAlign: 'center',
    marginBottom: 20,
  },
  userName: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  userHandle: { fontSize: 16, color: '#666', marginBottom: 12 },
  userBio: { textAlign: 'center', color: '#333', paddingHorizontal: 20, marginBottom: 16 },
  editProfileButton: {
    borderWidth: 1,
    borderColor: '#0066CC',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 8,
    marginTop: 10,
    marginBottom: 4,
  },
  editProfileText: { color: '#0066CC', fontWeight: 'bold' },
  logoutContainer: { padding: 20, borderTopWidth: 1, borderColor: '#EEE', marginTop: 20 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  logoutText: { color: '#085DB7', fontWeight: 'bold', marginLeft: 8, fontSize: 16 },

  // Posts section (reusing padding/colors for consistency)
  postsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

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
  input: {
    width: '100%',
    backgroundColor: '#E7F3FF',
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    marginVertical: 8,
    color: '#222',
  },
  updateButton: {
    backgroundColor: '#0066CC',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
    padding: 16,
  },
});
