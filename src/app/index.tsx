import { FlatList, Text, View } from "react-native";
import { fetchPosts } from "../api/posts";
import PostCard from "../components/PostCard";
import { Post } from '../model/post';
import { useEffect, useState } from "react";
import { completeSignUp } from "../api/users";

const renderPost = ({item}) => (
  <PostCard post={item} />
)

const keyExtractor = (post) => post.id;

export default function Index() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const fetchedPosts = await fetchPosts(); 
        setPosts(fetchedPosts);
        // console.log(completeSignUp("examplasdasdsd12easdasdasda123s@domain.com", "password123ASD@", "usasderasdasdna123measdas1231", "EXAMPLE DEGREE", null))
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      }
    };

    loadPosts(); 
  }, []);
  return (
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
  );
}
