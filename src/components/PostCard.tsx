import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import React, { useEffect, useState } from "react";
import { MaterialIcons } from '@expo/vector-icons';
import { Pfp } from "./Pfp"; 
import { Post } from "../model/post";
import { downloadPostImage } from '../helper/bucketHelper';

type PostCardProps = {
  post: Post;
};

const howLongAgo = (postTime: Date) => {
  const postDate = new Date(postTime);
  const now = new Date();
  const diffMs = now.getTime() - postDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes === 1 ? '' : 's'}`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'}`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'}`;
};

const PostCard = ({ post }: PostCardProps) => {
  const [postImageUrl, setPostImageUrl] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<string[]>([]);
  const [showComments, setShowComments] = useState(true);

  const postDate = new Date(post.created_at);

  useEffect(() => {
    const fetchPostImage = async () => {
      try {
        const url = await downloadPostImage(post.id);
        setPostImageUrl(url);
      } catch (error) {
        console.error("Error downloading Post Image:", error);
      }
    };
    fetchPostImage();
  }, [post.id]);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(prev => liked ? prev - 1 : prev + 1);
  };

  const handlePostComment = () => {
    if (commentText.trim()) {
      setComments(prev => [...prev, commentText.trim()]);
      setCommentText('');
    }
  };

  if (!post) return <Text>No post data available.</Text>;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.userInfo}>
        <View style={styles.leftGroup}>
          <Pfp email={post.profile.email} name={post.profile.username} />
          <View>
            <Text style={styles.username}>{post.profile.username}</Text>
            <Text style={styles.degree}>{post.profile.degree}</Text>
          </View>
        </View>
        <Text style={styles.timestamp}>{howLongAgo(postDate)}</Text>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.postContent}>{post.content}</Text>
        {postImageUrl && (
          <Image
          source={{ uri: postImageUrl }}
          style={styles.postImage}
          resizeMode="contain"  
        />
        )}
      </View>

      {/* Like + Comment */}
      <View style={styles.actionsContainer}>
        {/* Like */}
        <TouchableOpacity
          onPress={handleLike}
          style={[styles.iconPill, { backgroundColor: likes > 0 ? '#fde8e8' : 'transparent' }]}
        >
          <MaterialIcons
            name={liked ? 'favorite' : 'favorite-border'}
            size={20}
            color={likes > 0 ? '#e53935' : '#999'}
          />
          <Text style={[styles.iconPillText, { color: likes > 0 ? '#1f1f1f' : '#999' }]}>{likes}</Text>
        </TouchableOpacity>

        {/* Comment */}
        <View style={[styles.iconPill, { backgroundColor: comments.length > 0 ? '#e6f0ff' : 'transparent' }]}>
          <MaterialIcons
            name="chat-bubble-outline"
            size={20}
            color={comments.length > 0 ? '#1357DA' : '#999'}
          />
          <Text style={[styles.iconPillText, { color: comments.length > 0 ? '#1f1f1f' : '#999' }]}>{comments.length}</Text>
        </View>

        {/* View/Hide Comments */}
        <TouchableOpacity onPress={() => setShowComments(prev => !prev)}>
          <Text style={styles.viewHideText}>
            {showComments ? 'Hide all' : 'View all comments'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Comment Input */}
      <View style={styles.commentBox}>
        <TextInput
          style={styles.commentInput}
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Leave your thoughts here ..."
          placeholderTextColor="#bbb"
          multiline
          underlineColorAndroid="transparent"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {commentText.trim().length > 0 && (
          <TouchableOpacity onPress={handlePostComment} style={styles.postButton}>
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Comments List */}
      {showComments && comments.map((comment, idx) => (
        <View key={idx} style={styles.commentRow}>
          <Pfp email={post.profile.email} name={post.profile.username} />
          <View style={styles.commentContent}>
            <View style={styles.commentBubble}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentUsername}>You</Text>
                <Text style={styles.commentTime}>Just now</Text>
              </View>
              <Text style={styles.commentText}>{comment}</Text>
            </View>
            <View style={styles.commentActions}>
              <TouchableOpacity style={styles.commentActionButton}>
                <MaterialIcons name="favorite" size={14} color="#e53935" />
                <Text style={styles.commentActionText}>2</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.commentActionText}>Hide Replies</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 20,
    marginBottom: 12,
    width: '100%',
    alignSelf: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1D1D1D',
  },
  degree: {
    fontSize: 13,
    fontWeight: '600',
    color: '#777',
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  contentContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  postContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
    overflow: 'hidden',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
    gap: 12,
  },
  iconPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  iconPillText: {
    fontSize: 16,
    fontWeight: '600',
  },
  viewHideText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
  },
  commentBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 5,
    minHeight: 45,
    justifyContent: 'center',
    position: 'relative',
  },
  commentInput: {
    fontSize: 13,
    color: '#333',
    padding: 0,
    margin: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  postButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: '#1357DA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
    gap: 8,
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  commentUsername: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
  },
  commentText: {
    fontSize: 13,
    color: '#333',
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
    paddingLeft: 4,
  },
  commentActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  commentActionText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
});

export default PostCard;
