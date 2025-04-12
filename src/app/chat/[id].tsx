import React, { useState } from 'react';
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
import { useLocalSearchParams } from 'expo-router';
import MessageCard, { Message } from '@/src/components/MessageCard';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen() {
  const { id } = useLocalSearchParams(); // Get group ID from URL

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'Sarah',
      content: 'Hey everyone! What time is the meeting?',
      isOwnMessage: false,
    },
    {
      id: '2',
      sender: 'You',
      content: "Let's start at 3pm?",
      isOwnMessage: true,
    },
    {
      id: '3',
      sender: 'Jovie',
      content: "Sounds good! I'll send the agenda.",
      isOwnMessage: false,
    },
  ]);

  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'You',
      content: input,
      isOwnMessage: true,
    };

    setMessages((prev) => [newMessage, ...prev]); // push to top since list is inverted
    setInput('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Group Chat</Text>
        <Text style={styles.subTitle}>Group ID: {id}</Text>
      </View>

      <FlatList
        data={messages}
        renderItem={({ item }) => <MessageCard message={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messages}
        inverted
      />

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
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  subTitle: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
  messages: {
    padding: 16,
    gap: 10,
  },
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
