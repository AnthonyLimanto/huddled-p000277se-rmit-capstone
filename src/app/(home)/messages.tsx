import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroupCard } from '@/src/components/GroupCard';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchGroups } from '@/src/api/group';
import { getSessionUser } from '@/src/api/users';

const TABS = ['All', 'Chats', 'Groups', 'Unread'];

export default function MessagesScreen() {
  const { tab } = useLocalSearchParams();
  const router = useRouter();

  const [groups, setGroups] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState((tab as string) || 'All');
  const [modalVisible, setModalVisible] = useState(false);

  const fetchUserAndGroups = async () => {
    const currentUser = await getSessionUser();
    if (currentUser) {
      const userGroups = await fetchGroups(currentUser.id);
      setGroups(userGroups);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserAndGroups();
    }, [])
  );

  const filterGroups = () => {
    if (activeTab === 'Chats') return groups.filter(g => g.group?.memberCount == 2);
    if (activeTab === 'Groups') return groups.filter(g => g.group?.memberCount > 2);
    if (activeTab === 'Unread') return []; // Placeholder
    return groups;
  };

  const renderGroupCard = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => router.push(`/chat/${item.group.id}`)}>
      <GroupCard
        group={item.group}
        latestMessage={item.message?.content || 'No messages yet'}
        timestamp={item.message?.createdAt || ''}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 🔵 Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity
          style={styles.newMessageButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="create-outline" size={24} color="#0066CC" />
        </TouchableOpacity>
      </View>

      {/* 🧭 Tabs */}
      <View style={styles.tabs}>
        {TABS.map(tabName => (
          <TouchableOpacity key={tabName} onPress={() => setActiveTab(tabName)}>
            <Text style={[styles.tabText, activeTab === tabName && styles.activeTab]}>
              {tabName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 📨 Chat List */}
      <FlatList
        data={filterGroups()}
        renderItem={renderGroupCard}
        keyExtractor={(item) => item.group.id}
        style={styles.chatList}
      />

      {/* ➕ New Group Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setModalVisible(false);
                router.push('/chat/new-group');
              }}
            >
              <Ionicons name="people-outline" size={20} color="#333" style={styles.modalIcon} />
              <Text style={styles.modalText}>New Group</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#085DB7' },
  newMessageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tabText: { fontSize: 16, color: '#666' },
  activeTab: {
    color: '#0066CC',
    borderBottomWidth: 2,
    borderBottomColor: '#0066CC',
    paddingBottom: 4,
  },
  chatList: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 10,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  modalIcon: { marginRight: 12 },
  modalText: { fontSize: 16, color: '#333' },
});
