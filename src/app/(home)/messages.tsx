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
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={24} color="#085DB7" />
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
              <Ionicons name="people-outline" size={26} color="#333" style={styles.modalIcon} />
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
    width: 32,
    height: 32,
    borderRadius: 24,
    backgroundColor: '#F8F8F8', // subtle background
    alignItems: 'center',
    justifyContent: 'center',
    // shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    // elevation for Android
    elevation: 2,
  },
  
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#F0F9FF',
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
    justifyContent: 'center',
    alignItems: 'center', 
  },
  modalContainer: {
    backgroundColor: '#F0F9FF',
    paddingVertical: 36,         
    paddingHorizontal: 48,       
    borderRadius: 28,            
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 20,
    elevation: 12,
    minWidth: 260,               
  },
  
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    justifyContent: 'center', 
  },
  modalIcon: { marginRight: 12 },
  modalText: {
    fontSize: 22,
    color: '#222',
    fontWeight: '500',
  },
});