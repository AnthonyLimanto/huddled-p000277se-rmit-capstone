import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type Message = {
  id: string;
  sender: string;
  content: string;
  isOwnMessage: boolean;
};

export default function MessageCard({ message }: { message: Message }) {
  return (
    <View
      style={[
        styles.messageBubble,
        message.isOwnMessage ? styles.ownMessage : styles.otherMessage,
      ]}
    >
      {!message.isOwnMessage && (
        <Text style={styles.sender}>{message.sender}</Text>
      )}
      <Text style={styles.text}>{message.content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  messageBubble: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  ownMessage: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
    borderTopRightRadius: 0,
  },
  otherMessage: {
    backgroundColor: '#F1F0F0',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
  },
  sender: {
    fontSize: 12,
    color: '#555',
    marginBottom: 2,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});
