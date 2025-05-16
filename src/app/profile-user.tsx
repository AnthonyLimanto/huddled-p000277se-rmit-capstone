import { useLocalSearchParams } from 'expo-router';
import { fetchUser } from '@/src/api/users';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function ProfileUserScreen() {
  const { userId } = useLocalSearchParams(); // userId = email passed in router param
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      <ScrollView>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
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
