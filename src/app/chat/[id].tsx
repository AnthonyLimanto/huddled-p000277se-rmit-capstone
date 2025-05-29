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
import { useIsFocused } from '@react-navigation/native';

export default function ChatScreen() {
  const { id: groupId } = useLocalSearchParams(); // groupId from route
  const router = useRouter();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [group, setGroup] = useState<Group>();
  const [members, setMembers] = useState<any[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);

  const isFocused = useIsFocused(); 

  // Load user, group info, members, and messages
  useEffect(() => {
    
  
    if (isFocused) {
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
    }
  }, [groupId, isFocused]);

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
            await leaveGroup(groupId as string);
            Alert.alert('You have left the group');
            router.replace('/messages');
          } catch (e) {
            Alert.alert('Failed to exit group');
          }
        },
      },
    ]);
  };

  // Header with WhatsApp-style group name and avatars
  const renderHeader = () => (
    <View>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.push('/messages')}>
          <Ionicons name="arrow-back" size={24} color="#085DB7" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.titleBox}
          onPress={() => setShowMembersModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.headerTitle} numberOfLines={1}>
            {group?.name || 'Group'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={openGroupOptions}>
          <Ionicons name="ellipsis-vertical" size={24} color="#085DB7" />
        </TouchableOpacity>
      </View>

      {/* Members avatar row */}
      <TouchableOpacity onPress={() => setShowMembersModal(true)}>
        <View style={styles.memberAvatarRow}>
          {members.slice(0, 5).map((item, idx) => (
            <Image
              key={item.user_id || item.id || idx}
              source={{ uri: item.profile?.pfp_url || item.pfp_url || undefined }}
              style={styles.avatar}
            />
          ))}
          {members.length > 5 && (
            <View style={styles.moreAvatar}>
              <Text style={styles.moreText}>
                +{members.length - 5}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Members modal (shows all with name + pfp) */}
      <Modal
        visible={showMembersModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMembersModal(false)}
      >
        <Pressable style={styles.membersModalOverlay} onPress={() => setShowMembersModal(false)}>
          <View style={styles.membersModal}>
            <Text style={styles.membersModalTitle}>Group Members</Text>
            <View style={styles.membersDivider} /> 
            <FlatList
              data={members}
              keyExtractor={(item) => item.user_id || item.id}
              renderItem={({ item }) => (
                <View style={styles.memberListRow}>
                  <Image
                    source={{ uri: item.profile?.pfp_url || item.pfp_url || undefined }}
                    style={styles.avatarModal}
                  />
                  <Text style={styles.memberListName}>
                    {item.profile?.username || item.username || item.profile?.full_name || item.full_name}
                  </Text>
                </View>
              )}
            />
          </View>
        </Pressable>
      </Modal>
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
    backgroundColor: '#fff',
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
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#085DB7', flexShrink: 1 },
  // WhatsApp-style avatars
  memberAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
    paddingBottom: 8,
    minHeight: 44,
    paddingTop: 15,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e1e1e1',
    marginRight: -8, // overlap like WhatsApp
    borderWidth: 2,
    borderColor: '#FFF',
  },
  moreAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#CED6E0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    marginRight: 0,
  },
  moreText: {
    color: '#085DB7',
    fontWeight: 'bold',
    fontSize: 15,
  },
  // Modal for member list
  membersModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  membersModal: {
    width: 310,
    maxHeight: 400,
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 20,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 7,
  },
  membersModalTitle: {
    fontWeight: 'bold',
    fontSize: 19,
    marginBottom: 15,
    textAlign: 'center',
    color: '#1357DA',
  },
  membersDivider: {
    height: 1,
    backgroundColor: '#e0e0e0', // subtle gray divider
    marginBottom: 16,
    marginTop: 2,
    marginHorizontal: -20, // makes the divider stretch edge-to-edge inside the modal
  },  
  memberListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarModal: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e1e1e1',
    marginRight: 14,
  },
  memberListName: {
    fontSize: 16,
    color: '#222',
    flex: 1,
    flexWrap: 'wrap',
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
  // Modal styles for Android group options
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
