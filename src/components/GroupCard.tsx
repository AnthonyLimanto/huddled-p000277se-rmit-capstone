import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Group } from '../model/group';
import { Pfp } from './Pfp';
import { router } from 'expo-router';

interface GroupCardProps {
  group: Group;
  latestMessage: string;
  timestamp: string;
}


export const GroupCard = ({ group, latestMessage, timestamp }: GroupCardProps) => {
  // Add 10 hours to the timestamp
  const adjustedTime = new Date(new Date(timestamp).getTime() + 10 * 60 * 60 * 1000);

  const formattedTime = adjustedTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  console.log('given group prop:', group);

  const handlePress = () => {
    router.push(`/chat/${group.id}`);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Pfp email={group.id} name={group.name} style={styles.avatar} size={60} />
      <View style={styles.details}>
        <View style={styles.header}>
          <Text style={styles.name}>{group.name}</Text>
          <Text style={styles.time}>{formattedTime}</Text>
        </View>
        <Text style={styles.message} numberOfLines={1}>
          {latestMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  avatar: {
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  time: {
    fontSize: 12,
    color: '#888',
  },
  message: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
});