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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MessageCard from '@/src/components/MessageCard';
import { fetchGroupMessages, sendGroupMessage } from '@/src/api/group-message';
import { getSessionUser } from '@/src/api/users';
import { Group } from '@/src/model/group';
import { fetchGroup } from '@/src/api/group';
import { Message } from '@/src/model/message';

export default function ChatScreen() {
  const { id: groupId } = useLocalSearchParams(); // groupId from route
  const router = useRouter();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [group, setGroup] = useState<Group>();

  // 🔄 Load user and messages on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getSessionUser();
        setCurrentUser(user);

        const fetchedGroup = await fetchGroup(groupId);
        if (fetchedGroup && fetchedGroup.length > 0) {
          console.log(fetchedGroup);
          setGroup(fetchedGroup[0]);
        }

        const fetchedMessages = await fetchGroupMessages(groupId as string);
        const processedMessages = fetchedMessages.map((msg: any) => ({
          id: msg.id,
          sender: msg.users.username,
          content: msg.content,
          isOwnMessage: msg.user_id === user.id, // Check if the message is sent by the current user
        }));
        setMessages(processedMessages);
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };

    loadData();
  }, [groupId]);
        

  // 💬 Send a message
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

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔙 Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.headerTitle}>{group?.name}</Text>
          <Text style={styles.subTitle}>Group ID: {groupId}</Text>
        </View>
        {/* ➕ Invite button */}
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/chat/invite', params: { groupId } })}
          style={styles.inviteButton}
        >
          <Ionicons name="person-add-outline" size={22} color="#007aff" />
          <Text style={styles.inviteText}>Invite Users</Text>
        </TouchableOpacity>
      </View>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  subTitle: { color: '#888', fontSize: 14, marginTop: 4 },
  inviteButton: {
    marginLeft: 'auto',
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
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
});
