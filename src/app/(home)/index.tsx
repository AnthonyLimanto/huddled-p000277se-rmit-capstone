import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Huddled</Text>
          <View style={styles.notificationIcon} />
        </View>
        
        <View style={styles.newPostsButton}>
          <Text style={styles.newPostsText}>New posts</Text>
        </View>
        
        <View style={styles.feedContainer}>
          {/* Feed content placeholder */}
          <View style={styles.postItem}>
            <View style={styles.postHeader}>
              <View style={styles.avatar} />
              <View>
                <Text style={styles.userName}>User Name</Text>
                <Text style={styles.postTime}>3 mins</Text>
              </View>
            </View>
            <Text style={styles.postContent}>
              Example post content would go here...
            </Text>
          </View>
          
          <View style={styles.postItem}>
            <View style={styles.postHeader}>
              <View style={styles.avatar} />
              <View>
                <Text style={styles.userName}>Another User</Text>
                <Text style={styles.postTime}>15 mins</Text>
              </View>
            </View>
            <Text style={styles.postContent}>
              Another example post content...
            </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  newPostsButton: {
    backgroundColor: '#0066CC',
    borderRadius: 20,
    padding: 10,
    margin: 10,
    alignItems: 'center',
  },
  newPostsText: {
    color: 'white',
    fontWeight: 'bold',
  },
  feedContainer: {
    padding: 10,
  },
  postItem: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#DDD',
    marginRight: 12,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  postTime: {
    color: '#777',
    fontSize: 14,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 22,
  },
});