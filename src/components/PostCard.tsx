import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Avatar } from '@rneui/themed';
import { Post } from '../model/post';
import { downloadPfp } from '../helper/bucketHelper'; // Adjust the import path as necessary


type PostCardProps = {
  post: Post;
};



const howLongAgo = (postTime: Date) => {
  const timeInMins = Math.abs(Math.round((Date.now() - postTime.getTime()) / (1000 * 60))) - 660; // Miuns 11 hours because of time difference in the database

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
      try {
        const url = await downloadPfp(post.profile.email);
        setPfpUrl(url);
        console.log('Profile picture URL:', url);
      } catch (error) {
        console.error('Error downloading profile picture:', error);
      }
    };

    fetchPfp();

    // Cleanup the temporary URL when the component unmounts
    return () => {
      if (pfpUrl) {
        URL.revokeObjectURL(pfpUrl);
      }
    };
  }, []);
  let postDate = new Date(post.created_at)
  
  if (!post) {
    return <Text>No post data available.</Text>; 
  }

  const pfp = () => {
    if (pfpUrl != "default") {
      // Render Avatar with the profile picture
      return (
        <Avatar
          size={40}
          rounded
          source={{ uri: pfpUrl }} 
          containerStyle={{
            backgroundColor: '#fff', 
          }}
          key={post.id}
        />
      );
    } else {
      // Render Avatar with the first letter of the username
      return (
        <Avatar
          size={40}
          rounded
          title={post.profile.username[0].toUpperCase()} // First letter of the username
          containerStyle={{
            backgroundColor: '#ccc', 
          }}
          titleStyle={{
            color: '#fff', 
            fontWeight: 'bold',
          }}
          key={post.id}
        />
      );
    }
  };
  return (

    <View style={styles.card}>
      <View style={styles.userInfo}>
        <View style={styles.leftGroup}>
          <View />
          {pfp()}
          <View>
            <Text style={styles.username}>{post.profile.username}</Text>
            <Text style={styles.degree}>{post.profile.degree}</Text>
          </View>
        </View>
        <Text style={styles.timestamp}>{howLongAgo(postDate)} ago</Text>
      </View>
      <View >
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
    width: '100%',        // Makes card fill container width
    marginHorizontal: 0,  // Removes side margins
    alignSelf: 'stretch', // Ensures full width in flex containers
  },
  userInfo: {
    flexDirection: 'row',       // Horizontal layout
    justifyContent: 'space-between', // Push timestamp to far right
    alignItems: 'flex-end',     // Align timestamp to bottom
    marginBottom: 8, 
  },
  leftGroup: {
    flexDirection: 'row',       // PFP and username in a row
    alignItems: 'center',       // Center vertically
    marginRight: 20,
    gap: 8,                     // Space between PFP and username
  },
  timestamp: {
    color: '#777',
    fontSize: 14,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20, // Circular image
    marginRight: 1, // Space between PFP and username
    backgroundColor: 'black' // Placeholder
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