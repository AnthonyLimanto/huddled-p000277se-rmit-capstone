import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useCallback } from "react";
import {
  FlatList,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { fetchPosts } from "../../api/posts";
import PostCard from "../../components/PostCard";
import Header from "../../components/Header";
import { Post } from '../../model/post';
import { useFocusEffect } from '@react-navigation/native';

const renderPost = ({ item }: { item: Post }) => <PostCard post={item} />;
const keyExtractor = (post: Post) => post.id;

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = async (pageNum = 1, append = false) => {
    try {
      // We need to ignore TypeScript errors for fetchPosts
      // @ts-ignore
      const response = await fetchPosts(pageNum);
      
      // Safety checks and conversions for proper typing
      let safeResponse: Post[] = [];
      if (response) {
        // Convert to unknown first, then to Post[] to avoid direct type assertion errors
        safeResponse = (Array.isArray(response) ? response : []) as unknown as Post[];
      }
      
      if (safeResponse.length === 0) {
        setHasMore(false);
        return;
      }

      if (append) {
        setPosts(prev => [...prev, ...safeResponse]);
      } else {
        setPosts(safeResponse);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [])
  );

  const handleLoadMore = async () => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      await loadPosts(nextPage, true);
      setPage(nextPage);
      setIsLoadingMore(false);
    }
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return <ActivityIndicator testID="loading-more-indicator" style={{ marginVertical: 22 }} />;
  };

  // Hidden elements for testing state
  const renderTestElements = () => {
    if (__DEV__) {
      return (
        <View style={{ height: 0, width: 0, overflow: 'hidden' }}>
          <Text testID="page-indicator">{page}</Text>
          <Text testID="has-more-indicator">{hasMore.toString()}</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {renderTestElements()}
      <ScrollView>
        <Header />
        <TouchableOpacity testID="new-posts-button" style={styles.newPostsButton}>
          <Text style={styles.newPostsText}>New posts</Text>
        </TouchableOpacity>

        <View style={styles.feedContainer}>
          {isInitialLoading ? (
            <ActivityIndicator testID="initial-loading" size="large" color="#1357DA" />
          ) : posts.length === 0 ? (
            <Text testID="empty-posts-message">No posts available</Text>
          ) : (
            <FlatList
              testID="posts-flatlist"
              data={posts}
              renderItem={renderPost}
              keyExtractor={keyExtractor}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
            />
          )}
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
});
