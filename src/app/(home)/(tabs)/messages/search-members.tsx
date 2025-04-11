import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface UserCardProps {
  user: {
    id: string;
    name: string;
    title: string;
    email: string;
  };
  onAdd: () => void;
}

const UserCard = ({ user, onAdd }: UserCardProps) => (
  <View style={styles.userCard}>
    <View style={styles.userInfo}>
      <View style={styles.avatar} />
      <View style={styles.userDetails}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userTitle}>{user.title}</Text>
      </View>
    </View>
    <TouchableOpacity style={styles.addButton} onPress={onAdd}>
      <Text style={styles.addButtonText}>Add</Text>
    </TouchableOpacity>
  </View>
);

export default function SearchMembersScreen() {
  const router = useRouter();
  const { email, currentMembers } = useLocalSearchParams();
  const [isAdded, setIsAdded] = useState(false);

  const dummyUsers = [
    {
      id: "user1",
      name: "Yulun Wang",
      title: "Master of IT",
      email: "s3691235@student.rmit.edu.au"
    },
    {
      id: "user2",
      name: "Alex",
      title: "Master of CS",
      email: "s123456@gmail.com"
    },
    {
      id: "user3",
      name: "Sarah Chen",
      title: "Master of Data Science",
      email: "s789012@rmit.edu.au"
    },
    {
      id: "user4",
      name: "Mike Johnson",
      title: "PhD in AI",
      email: "s345678@rmit.edu.au"
    }
  ];

  const existingMembers = useMemo(() => {
    try {
      return currentMembers ? JSON.parse(currentMembers as string) : [];
    } catch {
      return [];
    }
  }, [currentMembers]);

  const searchResults = useMemo(() => {
    if (email === '999') {
      // Return all unadded users
      return dummyUsers.filter(user => 
        !existingMembers.some((member: { id: string }) => member.id === user.id)
      );
    }
    // Return single matching user
    const foundUser = dummyUsers.find(user => user.email === email);
    return foundUser ? [foundUser] : [];
  }, [email, existingMembers]);

  const handleBack = () => {
    router.back();
  };

  const handleAddMember = (user: typeof dummyUsers[0]) => {
    const updatedMembers = [...existingMembers];
    if (!updatedMembers.some(member => member.id === user.id)) {
      updatedMembers.push(user);
    }
    
    router.replace({
      pathname: '/(home)/(tabs)/messages/create-group',
      params: { 
        allMembers: JSON.stringify(updatedMembers)
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#0066CC" />
        </TouchableOpacity>
        <Text style={styles.title}>Search</Text>
      </View>

      <View style={styles.searchResult}>
        <Text style={styles.searchEmail}>{email}</Text>
        <ScrollView>
          {searchResults.map(user => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userInfo}>
                <View style={styles.avatar} />
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userTitle}>{user.title}</Text>
                </View>
              </View>
              {existingMembers.some((member: { id: string }) => member.id === user.id) ? (
                <View style={styles.addedButton}>
                  <Text style={styles.addedButtonText}>Added</Text>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.addButton} 
                  onPress={() => handleAddMember(user)}
                >
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066CC',
    marginLeft: 8,
  },
  searchResult: {
    flex: 1,
    padding: 16,
  },
  searchEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DDD',
  },
  userDetails: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  addedButton: {
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  addedButtonText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '600',
  },
}); 