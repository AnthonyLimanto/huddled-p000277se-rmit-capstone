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

const renderPost = ({ item }) => <PostCard post={item} />;
const keyExtractor = (post: Post) => post.id;

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = async (pageNum = 1, append = false) => {
    try {
      const fetchedPosts = await fetchPosts(pageNum);
      if (fetchedPosts.length === 0) {
        setHasMore(false);
        return;
      }
      if (append) {
        setPosts(prev => [...prev, ...fetchedPosts]);
      } else {
        setPosts(fetchedPosts);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
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
    return <ActivityIndicator style={{ marginVertical: 22 }} />;
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView>
        <Header />
        <View style={styles.newPostsButton}>
          <Text style={styles.newPostsText}>New posts</Text>
        </View>

        <View style={styles.feedContainer}>
          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={keyExtractor}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            // onEndReached={handleLoadMore}
            // onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
          />
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
