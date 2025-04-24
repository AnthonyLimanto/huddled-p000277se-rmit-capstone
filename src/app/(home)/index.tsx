import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from "react";
import {
  FlatList,
  SafeAreaView,
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
import { useAuth } from '@/src/context/AuthContext';

const keyExtractor = (post: Post, index: number) =>
  post?.id ? `${post.id}-${index}` : `${index}`;

const renderPost = ({ item }) => <PostCard post={item} />;

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const {user} = useAuth();
  console.log(user);

  const loadPosts = async (pageNum = 1, append = false) => {
    try {
      const fetchedPosts = await fetchPosts(user?.id ?? '');
      if (fetchedPosts.length === 0) {
        setHasMore(false);
        return;
      }

      if (append) {
        // Optional: Deduplicate posts if needed
        const combined = [...posts, ...fetchedPosts];
        const uniqueMap = new Map();
        combined.forEach(post => {
          if (post?.id) uniqueMap.set(post.id, post);
        });
        setPosts(Array.from(uniqueMap.values()));
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
    if (!isLoadingMore && !hasMore) {
      return (
        <View style={{ alignItems: 'center', marginVertical: 20 }}>
          <Text style={{ color: '#888' }}>No more posts</Text>
        </View>
      );
    }

    if (isLoadingMore) {
      return <ActivityIndicator style={{ marginVertical: 22 }} />;
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={keyExtractor}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListHeaderComponent={
          <>
            <Header />
            <View style={styles.newPostsButton}>
              <Text style={styles.newPostsText}>New posts</Text>
            </View>
          </>
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={styles.feedContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
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
