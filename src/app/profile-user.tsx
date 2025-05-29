import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchUser } from '@/src/api/users';
import { fetchPostsByUserId } from '@/src/api/posts'; 
import PostCard from '@/src/components/PostCard';      
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function ProfileUserScreen() {
  const { userId } = useLocalSearchParams(); // userId = email passed in router param
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New states for posts
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const decodedEmail = decodeURIComponent(userId as string);
        const data = await fetchUser(decodedEmail); // returns a single object
        if (data) {
          setUserData(data);
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };
    if (userId) loadUserData();
  }, [userId]);


  // Fetch user's posts when userData is available
  useEffect(() => {
    const loadPosts = async () => {
      if (!userData?.user_id) return;
      console.log("Trying to fetch posts for user_id:", userData.user_id); 
      try {
        setLoadingPosts(true);
        const userPosts = await fetchPostsByUserId(userData.user_id);
        console.log("Fetched posts:", userPosts); 
        setPosts(userPosts || []);
      } catch (error) {
        setPosts([]);
      } finally {
        setLoadingPosts(false);
      }
    };
    if (userData?.user_id) {
      loadPosts();
    }
  }, [userData]);

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
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={28} color="#085DB7" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {userData.username ? `${userData.username}'s Profile` : 'Profile'}
        </Text>
      </View>
      <ScrollView>
        {/* Profile Info */}
        <View style={styles.profileHeader}>
          {userData?.pfp_url ? (
            <Image source={{ uri: userData.pfp_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: '#ccc' }]} />
          )}
          <Text style={styles.userName}>{userData.username}</Text>
          <Text style={styles.userHandle}>@{userData.email?.split('@')[0]}</Text>
          <Text style={styles.userBio}>
            {userData?.degree
              ? `Studying ${userData.degree}`
              : 'No degree information available.'}
          </Text>
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
      </ScrollView>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#085DB7',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 2,
  },
  profileHeader: { alignItems: 'center', padding: 20 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  userName: { fontSize: 24, fontWeight: 'bold' },
  userHandle: { fontSize: 16, color: '#666', marginBottom: 12 },
  userBio: { textAlign: 'center', color: '#333', paddingHorizontal: 20 },
});
