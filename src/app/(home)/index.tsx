import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from "react";
import { FlatList, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fetchPosts } from "../../api/posts";
import PostCard from "../../components/PostCard";
import Header from "../../components/Header";
import { Post } from '../../model/post';
import { useFocusEffect } from '@react-navigation/native';

const renderPost = ({item}) => (
  <PostCard post={item} />
)

const keyExtractor = (post) => post.id;

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);

  const loadPosts = async () => {
    try {
      const fetchedPosts = await fetchPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  // Refresh posts when the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [])
  );
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView>
        <Header/>
        
        <View style={styles.newPostsButton}>
          <Text style={styles.newPostsText}>New posts</Text>
        </View>
        
        <View style={styles.feedContainer}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
            >
            <FlatList
              data={posts}
              renderItem={renderPost}
              keyExtractor={keyExtractor}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            />
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
  
  newPostsButton: {
    width: 150,
    height: 40,
    backgroundColor: '#1357DA',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 10,
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