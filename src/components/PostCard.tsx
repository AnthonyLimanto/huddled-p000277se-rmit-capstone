import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import React, { useEffect, useMemo, useState } from "react";
import { MaterialIcons } from '@expo/vector-icons';
import { Pfp } from "./Pfp";
import { Post } from "../model/post";
import { downloadPostImage } from '../helper/bucketHelper';
import { useAuth } from '../context/AuthContext';
import { Comment, CommentCreate } from '../model/comment';
import { createComment, fetchComments, fetchCommentsByParentId } from '../api/comments';

type PostCardProps = {
  post: Post;
};

type Reply = Comment;

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
  const [postImageUrl, setPostImageUrl] = useState<string[]>([]);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState<Reply[]>([]);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [commentLikes, setCommentLikes] = useState<{ [key: string]: boolean }>({});
  const [showComments, setShowComments] = useState(false);

  const { user } = useAuth();

  const { created_at, image_url, id } = post || {};

  const postDate = new Date(created_at);

  const postImageArr = useMemo(() => {
    if (!image_url || image_url === 'default') {
      return [];
    }
    return image_url.split(',');
  }, [image_url]);

  useEffect(() => {
    const fetchPostImage = async () => {
      try {
        if (postImageArr.length === 0) {
          return;
        }
        if (Platform.OS === 'web') {
          const url = await downloadPostImage(post.id, postImageArr) as string[];
          setPostImageUrl(url);
        } else {
          setPostImageUrl(postImageArr);
        }
      } catch (error) {
        console.error("Error downloading Post Image:", error);
      }
    };
    fetchPostImage();
  }, [post.id, postImageArr]);

  const fetchCommentsForPost = async () => {
    try {
      const res = await fetchComments(post.id);
      if (res) {
        setComments(res as Reply[]);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const updateComments = (oldComments: Reply[], parentId: string, comments: Reply[]): Reply[] => {
    const updatedComments = oldComments.map((comment: Reply) => {
      if (comment.id === parentId) {
        return { ...comment, children: comments };
      } else if ((comment.children ?? []).length > 0) {
        return { ...comment, children: updateComments(comment.children ?? [], parentId, comments) };
      }
      return comment;
    });
    return updatedComments
  }

  const fetchCommentsForComment = async (parentId: string) => {
    try {
      const res = await fetchCommentsByParentId(parentId);
      if (res) {
        setComments(prev => {
          return updateComments(prev, parentId, res as Reply[]);
        }
        );
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    fetchCommentsForPost();
  }, [post.id]);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(prev => liked ? prev - 1 : prev + 1);
  };

  const handlePostComment = async () => {
    if (commentText.trim()) {
      const newComment: CommentCreate = {
        user_id: user?.id || '',
        post_id: post.id,
        content: commentText.trim(),
      };
      await createComment(newComment);
      fetchCommentsForPost();
      setCommentText('');
      if (!showComments) setShowComments(true);
    }
  };

  const handleCommentLike = (id: string) => {
    setCommentLikes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleReplyToggle = (id: string) => {
    setReplyingTo(replyingTo === id ? null : id);
  };

  const handleSendReply = async (parentId: string, reply: Reply) => {
    if (replyText.trim()) {
      const newReply: CommentCreate = {
        content: replyText.trim(),
        user_id: user?.id || '',
        post_id: post.id,
        parent_id: parentId,
      };
      if (reply.count) {
        reply.count[0].count += 1;
      }
      await createComment(newReply);
      await fetchCommentsForComment(parentId);
      setReplyText('');
      setReplyingTo(null);
    }
  };

  const addReplyToComment = (list: Reply[], parentId: string, replyToAdd: Reply): Reply[] => {
    return list.map(comment => {
      if (comment.id === parentId) {
        return { ...comment, children: [...(comment.children ?? []), replyToAdd] };
      } else if ((comment.children ?? []).length > 0) {
        return { ...comment, children: addReplyToComment(comment.children ?? [], parentId, replyToAdd) };
      }
      return comment;
    });
  };

  const allCommentsCount = useMemo(() => post.count?.[0].count || 0, [post.count]);

  const renderReplies = (replies: Reply[], level = 0) => {
    if (level > 3) return null;

    return replies.map((reply) => {

      const count = reply.count?.[0].count || 0;

      const bubble = (
        <View style={level > 0 ? styles.replyBubble : styles.commentBubble}>
          <Text style={styles.commentText}>{reply.content}</Text>
          <View style={styles.commentActions}>
            <TouchableOpacity onPress={() => handleCommentLike(reply.id)} style={styles.commentActionButton}>
              <MaterialIcons
                name={commentLikes[reply.id] ? 'favorite' : 'favorite-border'}
                size={14}
                color={commentLikes[reply.id] ? '#e53935' : '#999'}
              />
              <Text style={styles.commentActionText}>{commentLikes[reply.id] ? '1' : '0'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              fetchCommentsForComment(reply.id);
            }}>
              <View style={[styles.iconPill, { backgroundColor: count > 0 ? '#e6f0ff' : 'transparent' }]}>
                <MaterialIcons name="chat-bubble-outline" size={20} color={count > 0 ? '#1357DA' : '#999'} />
                <Text style={[styles.iconPillText, { color: count > 0 ? '#1f1f1f' : '#999' }]}>{count}</Text>
              </View>
            </TouchableOpacity>
            {level < 3 && (
              <TouchableOpacity onPress={() => handleReplyToggle(reply.id)}>
                <Text style={styles.commentActionText}>Reply</Text>
              </TouchableOpacity>
            )}
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
                <TouchableOpacity onPress={() => handleSendReply(reply.id, reply)} style={styles.replyPostButton}>
                  <Text style={styles.replyPostButtonText}>Post</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {renderReplies(reply.children ?? [], level + 1)}
        </View>
      );
    
      const content = (
        <View key={reply.id} style={level > 0 ? styles.replyRow : styles.commentRow}>
          <Pfp email={reply.user?.email ?? ''} name={reply.user?.username ?? ''} size={level > 0 ? 24 : undefined} />
          {level > 0 ? bubble : (
            <View style={styles.commentContent}>
              {bubble}
            </View>
          )}
        </View>
      );

      return level > 0 ? (
        <View key={reply.id} style={[styles.replyWrapper]}>
          <View style={styles.threadLine} />
          {content}
        </View>
      ) : content;
    });
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
        {
          (postImageUrl || []).map((image, idx) => {
            return (
              <View style={styles.imageContainer} key={idx}>
                <Image
                  source={{
                    uri: Platform.OS === 'web' ? image : `https://leqcmbvpugjvyzlxxmgs.supabase.co/storage/v1/object/public/post-image/${id}/${image}`,
                  }}
                  style={styles.postImage}
                  resizeMode="contain"
                />
              </View>
            );
          })
        }
      </View>

      {/* Like + Comment */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={handleLike} style={[styles.iconPill, { backgroundColor: likes > 0 ? '#fde8e8' : 'transparent' }]}>
          <MaterialIcons name={liked ? 'favorite' : 'favorite-border'} size={20} color={likes > 0 ? '#e53935' : '#999'} />
          <Text style={[styles.iconPillText, { color: likes > 0 ? '#1f1f1f' : '#999' }]}>{likes}</Text>
        </TouchableOpacity>

        <View style={[styles.iconPill, { backgroundColor: allCommentsCount > 0 ? '#e6f0ff' : 'transparent' }]}>
          <MaterialIcons name="chat-bubble-outline" size={20} color={allCommentsCount > 0 ? '#1357DA' : '#999'} />
          <Text style={[styles.iconPillText, { color: allCommentsCount > 0 ? '#1f1f1f' : '#999' }]}>{allCommentsCount}</Text>
        </View>

        {allCommentsCount > 0 && (
          <TouchableOpacity onPress={() => setShowComments(prev => !prev)}>
            <Text style={styles.viewHideText}>
              {showComments ? 'Hide all' : 'View all comments'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Comments */}
      {showComments && renderReplies(comments)}

      {/* Input */}
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
    backgroundColor: '#fff',
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
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    borderColor: '#ddd',
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
  },
  commentBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 10,
    minHeight: 45,
    justifyContent: 'center',
    position: 'relative',
  },
  commentInput: {
    fontSize: 13,
    color: '#333',
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
    marginTop: 14,
    paddingLeft: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 10,
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
  replyWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    marginLeft: 20,
  },
  threadLine: {
    width: 2,
    backgroundColor: '#ccc',
    marginRight: 8,
    borderRadius: 1,
  },
  replyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  replyBubble: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderColor: '#e6e6e6',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 4,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
});