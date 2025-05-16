import React from 'react';
import { View, Text, StyleSheet, TextInput, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SearchScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Search</Text>
        </View>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              placeholder="Search..."
              placeholderTextColor="#999"
              style={styles.searchInput}
            />
          </View>
          
          <View style={styles.recentSearches}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <View style={styles.recentSearchItem}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.recentSearchText}>React Native</Text>
            </View>
            <View style={styles.recentSearchItem}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.recentSearchText}>Expo Router</Text>
            </View>
            <View style={styles.recentSearchItem}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.recentSearchText}>Mobile Navigation</Text>
            </View>
          </View>
          
          <View style={styles.trendingSection}>
            <Text style={styles.sectionTitle}>Trending</Text>
            <View style={styles.trendingItem}>
              <Text style={styles.trendingNumber}>1</Text>
              <Text style={styles.trendingText}>React Native</Text>
            </View>
            <View style={styles.trendingItem}>
              <Text style={styles.trendingNumber}>2</Text>
              <Text style={styles.trendingText}>Supabase</Text>
            </View>
            <View style={styles.trendingItem}>
              <Text style={styles.trendingNumber}>3</Text>
              <Text style={styles.trendingText}>CometChat</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  recentSearches: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
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
  trendingSection: {
    marginTop: 10,
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  trendingNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 15,
    color: '#0066CC',
  },
  trendingText: {
    fontSize: 16,
  },
});