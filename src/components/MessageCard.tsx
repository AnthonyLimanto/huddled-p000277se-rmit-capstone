import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Pfp } from './Pfp';

export interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    email: string;
  };
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'personal' | 'group';
}

interface MessageCardProps {
  message: Message;
}

export const MessageCard = ({ message }: MessageCardProps) => {
  return (
    <TouchableOpacity style={styles.chatItem}>
      <View>
        <Pfp email={message.sender.email} name={message.sender.name} style={styles.avatar} size={60} />
      </View>
      
      <View style={styles.chatDetails}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{message.sender.name}</Text>
          <Text style={styles.timeText}>{message.timestamp}</Text>
        </View>
        
        <View style={styles.messageRow}>
          <Text numberOfLines={1} style={styles.messageText}>
            {message.content}
          </Text>
          
          {!message.isRead && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>New</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
