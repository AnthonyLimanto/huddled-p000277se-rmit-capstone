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
  Alert,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchGroupMessages, sendGroupMessage } from '@/src/api/group-message';
import { getSessionUser } from '@/src/api/users';

// Define Message type locally since MessageCard component is empty
export interface Message {
  id: string;
  sender: string;
  content: string;
  isOwnMessage: boolean;
}

// Simple MessageCard component
const MessageCard = ({ message }: { message: Message }) => (
  <View style={[
    styles.messageContainer,
    message.isOwnMessage ? styles.ownMessage : styles.otherMessage
  ]}>
    <Text style={styles.sender}>{message.sender}</Text>
    <Text style={styles.messageContent}>{message.content}</Text>
  </View>
);

export default function ChatScreen() {
  const { id } = useLocalSearchParams(); // groupId from route
  const router = useRouter();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // 🔄 Load user and messages on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getSessionUser();
        setCurrentUser(user);

        const rawMessages = await fetchGroupMessages(id as string);
        setMessages(
          rawMessages.map((m: any) => ({
            id: m.id,
            sender: m.users?.username || 'Unknown',
            content: m.content,
            isOwnMessage: m.user_id === user.id,
          }))
        );
      } catch (err) {
        console.error('Failed to load chat data:', err);
      }
    };

    loadData();
  }, [id]);

  // 💬 Send a message
  const handleSend = async () => {
    if (!input.trim() || !currentUser) return;

    try {
      const sent = await sendGroupMessage(id as string, currentUser.id, input);

      const newMsg: Message = {
        id: sent.id,
        sender: currentUser.username || 'You',
        content: sent.content,
        isOwnMessage: true,
      };

      setMessages((prev) => [newMsg, ...prev]);
      setInput('');
    } catch (error) {
      console.error('Send failed:', error);
    }
  };

  const handleLeaveGroup = () => {
    console.log("Leave group pressed");
    setShowOptionsMenu(false);
    setShowConfirmModal(true);
  };

  const confirmLeaveGroup = async () => {
    try {
      setShowConfirmModal(false);
      setIsLeaving(true);
      console.log("Confirmed leaving group");
      
      //Show success message
      if (Platform.OS === 'android') {
        ToastAndroid.show('Successfully left the group', ToastAndroid.SHORT);
      }
      
      //Set delay 
      setTimeout(() => {
        setIsLeaving(false);
        // Navigate to messages page
        console.log("Navigating to messages");
        router.replace("/(home)/messages");
      }, 500);
    } catch (error) {
      console.error("Failed to leave group:", error);
      Alert.alert("Error", "Failed to leave the group");
      setIsLeaving(false);
    }
  };

  const cancelLeaveGroup = () => {
    console.log("Cancelled leaving group");
    setShowConfirmModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLeaving && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007aff" />
          <Text style={styles.loadingText}>Leaving group...</Text>
        </View>
      )}
      
      {/* 🔙 Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Group Chat</Text>
          <Text style={styles.subTitle}>Group ID: {id}</Text>
        </View>
        
        {/* Advanced Options Button */}
        <TouchableOpacity
          onPress={() => setShowOptionsMenu(true)}
          style={styles.optionsButton}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color="#007aff" />
        </TouchableOpacity>

        {/* Options Menu Modal */}
        <Modal
          transparent={true}
          visible={showOptionsMenu}
          animationType="fade"
          onRequestClose={() => setShowOptionsMenu(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowOptionsMenu(false)}
          >
            <View style={[styles.optionsMenu, { right: 10, top: 70 }]}>
              <TouchableOpacity 
                style={styles.optionItem}
                onPress={() => {
                  console.log("Invite users clicked");
                  setShowOptionsMenu(false);
                  router.push(`/chat/invite?groupId=${id}`);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="person-add-outline" size={20} color="#007aff" />
                <Text style={styles.optionText}>Invite Users</Text>
              </TouchableOpacity>
              
              <View style={styles.optionDivider} />
              
              <TouchableOpacity 
                style={styles.optionItem}
                onPress={() => {
                  console.log("Leave group option clicked");
                  handleLeaveGroup();
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="exit-outline" size={20} color="#FF3B30" />
                <Text style={[styles.optionText, { color: '#FF3B30' }]}>Leave Group</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
        
        {/* Confirmation Modal */}
        <Modal
          visible={showConfirmModal}
          transparent={true}
          animationType="fade"
          onRequestClose={cancelLeaveGroup}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.confirmDialog}>
              <Text style={styles.confirmTitle}>Leave Group</Text>
              <Text style={styles.confirmText}>
                Are you sure you want to leave this group?
              </Text>
              <View style={styles.confirmButtons}>
                <TouchableOpacity
                  style={[styles.confirmButton, styles.cancelButton]}
                  onPress={cancelLeaveGroup}
                >
                  <Text style={styles.buttonText}>No</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmButton, styles.confirmYesButton]}
                  onPress={confirmLeaveGroup}
                >
                  <Text style={[styles.buttonText, {color: 'white'}]}>Yes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  optionsButton: {
    marginLeft: 'auto',
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsMenu: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    width: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#007aff',
  },
  optionDivider: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginVertical: 4,
  },
  confirmDialog: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  confirmText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  confirmYesButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  messageContainer: {
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
    marginVertical: 4,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
  },
  sender: {
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 4,
  },
  messageContent: {
    fontSize: 15,
  },
});
