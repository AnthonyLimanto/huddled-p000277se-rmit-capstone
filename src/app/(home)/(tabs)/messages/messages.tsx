import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroupCard } from '@/src/components/GroupCard';
import { MessageCard, Message } from '@/src/components/MessageCard';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface GroupMember {
  id: string;
  name: string;
  title: string;
  email: string;
}

interface Group {
  id: string;
  name: string;
  created_at: Date;
  members: GroupMember[];
}

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
  }
];

const GROUPS_STORAGE_KEY = '@groups_key';

export default function MessagesScreen() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [groups, setGroups] = useState<Group[]>([]);
  const router = useRouter();
  const params = useLocalSearchParams();
  const categories: Category[] = ['All', 'Chats', 'Groups', 'Unread'];

  // 从本地存储加载群组
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const storedGroups = await AsyncStorage.getItem(GROUPS_STORAGE_KEY);
        if (storedGroups) {
          const parsedGroups = JSON.parse(storedGroups);
          setGroups(parsedGroups.map((group: any) => ({
            ...group,
            created_at: new Date(group.created_at)
          })));
        }
      } catch (error) {
        console.error('Error loading groups:', error);
      }
    };

    loadGroups();
  }, []);

  // 处理新创建的群组
  useEffect(() => {
    if (params.newGroup) {
      try {
        const newGroup = JSON.parse(params.newGroup as string) as Group;
        setGroups(prevGroups => {
          const updatedGroups = prevGroups.some(group => group.id === newGroup.id)
            ? prevGroups
            : [newGroup, ...prevGroups];
          
          // 保存到本地存储
          AsyncStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(updatedGroups))
            .catch(error => console.error('Error saving groups:', error));
          
          return updatedGroups;
        });
        setSelectedCategory('Groups');
      } catch (error) {
        console.error('Error parsing new group:', error);
      }
    }
  }, [params.newGroup]);

  // 更新示例消息，包含新创建的群组
  const getMessages = useCallback(() => {
    const baseMessages = [...SAMPLE_MESSAGES];
    
    // 将群组添加到消息列表
    const groupMessages: Message[] = groups.map(group => ({
      id: `group-${group.id}`,
      sender: {
        id: group.id,
        name: group.name,
        email: 'group@example.com'
      },
      content: `${group.members.length} members`,
      timestamp: '1 min',
      isRead: true,
      type: 'group'
    }));

    return [...groupMessages, ...baseMessages];
  }, [groups]);

  const filteredMessages = useMemo(() => {
    const allMessages = getMessages();
    switch (selectedCategory) {
      case 'Chats':
        return allMessages.filter(message => message.type === 'personal');
      case 'Groups':
        return allMessages.filter(message => message.type === 'group');
      case 'Unread':
        return allMessages.filter(message => !message.isRead);
      default:
        return allMessages;
    }
  }, [selectedCategory, getMessages]);

  const handleCreateGroup = () => {
    router.push('./create-group');
  };

  const renderMessage = ({ item }: { item: Message }) => {
    return <MessageCard message={item} />;
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