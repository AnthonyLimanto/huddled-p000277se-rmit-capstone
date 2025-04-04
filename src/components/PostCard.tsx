import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Avatar } from '@rneui/themed';
import { Post } from '../model/post'; // Your post model
import { downloadPfp } from '../helper/bucketHelper'; // Download helper

type PostCardProps = {
  post: Post;
};

// Calculate "how long ago" the post was made
const howLongAgo = (postTime: Date) => {
  const timeInMins = Math.abs(Math.round((Date.now() - postTime.getTime()) / (1000 * 60))) - 660; // Minus 11 hours (timezone diff)

  if (timeInMins < 60) {
    return `${timeInMins} minute${timeInMins === 1 ? '' : 's'}`;
  }
  const timeInHours = Math.round(timeInMins / 60);
  if (timeInHours < 24) {
    return `${timeInHours} hour${timeInHours === 1 ? '' : 's'}`;
  }
  const timeInDays = Math.round(timeInHours / 24);
  return `${timeInDays} day${timeInDays === 1 ? '' : 's'}`;
};

const PostCard = ({ post }: PostCardProps) => {
  const [pfpUrl, setPfpUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchPfp = async () => {
      if (post.users?.email) {
        try {
          const url = await downloadPfp(post.users.email);
          setPfpUrl(url);
          console.log('Profile picture URL:', url);
        } catch (error) {
          console.error('Error downloading profile picture:', error);
        }
      }
    };

    fetchPfp();

    return () => {
      if (pfpUrl) {
        URL.revokeObjectURL(pfpUrl);
      }
    };
  }, [post.users?.email]);

  if (!post) {
    return <Text>No post data available.</Text>;
  }

  const postDate = new Date(post.created_at);

  const pfp = () => {
    if (pfpUrl && pfpUrl !== "default") {
      return (
        <Avatar
          size={40}
          rounded
          source={{ uri: pfpUrl }}
          containerStyle={{ backgroundColor: '#fff' }}
        />
      );
    } else {
      const firstLetter = post.users?.username?.[0]?.toUpperCase() || '?';
      return (
        <Avatar
          size={40}
          rounded
          title={firstLetter}
          containerStyle={{ backgroundColor: '#ccc' }}
          titleStyle={{ color: '#fff', fontWeight: 'bold' }}
        />
      );
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.userInfo}>
        <View style={styles.leftGroup}>
          {pfp()}
          <View>
            <Text style={styles.username}>
              {post.users?.username || 'Unknown User'}
            </Text>
            <Text style={styles.degree}>
              {post.users?.degree || ''}
            </Text>
          </View>
        </View>
        <Text style={styles.timestamp}>
          {howLongAgo(postDate)} ago
        </Text>
      </View>

      <View>
        <Text>From User ID: {post.users?.username || 'Unknown'}</Text>
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
    color: '#777',
    fontSize: 14,
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
  },
  degree: {
    fontWeight: 'bold',
    color: '#777',
    fontSize: 14,
  },
  content: {
    fontSize: 14,
    color: "#333",
  },
});

export default PostCard;
