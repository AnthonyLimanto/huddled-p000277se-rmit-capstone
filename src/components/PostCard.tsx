import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Pfp } from "./Pfp"; 
import { Post } from "../model/post";

type PostCardProps = {
  post: Post;
};

const howLongAgo = (postTime: Date) => {
  const timeInMins = Math.abs(Math.round((Date.now() - postTime.getTime()) / (1000 * 60))) - 660; // Minus 11 hours because of time difference in the database

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
            <Text style={styles.username}>{post.profile.username}</Text>
            <Text style={styles.degree}>{post.profile.degree}</Text>
          </View>
        </View>
        <Text style={styles.timestamp}>{howLongAgo(postDate)} ago</Text>
      </View>
      <View>
        <Text>From User ID: {post.profile.username}</Text>
        <Text>Post ID: {post.id}</Text>
        <Text>Message: {post.content}</Text>
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
    width: "100%", // Makes card fill container width
    marginHorizontal: 0, // Removes side margins
    alignSelf: "stretch", // Ensures full width in flex containers
  },
  userInfo: {
    flexDirection: "row", // Horizontal layout
    justifyContent: "space-between", // Push timestamp to far right
    alignItems: "flex-end", // Align timestamp to bottom
    marginBottom: 8,
  },
  leftGroup: {
    flexDirection: "row", // PFP and username in a row
    alignItems: "center", // Center vertically
    marginRight: 20,
    gap: 8, // Space between PFP and username
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