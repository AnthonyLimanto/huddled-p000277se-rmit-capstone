import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Post } from '../model/post';

type PostCardProps = {
  post: Post;
};

const PostCard = ({ post }: PostCardProps) => {
    console.log('PostCard received post:', post); // Debugging: Log the post received by PostCard

  if (!post) {
    return <Text>No post data available.</Text>; // Handle undefined post
  }
  return (
    <View >
        <Text>From User ID: {post.user_id}</Text>
        <Text>Post ID: {post.id}</Text>
        <Text>Message: {post.content}</Text>
    </View>
  ); 
};

// const styles = StyleSheet.create({
//   container: { /* styles here */ },
//   username: { /* styles here */ },
//   content: { /* styles here */ },
//   image: { /* styles here */ },
//   timestamp: { /* styles here */ },
// });

export default PostCard;