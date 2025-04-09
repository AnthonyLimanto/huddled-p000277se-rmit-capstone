import { View, Text, StyleSheet, Image } from 'react-native';
import React, { useEffect, useState } from "react";
import { Pfp } from "./Pfp"; 
import { Post } from "../model/post";
import { downloadPostImage } from '../helper/bucketHelper';

type PostCardProps = {
  post: Post;
};


// Calculate "how long ago" the post was made
const howLongAgo = (postTime: Date) => {
  const timeInMins = Math.abs(Math.round((Date.now() - postTime.getTime()) / (1000 * 60))) - 600; // Minus 11 hours (timezone diff)

  if (timeInMins < 60) {
    return `${timeInMins} minute${timeInMins === 1 ? "" : "s"}`;
  }

  const timeInHours = Math.round(timeInMins / 60);
  if (timeInHours < 24) {
    return `${timeInHours} hour${timeInHours === 1 ? "" : "s"}`;
  }

  const timeInDays = Math.round(timeInHours / 24);
  return `${timeInDays} day${timeInDays === 1 ? "" : "s"}`;
};

const PostCard = ({ post }: PostCardProps) => {
  const [postImageUrl, setPostImageUrl] = useState<string | null>(null);
  useEffect(() => {
      const fetchPostImage = async () => {
        try {
          const url = await downloadPostImage(post.id); 
          setPostImageUrl(url);
          console.log("Post Image URL:", url);
        } catch (error) {
          console.error("Error downloading Post Image:", error);
        }
      };
  
      fetchPostImage();
  
      // Cleanup the temporary URL when the component unmounts
      return () => {
        if (postImageUrl) {
          URL.revokeObjectURL(postImageUrl);
        }
      };
    }, [post.id]);

const postDate = new Date(post.created_at);

  if (!post) {
    return <Text>No post data available.</Text>;
  }

  return (
    <View style={styles.card}>
      <View style={styles.userInfo}>
        <View style={styles.leftGroup}>
          <Pfp email={post.profile.email} name={post.profile.username} />
          <View>
            <Text style={styles.username}>
              {post.profile?.username || 'Unknown User'}
            </Text>
            <Text style={styles.degree}>
              {post.profile?.degree || ''}
            </Text>
          </View>
        </View>
        <Text style={styles.timestamp}>
          {howLongAgo(postDate)} ago
        </Text>
      </View>
      <View>
        <Text>From User ID: {post.profile?.username || 'Unknown'}</Text>
        <Text>Post ID: {post.id}</Text>
        <Text>Message: {post.content}</Text>
        {postImageUrl && (
          <View>
            <Text>Post Image:</Text>
            <Image
              source={{ uri: postImageUrl }}
              style={{ width: 100, height: 100, borderRadius: 10 }}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginVertical: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: '100%',
    marginHorizontal: 0,
    alignSelf: 'stretch',
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    gap: 8,
  },
  timestamp: {
    color: "#777",
    fontSize: 14,
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
  },
  degree: {
    fontWeight: "bold",
    color: "#777",
    fontSize: 14,
  },
});

export default PostCard;
