import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface Member {
  id: string;
  name: string;
  title: string;
  email: string;
}

export default function CreateGroupScreen() {
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    console.log('Current members:', members);
  }, [members]);

  useEffect(() => {
    if (params.allMembers) {
      try {
        console.log('Received all members:', params.allMembers);
        const allMembers = JSON.parse(params.allMembers as string);
        setMembers(allMembers);
      } catch (error) {
        console.error('Error parsing all members:', error);
      }
    }
    else if (params.newMember) {
      try {
        console.log('Received new member:', params.newMember);
        const newMember = JSON.parse(params.newMember as string);
        setMembers(prevMembers => {
          if (!prevMembers.some(member => member.id === newMember.id)) {
            console.log('Adding new member:', newMember);
            return [...prevMembers, newMember];
          }
          return prevMembers;
        });
      } catch (error) {
        console.error('Error parsing new member:', error);
      }
    }
  }, [params.newMember, params.allMembers]);

  const handleCreateGroup = () => {
    if (members.length >= 2 && groupName.trim()) {
      setIsCreating(true);
      // 显示遮罩层和成功提示
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      const newGroup = {
        id: Date.now().toString(),
        name: groupName.trim(),
        members: members,
        created_at: new Date(),
      };

      // 1秒后隐藏提示并导航
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          // 使用 replace 而不是 push
          router.replace({
            pathname: '/(home)/(tabs)/messages/messages',
            params: {
              category: 'Groups',
              newGroup: JSON.stringify(newGroup)
            }
          });
        });
      }, 1000);
    }
  };

  const handleBack = () => {
    router.replace('/(home)/(tabs)/messages/messages');
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log('Navigating to search with members:', members);
      router.push({
        pathname: '/(home)/(tabs)/messages/search-members',
        params: { 
          email: searchQuery,
          currentMembers: JSON.stringify(members)
        }
      });
      setSearchQuery('');
    }
  };

  const handleRemoveMember = (memberId: string) => {
    setMembers(prevMembers => prevMembers.filter(member => member.id !== memberId));
  };

  const MemberCard = ({ member }: { member: Member }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberInfo}>
        <View style={styles.avatar} />
        <View style={styles.memberDetails}>
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={styles.memberTitle}>{member.title}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.removeButton} 
        onPress={() => handleRemoveMember(member.id)}
      >
        <Ionicons name="close-circle" size={24} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#0066CC" />
        </TouchableOpacity>
        <Text style={styles.title}>Create Group</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Group Name Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Group name (Mandatory)"
            placeholderTextColor="#999"
            value={groupName}
            onChangeText={setGroupName}
          />
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by email"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
        </View>

        <View style={styles.membersContainer}>
          <Text style={styles.membersTitle}>Members: {members.length}</Text>
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </View>
      </ScrollView>

      {/* Create Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.createButton,
            (members.length < 2 || !groupName) && styles.createButtonDisabled
          ]}
          onPress={handleCreateGroup}
          disabled={members.length < 2 || !groupName}
        >
          <Text style={styles.createButtonText}>
            Create Group ({members.length}/2 members)
          </Text>
        </TouchableOpacity>
      </View>

      {/* 成功提示遮罩层 */}
      {isCreating && (
        <Animated.View 
          style={[
            styles.overlay,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          <View style={styles.successMessage}>
            <Text style={styles.successText}>Create successfully</Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    flex: 1,
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
  inputContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
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
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  membersContainer: {
    padding: 16,
  },
  membersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    marginBottom: 8,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DDD',
  },
  memberDetails: {
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  memberTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  createButton: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#B0B0B0',
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    padding: 8,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successMessage: {
    backgroundColor: '#4CD964',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  successText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 