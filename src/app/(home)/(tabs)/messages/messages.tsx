import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroupCard } from '@/src/components/GroupCard';
import { MessageCard, Message } from '@/src/components/MessageCard';
import { Group, GroupMember } from '@/src/model/group';
import { useFocusEffect } from '@react-navigation/native';
import { fetchGroups } from '@/src/api/group';
import { getSessionUser } from '@/src/api/users';
import { useRouter } from 'expo-router';

type Category = 'All' | 'Chats' | 'Groups' | 'Unread';

const SAMPLE_MESSAGES: Message[] = [
  {
    id: '1',
    sender: {
      id: 'user1',
      name: 'Alice Smith',
      email: 'alice@example.com'
    },
    content: 'Hey, how are you doing?',
    timestamp: '4 mins',
    isRead: true,
    type: 'personal'
  },
  {
    id: '2',
    sender: {
      id: 'user2',
      name: 'Bob Johnson',
      email: 'bob@example.com'
    },
    content: 'Did you finish the project?',
    timestamp: '4 mins',
    isRead: false,
    type: 'personal'
  },
  {
    id: '3',
    sender: {
      id: 'group1',
      name: 'Project Team',
      email: 'project-team@example.com'
    },
    content: 'Meeting at 3 PM today',
    timestamp: '4 mins',
    isRead: true,
    type: 'group'
  }
];

export default function MessagesScreen() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [groups, setGroups] = useState<Group[]>([]);
  const router = useRouter();

  const categories: Category[] = ['All', 'Chats', 'Groups', 'Unread'];

  const filteredMessages = SAMPLE_MESSAGES.filter(message => {
    switch (selectedCategory) {
      case 'Chats':
        return message.type === 'personal';
      case 'Groups':
        return message.type === 'group';
      case 'Unread':
        return !message.isRead;
      default:
        return true;
    }
  });

  const renderGroupCard = ({ item }: { item: Group }) => <GroupCard group={item} />;

  useFocusEffect(
    useCallback(() => {
      const fetchUserAndGroups = async () => {
        try {
          const currentUser = await getSessionUser();
          if (currentUser) {
            console.log('Current User:', currentUser);
            const userGroups = await fetchGroups(currentUser);
            console.log('Fetched Groups:', userGroups);
            if (userGroups) {
              const formattedGroups: Group[] = userGroups.flatMap(groupMember => 
                groupMember.group.map(g => ({
                  id: g.id,
                  name: g.name,
                  created_at: new Date(g.created_at)
                }))
              );
              setGroups(formattedGroups);
            }
          } else {
            console.error('No user session found.');
          }
        } catch (error) {
          console.error('Error fetching user or groups:', error);
        }
      };

      fetchUserAndGroups();
    }, [])
  );

  const renderMessage = ({ item }: { item: Message }) => {
    return <MessageCard message={item} />;
  };

  const handleCreateGroup = () => {
    router.push('./create-group');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item && styles.categoryTextActive
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item}
        />
      </View>

      {selectedCategory === 'Groups' && (
        <TouchableOpacity 
          style={styles.createGroupButton}
          onPress={handleCreateGroup}
        >
          <Text style={styles.createGroupText}>Create Group</Text>
        </TouchableOpacity>
      )}
      
      <FlatList
        data={filteredMessages}
        renderItem={renderMessage}
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
    color: '#0066CC',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0066CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
  },
  categoryButtonActive: {
    backgroundColor: '#0066CC',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#FFF',
  },
  createGroupButton: {
    backgroundColor: '#0066CC',
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createGroupText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  chatList: {
    flex: 1,
  },
});