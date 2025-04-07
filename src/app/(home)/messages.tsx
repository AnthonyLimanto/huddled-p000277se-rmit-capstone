import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroupCard } from '@/src/components/GroupCard';
import { Group } from '@/src/model/group';


// Sample data for chat list
const SAMPLE_CHATS: Group[] = [
  {
    id: '1',
    groupName: 'Jovie Jing Sin',
    lastMessage: 'Thanks for sharing the tutorial!',
    time: '10 mins',
    unread: 2,
  },
  {
    id: '2',
    groupName: 'Nicholas Owen Putra',
    lastMessage: 'Do you have experience with Supabase?',
    time: '15 mins',
    unread: 0,
  },
  {
    id: '3',
    groupName: 'Sarah Johnson',
    lastMessage: 'When is our next team meeting?',
    time: '2 hours',
    unread: 1,
  },
  {
    id: '4',
    groupName: 'Tech Support',
    lastMessage: 'Your issue has been resolved.',
    time: '1 day',
    unread: 0,
  },
  {
    id: '5',
    groupName: 'React Native Group',
    lastMessage: 'Alex: Has anyone tried Expo Router yet?',
    time: '2 days',
    unread: 3,
  },
];

export default function MessagesScreen() {
  const renderGroupCard = ({ item }: { item: Group }) => (
    <GroupCard group={item} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity style={styles.newMessageButton}>
          <Ionicons name="create-outline" size={24} color="#0066CC" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            placeholder="Search messages..."
            placeholderTextColor="#999"
            style={styles.searchInput}
          />
        </View>
      </View>
      
      <FlatList
        data={SAMPLE_CHATS}
        renderItem={renderGroupCard}
        keyExtractor={item => item.id}
        style={styles.chatList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  newMessageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DDD',
    marginRight: 12,
  },
  chatDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 14,
    color: '#999',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageText: {
    flex: 1,
    color: '#666',
    fontSize: 15,
  },
  unreadBadge: {
    backgroundColor: '#0066CC',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});