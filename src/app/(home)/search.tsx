import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, SafeAreaView, ScrollView, StatusBar, TouchableOpacity, ActivityIndicator, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchUsers } from '@/src/api/users';
import { searchPosts } from '@/src/api/posts';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PostCard from '@/src/components/PostCard';
import { useAuth } from '@/src/context/AuthContext';
import { Post } from '@/src/model/post';

const RECENT_SEARCHES_KEY = 'recentSearches';

export default function SearchScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [postResults, setPostResults] = useState<Post[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'post'
  
  const { user } = useAuth();

  // Load recent searches from AsyncStorage on component mount
  useEffect(() => {
    loadRecentSearches();
  }, []);

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // Execute search for the selected tab if there was a previous search
    if (hasSearched && searchTerm.trim()) {
      executeSearch(tab);
    }
  };

  const loadRecentSearches = async () => {
    try {
      setIsLoading(true);
      const storedSearches = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (storedSearches) {
        setRecentSearches(JSON.parse(storedSearches));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRecentSearches = async (searches: string[]) => {
    try {
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
    } catch (error) {
      console.error('Failed to save recent searches:', error);
    }
  };

  // Execute search based on active tab
  const executeSearch = async (tab: string) => {
    if (!searchTerm.trim()) return;
    
    try {
      setIsSearching(true);
      
      if (tab === 'user') {
        // Search users
        const userResults = await searchUsers(searchTerm);
        setSearchResults(userResults);
      } else if (tab === 'post' && user?.id) {
        // Search posts
        const postResults = await searchPosts(searchTerm, user.id);
        setPostResults(postResults as any[]);
      }
      
      // Add to recent searches
      if (!recentSearches.includes(searchTerm)) {
        const newRecentSearches = [searchTerm, ...recentSearches.slice(0, 4)];
        setRecentSearches(newRecentSearches);
        saveRecentSearches(newRecentSearches);
      }
      
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search button click or enter key
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setHasSearched(true);
    await executeSearch(activeTab);
  };

  const resetSearch = () => {
    setHasSearched(false);
    setSearchResults([]);
    setPostResults([]);
    setSearchTerm('');
  };

  const handleSearchTermChange = (text: string) => {
    setSearchTerm(text);
    if (text === '' && hasSearched) {
      resetSearch();
    }
  };

  const navigateToUserProfile = (email: string) => {
    router.push(`/profile-user?userId=${encodeURIComponent(email)}`);
  };

  const renderUserItem = ({ item }: { item: any }) => (
    <View style={[styles.userItem, { backgroundColor: '#D9D9D9' }]}>
      <View style={styles.userInfo}>
        <Image 
          source={{ uri: item.pfp_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(item.username) }} 
          style={styles.userAvatar} 
        />
        <View style={styles.userDetails}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.userDegree}>{item.degree || 'Student'}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.profileButton} 
        onPress={() => navigateToUserProfile(item.email)}
      >
        <Text style={styles.profileButtonText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPostItem = ({ item }: { item: any }) => (
    <PostCard post={item} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            placeholder={activeTab === 'user' ? "Search username or email..." : "Search post content..."}
            placeholderTextColor="#999"
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={handleSearchTermChange}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={resetSearch}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={[styles.searchButton, !searchTerm.trim() && styles.searchButtonDisabled]} 
          onPress={handleSearch}
          disabled={!searchTerm.trim()}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#085DB7" />
        </View>
      ) : isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#085DB7" />
        </View>
      ) : hasSearched ? (
        <View style={styles.resultsContainer}>
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'user' && styles.activeTab]} 
              onPress={() => handleTabChange('user')}
            >
              <Text style={[styles.tabText, activeTab === 'user' && styles.activeTabText]}>User</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'post' && styles.activeTab]} 
              onPress={() => handleTabChange('post')}
            >
              <Text style={[styles.tabText, activeTab === 'post' && styles.activeTabText]}>Post</Text>
            </TouchableOpacity>
          </View>
          
          {activeTab === 'user' ? (
            searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.email}
                style={styles.resultsList}
              />
            ) : (
              <Text style={styles.noResultsText}>No matching users found</Text>
            )
          ) : (
            postResults.length > 0 ? (
              <FlatList
                data={postResults}
                renderItem={renderPostItem}
                keyExtractor={(item) => item.id}
                style={styles.resultsList}
              />
            ) : (
              <Text style={styles.noResultsText}>No matching posts found</Text>
            )
          )}
        </View>
      ) : (
        <ScrollView>
          <View style={styles.recentSearches}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              {recentSearches.length > 0 && (
                <TouchableOpacity 
                  onPress={async () => {
                    setRecentSearches([]);
                    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
                  }}
                >
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
            {recentSearches.length > 0 ? (
              recentSearches.map((search, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.recentSearchItem}
                  onPress={() => {
                    setSearchTerm(search);
                    setHasSearched(true);
                    executeSearch(activeTab);
                  }}
                >
                  <Ionicons name="time-outline" size={20} color="#666" />
                  <Text style={styles.recentSearchText}>{search}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyStateText}>No recent searches</Text>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#085DB7',
  },  
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  searchButton: {
    backgroundColor: '#085DB7',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    alignSelf: 'center',
    width: '60%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  recentSearches: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearText: {
    color: '#085DB7',
    fontWeight: '600',
    fontSize: 14,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  recentSearchText: {
    marginLeft: 10,
    fontSize: 16,
  },
  emptyStateText: {
    padding: 10,
    color: '#666',
    fontStyle: 'italic',
  },
  searchButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  resultsList: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F9FF',
    marginBottom: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#F0F0F0',
  },
  userDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userDegree: {
    fontSize: 14,
    color: '#666',
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  profileButton: {
    backgroundColor: '#4169E1',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  profileButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
  },
  activeTab: {
    backgroundColor: '#4169E1',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
});