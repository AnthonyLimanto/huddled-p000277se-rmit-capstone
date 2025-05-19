import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { fetchNotifications } from '@/src/api/notification';
import { getSessionUser } from '@/src/api/users';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const user = await getSessionUser();
        const data = await fetchNotifications(user.id);
        setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading notifications:', err);
        setNotifications([]); // fallback
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔙 Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#085DB7" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Notifications</Text>
      </View>

      {/* 📨 Content */}
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : notifications.length === 0 ? (
        <View style={styles.fallbackContainer}>
          <Ionicons name="notifications-off-outline" size={48} color="#CCC" />
          <Text style={styles.fallbackText}>You're all caught up!</Text>
          <Text style={styles.fallbackSubText}>No new notifications for now.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text>{item.message}</Text>
              <Text style={styles.timestamp}>
                {new Date(item.created_at).toLocaleString()}
              </Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  backButton: { marginRight: 12 },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#085DB7',
  },
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  fallbackText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 12,
    color: '#555',
  },
  fallbackSubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
});
