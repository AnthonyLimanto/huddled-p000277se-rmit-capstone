import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '../model/message';



interface MessageCardProps {
  message: Message;
}

const MessageCard = ({ message }: MessageCardProps) => {
  return (
    <View
      style={[
        styles.messageContainer,
        message.isOwnMessage ? styles.ownMessage : styles.otherMessage,
      ]}
    >
      {!message.isOwnMessage && (
        <Text style={styles.senderName}>{message.sender}</Text>
      )}
      <Text style={styles.messageText}>{message.content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#F0F9FF'
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F1F1', // Light gray for other messages
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 5,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
});

export default MessageCard;