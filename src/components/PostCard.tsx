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
  id: string;
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
  const [comments, setComments] = useState<Reply[]>([]);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [commentLikes, setCommentLikes] = useState<{ [key: string]: boolean }>({});
  const [showComments, setShowComments] = useState(false);

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

  const handleCommentLike = (id: string) => {
    setCommentLikes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handlePostComment = () => {
    if (commentText.trim()) {
      const newComment: Reply = {
        id: Date.now().toString(),
        text: commentText.trim(),
        children: []
      };
      setComments(prev => [...prev, newComment]);
      setCommentText('');
      if (!showComments) setShowComments(true);
    }
  };

  const handleReplyToggle = (id: string) => {
    setReplyingTo(replyingTo === id ? null : id);
  };

  const handleSendReply = (parentId: string) => {
    if (replyText.trim()) {
      const newReply: Reply = {
        id: Date.now().toString(),
        text: replyText.trim(),
        children: []
      };
      const updatedComments = addReplyToComment(comments, parentId, newReply);
      setComments(updatedComments);
      setReplyText('');
      // DONT auto-collapse replying box
      // setReplyingTo(null);
    }
  };

  const addReplyToComment = (list: Reply[], parentId: string, replyToAdd: Reply): Reply[] => {
    return list.map(comment => {
      if (comment.id === parentId) {
        return { ...comment, children: [...comment.children, replyToAdd] };
      } else if (comment.children.length > 0) {
        return { ...comment, children: addReplyToComment(comment.children, parentId, replyToAdd) };
      }
      return comment;
    });
  };

  const renderReplies = (replies: Reply[]) => {
    return replies.map((reply) => (
      <View key={reply.id} style={styles.replyRow}>
        <Pfp email={post.profile.email} name={post.profile.username} />
        <View style={styles.commentContent}>
          <View style={styles.commentBubble}>
            <Text style={styles.commentText}>{reply.text}</Text>

            <View style={styles.commentActions}>
              <TouchableOpacity onPress={() => handleCommentLike(reply.id)} style={styles.commentActionButton}>
                <MaterialIcons
                  name={commentLikes[reply.id] ? 'favorite' : 'favorite-border'}
                  size={14}
                  color={commentLikes[reply.id] ? '#e53935' : '#999'}
                />
                <Text style={styles.commentActionText}>{commentLikes[reply.id] ? '1' : '0'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleReplyToggle(reply.id)}>
                <Text style={styles.commentActionText}>Reply</Text>
              </TouchableOpacity>
            </View>

            {replyingTo === reply.id && (
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
                  <TouchableOpacity onPress={() => handleSendReply(reply.id)} style={styles.replyPostButton}>
                    <Text style={styles.replyPostButtonText}>Post</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {renderReplies(reply.children)}
          </View>
        </View>
      </View>
    ));
  };

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
            <Image source={{ uri: postImageUrl }} style={styles.postImage} resizeMode="contain" />
          </View>
        )}
      </View>

      {/* Like and Comment */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={handleLike} style={[styles.iconPill, { backgroundColor: likes > 0 ? '#fde8e8' : 'transparent' }]}>
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

      {/* Comments */}
      {showComments && comments.map((comment) => (
        <View key={comment.id} style={styles.commentRow}>
          <Pfp email={post.profile.email} name={post.profile.username} />
          <View style={styles.commentContent}>
            <View style={styles.commentBubble}>
              <Text style={styles.commentText}>{comment.text}</Text>

              <View style={styles.commentActions}>
                <TouchableOpacity onPress={() => handleCommentLike(comment.id)} style={styles.commentActionButton}>
                  <MaterialIcons
                    name={commentLikes[comment.id] ? 'favorite' : 'favorite-border'}
                    size={14}
                    color={commentLikes[comment.id] ? '#e53935' : '#999'}
                  />
                  <Text style={styles.commentActionText}>{commentLikes[comment.id] ? '1' : '0'}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleReplyToggle(comment.id)}>
                  <Text style={styles.commentActionText}>Reply</Text>
                </TouchableOpacity>
              </View>

              {replyingTo === comment.id && (
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
                    <TouchableOpacity onPress={() => handleSendReply(comment.id)} style={styles.replyPostButton}>
                      <Text style={styles.replyPostButtonText}>Post</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Show replies */}
              {renderReplies(comment.children)}
            </View>
          </View>
        </View>
      ))}

      {/* Always show comment box */}
      <View style={styles.commentBox}>
        <TextInput
          style={styles.commentInput}
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Leave your thoughts here ..."
          placeholderTextColor="#bbb"
          multiline
        />
        {commentText.trim().length > 0 && (
          <TouchableOpacity onPress={handlePostComment} style={styles.postButton}>
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default PostCard;

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
    padding: 4,
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
    marginTop: 4,
    marginBottom: 8,
  },
  commentBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 10,
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
    marginBottom: 4,
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
    gap: 16,
    marginTop: 6,
  },
  commentActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  commentActionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  replyBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  replyInput: {
    fontSize: 13,
    color: '#333',
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
  replyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    gap: 8,
    marginLeft: 40, 
  },
});