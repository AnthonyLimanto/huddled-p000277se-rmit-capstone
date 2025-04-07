import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Group } from '../model/group';
import { Pfp } from './Pfp';

interface GroupCardProps {
  group: Group;
}

export const GroupCard = ({ group }: GroupCardProps) => {  
  console.log('given group prop:', group);
    return (
        <TouchableOpacity style={styles.chatItem}>
              <View >
                <Pfp email={group.group.id} name={group.group.name} style={styles.avatar} size={60} />
              </View>
              
              <View style={styles.chatDetails}>
                <View style={styles.chatHeader}>
                  <Text style={styles.chatName}>{group.group.name}</Text>
                  <Text style={styles.timeText}>{"hardcoded time"}</Text>
                </View>
                
                <View style={styles.messageRow}>
                  <Text numberOfLines={1} style={styles.messageText}>
                    {"hardcoded"}
                  </Text>
                  
                  {/* {group.unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{"hardcoded"}</Text>
                    </View>
                  )} */}
                </View>
              </View>
            </TouchableOpacity>
    );
};

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
    },
    newMessageButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#F8F8F8',
      alignItems: 'center',
      justifyContent: 'center',
    },
    searchContainer: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F8F8F8',
      borderRadius: 10,
      padding: 10,
    },
    searchInput: {
      flex: 1,
      marginLeft: 10,
      fontSize: 16,
    },
    chatList: {
      flex: 1,
    },
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