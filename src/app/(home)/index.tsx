import { useAuth } from '@/src/context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { fetchPosts } from '../../api/posts';
import Header from '../../components/Header';
import PostCard from '../../components/PostCard';
import { Post } from '../../model/post';

const keyExtractor = (post: Post, index: number) =>
  post?.id ? `${post.id}-${index}` : `${index}`;

const renderPost = ({ item }: { item: Post }) => <PostCard post={item} />;

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const [latestPostId, setLatestPostId] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const { user } = useAuth();

  const loadPosts = async (pageNum = 1, append = false) => {
    try {
      const fetchedPosts = await fetchPosts(user?.id ?? '');
      if (!fetchedPosts || fetchedPosts.length === 0) {
        setHasMore(false);
        return;
      }

      if (append) {
        const combined = [...posts, ...fetchedPosts];
        const uniqueMap = new Map<string, Post>();
        combined.forEach(post => {
          if (post?.id) uniqueMap.set(post.id, post);
        });
        setPosts(Array.from(uniqueMap.values()));
      } else {
        const latestFetchedId = fetchedPosts[0]?.id;
        if (latestPostId && latestFetchedId && latestFetchedId !== latestPostId) {
          setHasNewPosts(true); // 🔵 Show "New posts" button
        } else {
          setPosts(fetchedPosts);
          setLatestPostId(latestFetchedId);
        }
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const refreshPosts = async () => {
        const fetched = await fetchPosts(user?.id ?? '');
        if (fetched && fetched.length > 0) {
          setPosts(fetched);
          setLatestPostId(fetched[0].id);
          setHasNewPosts(false);
        }
      };
      refreshPosts();
    }, [user?.id])
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

  const scrollToTopAndRefresh = async () => {
    await loadPosts(); // Fetch latest posts
    setHasNewPosts(false);
    flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header />
      <FlatList
        ref={flatListRef}
        data={posts}
        renderItem={renderPost}
        keyExtractor={keyExtractor}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListHeaderComponent={
          hasNewPosts ? (
            <TouchableOpacity
              style={styles.newPostsButton}
              onPress={scrollToTopAndRefresh}
            >
              <Text style={styles.newPostsText}>New posts</Text>
            </TouchableOpacity>
          ) : null
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
    backgroundColor: '#CDECFF',
  },
  newPostsButton: {
    width: 160,
    height: 50,
    backgroundColor: '#075DB6',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 10,
    marginBottom: 30,
  },
  newPostsText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  feedContainer: {
    padding: 10,
  },
});
