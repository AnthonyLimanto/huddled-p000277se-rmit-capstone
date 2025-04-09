import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import React, { useEffect, useState } from "react";
import { MaterialIcons } from '@expo/vector-icons';
import { Pfp } from "./Pfp"; 
import { Post } from "../model/post";
import { downloadPostImage } from '../helper/bucketHelper';

type PostCardProps = {
  post: Post;
};

type Reply = {
  text: string;
  children: Reply[];
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
  const [commentLikes, setCommentLikes] = useState<{ [key: number]: boolean }>({});
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState<{ [key: number]: Reply[] }>({});
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

  const handleCommentLike = (index: number) => {
    setCommentLikes(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleReplyToggle = (index: number) => {
    if (replyingTo === index) {
      setReplyingTo(null); // close if already open
    } else {
      setReplyingTo(index); // open reply box under comment
    }
  };

  const handleSendReply = (index: number) => {
    if (replyText.trim()) {
      setReplies(prev => ({
        ...prev,
        [index]: [...(prev[index] || []), replyText.trim()]
      }));
      setReplyText('');
      setReplyingTo(null); // close input after sending
    }
  };

  if (!post) return <Text>No post data available.</Text>;

  return (
    <View style={styles.card}>
      {/* Post Header */}
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

      {/* Post Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.postContent}>{post.content}</Text>
        {postImageUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: postImageUrl }}
              style={styles.postImage}
              resizeMode="contain"
            />
          </View>
        )}
      </View>

      {/* Like + Comment Buttons */}
      <View style={styles.actionsContainer}>
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

        <View style={[styles.iconPill, { backgroundColor: comments.length > 0 ? '#e6f0ff' : 'transparent' }]}>
          <MaterialIcons
            name="chat-bubble-outline"
            size={20}
            color={comments.length > 0 ? '#1357DA' : '#999'}
          />
          <Text style={[styles.iconPillText, { color: comments.length > 0 ? '#1f1f1f' : '#999' }]}>{comments.length}</Text>
        </View>

        {comments.length > 0 && (
          <TouchableOpacity onPress={() => setShowComments(prev => !prev)}>
            <Text style={styles.viewHideText}>
              {showComments ? 'Hide all' : 'View all comments'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Comments Section */}
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

            {/* Like + Reply under each comment */}
            <View style={styles.commentActions}>
              <TouchableOpacity
                onPress={() => handleCommentLike(idx)}
                style={styles.commentActionButton}
              >
                <MaterialIcons
                  name={commentLikes[idx] ? 'favorite' : 'favorite-border'}
                  size={14}
                  color={commentLikes[idx] ? '#e53935' : '#999'}
                />
                <Text style={styles.commentActionText}>
                  {commentLikes[idx] ? '1' : '0'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleReplyToggle(idx)}>
                <Text style={styles.commentActionText}>Reply</Text>
              </TouchableOpacity>
            </View>

            {/* Reply Input Box */}
            {replyingTo === idx && (
              <View style={styles.replyBox}>
                <TextInput
                  style={styles.replyInput}
                  placeholder="Write a reply..."
                  placeholderTextColor="#bbb"
                  value={replyText}
                  onChangeText={setReplyText}
                  multiline
                />
                {replyText.trim().length > 0 && (
                  <TouchableOpacity
                    onPress={() => handleSendReply(idx)}
                    style={styles.replyPostButton}
                  >
                    <Text style={styles.replyPostButtonText}>Post</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Replies under this comment */}
            {replies[idx]?.map((reply, rIdx) => (
              <View key={rIdx} style={styles.replyRow}>
                <Pfp email={post.profile.email} name={post.profile.username} />
                <View style={styles.replyBubble}>
                  <Text style={styles.replyText}>{reply}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}

      {/* Leave your thoughts Input at Bottom */}
      {showComments && (
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
      )}

      {/* Hide All at Bottom */}
      {comments.length > 0 && showComments && (
        <View style={styles.hideAllContainer}>
          <TouchableOpacity onPress={() => setShowComments(false)}>
            <Text style={styles.viewHideText}>Hide all</Text>
          </TouchableOpacity>
        </View>
      )}
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
  imageContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#fff', 
    borderRadius: 10,
    overflow: 'hidden',
    padding: 4, // gap between border and image
  },
  postImage: {
    width: '100%',
    height: 220,
    borderRadius: 8,
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
    color: '#666',
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
  hideAllContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  replyBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
  },
  replyInput: {
    fontSize: 13,
    color: '#333',
  },
  replyInputBox: {
    backgroundColor: '#f0f9ff',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    marginLeft: 45, 
    minHeight: 40,
    position: 'relative',
  },
  replyButton: {
    backgroundColor: '#1357DA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  replyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  replyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    marginLeft: 40, // indent reply under comment
    gap: 8,
  },
  replyBubble: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 8,
    flex: 1,
  },
  replyPostButton: {
    position: 'absolute',
    right: 10,
    bottom: 8,
    backgroundColor: '#1357DA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  replyPostButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  replyText: {
    fontSize: 13,
    color: '#333',
  },
});


export default PostCard;
