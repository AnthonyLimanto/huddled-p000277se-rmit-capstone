import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
  Pressable,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MessageCard from '@/src/components/MessageCard';
import {
  fetchGroupMessages,
  sendGroupMessage,
  subscribeToGroupMessages,
} from '@/src/api/group-message';
import { getSessionUser } from '@/src/api/users';
import { Group } from '@/src/model/group';
import { fetchGroup, fetchGroupMembers, leaveGroup } from '@/src/api/group';
import { Message } from '@/src/model/message';

export default function ChatScreen() {
  const { id: groupId } = useLocalSearchParams(); // groupId from route
  const router = useRouter();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [group, setGroup] = useState<Group>();
  const [members, setMembers] = useState<any[]>([]);
  const [showOptions, setShowOptions] = useState(false);

  // Load user, group info, members, and messages
  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getSessionUser();
        setCurrentUser(user);

        const fetchedGroup = await fetchGroup(groupId);
        if (fetchedGroup && fetchedGroup.length > 0) {
          setGroup(fetchedGroup[0]);
        }

        const fetchedMessages = await fetchGroupMessages(groupId as string);
        const processedMessages = fetchedMessages.map((msg: any) => ({
          id: msg.id,
          sender: msg.users.username,
          content: msg.content,
          isOwnMessage: msg.user_id === user.id,
        }));
        setMessages(processedMessages);

        // Fetch members
        const mems = await fetchGroupMembers(groupId as string);
        setMembers(mems || []);
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };

    loadData();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToGroupMessages(groupId as string, (payload) => {
      if (payload.eventType === 'INSERT') {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: payload.new.id,
            sender: payload.new.users?.username || 'Unknown',
            content: payload.new.content,
            isOwnMessage: payload.new.user_id === currentUser?.id,
          },
        ]);
      } else if (payload.eventType === 'UPDATE') {
        setMessages((prevMessages) =>
          prevMessages.map((message) =>
            message.id === payload.new.id
              ? { ...message, content: payload.new.content }
              : message
          )
        );
      } else if (payload.eventType === 'DELETE') {
        setMessages((prevMessages) =>
          prevMessages.filter((message) => message.id !== payload.old.id)
        );
      }
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [groupId]);

  // Send a message
  const handleSend = async () => {
    if (!input.trim() || !currentUser) return;

    try {
      const newMessage = await sendGroupMessage(
        groupId as string,
        currentUser.id,
        input
      );

      setMessages((prevMessages) => [
        {
          id: newMessage.id,
          sender: currentUser.username,
          content: newMessage.content,
          isOwnMessage: true,
        },
        ...prevMessages,
      ]);
      setInput('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Group options menu (Invite, Exit)
  const openGroupOptions = () => {
    if (Platform.OS === 'ios') {
      import('react-native').then(({ ActionSheetIOS }) => {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['Cancel', 'Invite Users', 'Exit Group'],
            destructiveButtonIndex: 2,
            cancelButtonIndex: 0,
          },
          (buttonIndex) => {
            if (buttonIndex === 1) openInviteScreen();
            if (buttonIndex === 2) handleExitGroup();
          }
        );
      });
    } else {
      setShowOptions(true);
    }
  };

  // Invite Users route
  const openInviteScreen = () => {
    setShowOptions(false);
    router.push({ pathname: '/chat/invite', params: { groupId } });

  };

  // Exit Group function
  const handleExitGroup = async () => {
    setShowOptions(false);
    Alert.alert('Exit Group', 'Are you sure you want to leave this group?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Exit',
        style: 'destructive',
        onPress: async () => {
          try {
            await leaveGroup(groupId as string); // You must implement this API if not already
            Alert.alert('You have left the group');
            router.replace('/messages');
          } catch (e) {
            Alert.alert('Failed to exit group');
          }
        },
      },
    ]);
  };

  // Header with group name, members list, and options
  const renderHeader = () => (
    <View>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.titleBox}
          onPress={openGroupOptions}
          activeOpacity={0.7}
        >
          <Text style={styles.headerTitle} numberOfLines={1}>
            {group?.name || 'Group'}
          </Text>
          <Ionicons name="chevron-down" size={15} color="#666" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
        <View style={{ width: 24 }} />
      </View>
      {/* Members list */}
      <FlatList
        data={members}
        keyExtractor={(item) => item.user_id || item.id}
        renderItem={({ item }) => (
          <View style={styles.memberBox}>
            {item.pfp_url ? (
              <Image source={{ uri: item.pfp_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar} />
            )}
            <Text style={styles.memberName} numberOfLines={1}>
              {item.full_name || item.username || ''}
            </Text>
          </View>
        )}
        style={styles.memberList}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 10, paddingVertical: 4 }}
        ListEmptyComponent={<Text style={{ color: '#aaa', fontSize: 12 }}>No members</Text>}
      />
      {/* Android modal for options */}
      <Modal
        visible={showOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowOptions(false)}>
          <View style={styles.optionsModal}>
            <TouchableOpacity style={styles.optionBtn} onPress={openInviteScreen}>
              <Ionicons name="person-add-outline" size={20} color="#007aff" />
              <Text style={styles.optionText}>Invite Users</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionBtn} onPress={handleExitGroup}>
              <Ionicons name="exit-outline" size={20} color="#d11b1b" />
              <Text style={[styles.optionText, { color: '#d11b1b' }]}>Exit Group</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      {/* 📨 Messages */}
      <FlatList
        data={messages}
        renderItem={({ item }) => <MessageCard message={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messages}
        inverted
      />

      {/* 🔡 Message input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type your message..."
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    position: 'relative',
  },
  titleBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 30,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#222', flexShrink: 1 },
  memberList: {
    minHeight: 38,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
  },
  memberBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    marginRight: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    minWidth: 56,
    maxWidth: 110,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e1e1e1',
    marginRight: 7,
  },
  memberName: {
    fontSize: 13,
    color: '#222',
    maxWidth: 70,
  },
  messages: { padding: 16, gap: 10 },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F1F1F1',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#0066CC',
    padding: 10,
    borderRadius: 20,
  },
  // Modal styles for Android
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    width: 220,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 5,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  optionText: {
    fontSize: 16,
    color: '#222',
    marginLeft: 11,
    fontWeight: '500',
  },
});