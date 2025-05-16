import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import React, { useEffect, useMemo, useState } from "react";
import { MaterialIcons } from '@expo/vector-icons';
import { Pfp } from "./Pfp";
import { Post } from "../model/post";
import { downloadPostImage } from '../helper/bucketHelper';
import { useAuth } from '../context/AuthContext';
import { Comment, CommentCreate } from '../model/comment';
import { createComment, fetchCommentById, fetchComments, fetchCommentsByLayerId } from '../api/comments';
import { addPostLike, deletePostLike, fetchPostLikeInfo } from '../api/post_likes';
import { addCommentLike, deleteCommentLike } from '../api/comment_likes';
import ImagePreview from './ImagePreview';
import { useRouter } from 'expo-router';

type PostCardProps = {
  post: Post;
};

type Reply = Comment;

const howLongAgo = (postTime: Date) => {
  const postDate = new Date(postTime.getTime() + 10 * 60 * 60 * 1000); // Subtract 9 hours
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
  const [liked, setLiked] = useState(!!(post.isLike?.length ?? 0));
  const [likes, setLikes] = useState(post.likes?.[0].count ?? 0);
  const [comments, setComments] = useState<Reply[]>([]);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [showPreview, setShowPreview] = useState({show: false, init: 0});
  const router = useRouter();

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
      const res = await fetchComments(post.id, user?.id ?? '');
      if (res) {
        setComments(res as unknown as Reply[]);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const fetchLikesInfo = async () => {
    try {
      const res = await fetchPostLikeInfo(post.id, user?.id ?? '');
      if (res) {
        setLikes(res.likes);
        setLiked(res.isLike);
      }
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  }

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
      const res = await fetchCommentsByLayerId(parentId, user?.id ?? '');
      if (res) {
        setComments(prev => {
          return updateComments(prev, parentId, res as unknown as Reply[]);
        }
        );
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleLike = async () => {
    let res = false;
    if (liked) {
      res = await deletePostLike(post.id, user?.id ?? '');
    } else {
      res = await addPostLike(post.id, user?.id ?? '');
    }
    if (res) {
      await fetchLikesInfo();
    }
  };

  const handlePostComment = async () => {
    if (commentText.trim()) {
      const newComment: CommentCreate = {
        user_id: user?.id || '',
        post_id: post.id,
        content: commentText.trim(),
      };
      const data = await createComment(newComment);
      setCommentText('');

      if (!showComments) {
        setShowComments(true);
        await fetchCommentsForPost();
      } else {
        const newCommentData = await fetchCommentById(data[0].id);
        setComments(prev => {
          const newComments = [...prev, newCommentData];
          return newComments;
        });
      }
    }
  };

  const handleCommentLike = async (data: Reply, liked: boolean) => {
    const { id } = data;
    let res = false;
    if (liked) {
      res = await deleteCommentLike(id, user?.id ?? '');
      if (data.likes?.[0]) {
        data.likes[0].count -= 1;
      }
      data.isLike = [];
    } else {
      res = await addCommentLike(id, user?.id ?? '');
      if (data.likes?.[0]) {
        data.likes[0].count += 1;
      }
      data.isLike = [{ user_id: user?.id ?? '' }];
    }
    if (res) {
      setComments(prev => [...prev]);
    }
  };

  const handleReplyToggle = (id: string) => {
    setReplyingTo(replyingTo === id ? null : id);
  };

  const handleSendReply = async (parentId: string, reply: Reply) => {
    if (replyText.trim()) {
      const layer_id = reply.layer_id || parentId;
      const newReply: CommentCreate = {
        content: replyText.trim(),
        user_id: user?.id || '',
        post_id: post.id,
        parent_id: parentId,
        layer_id: layer_id,
      };
      const data = await createComment(newReply);
      const newReplyData = await fetchCommentById(data[0].id, layer_id);
      setComments(prev => {
        const newComments = addReplyToComment(prev, layer_id, newReplyData);
        return newComments;
      });
      setReplyText('');
      setReplyingTo(null);
    }
  };

  const addReplyToComment = (list: Reply[], parentId: string, replyToAdd: Reply): Reply[] => {
    return list.map(comment => {
      if (comment.id === parentId) {
        if (comment.count?.[0]) {
          comment.count[0].count += 1;
        }
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

      const likes = reply.likes?.[0].count || 0;
      const liked = !!(reply.isLike?.length ?? 0);

      const bubble = (
        <View style={level > 0 ? styles.replyBubble : styles.commentBubble}>
          <Text style={styles.commentText}>
            {reply.parent && (
              <View style={styles.nameRow}>
                <Text style={styles.username}>@ {reply.parent.user?.username}</Text>
                <Text style={styles.degree}>({reply.parent.user?.degree}): </Text>
              </View>
            )}
            {reply.content}
          </Text>
          <View style={styles.commentActions}>
            <TouchableOpacity onPress={() => handleCommentLike(reply, liked)} style={styles.commentActionButton}>
              <MaterialIcons
                name={liked ? 'favorite' : 'favorite-border'}
                size={14}
                color={liked ? '#e53935' : '#999'}
              />
              <Text style={styles.commentActionText}>{likes}</Text>
            </TouchableOpacity>
            {level <= 0 && <TouchableOpacity onPress={() => {
              fetchCommentsForComment(reply.id);
            }}>
              <View style={[styles.iconPill, { backgroundColor: count > 0 ? '#e6f0ff' : 'transparent' }]}>
                <MaterialIcons name="chat-bubble-outline" size={14} color={count > 0 ? '#1357DA' : '#999'} />
                <Text style={[styles.iconPillText, { color: count > 0 ? '#1f1f1f' : '#999' }]}>{count}</Text>
              </View>
            </TouchableOpacity>}
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
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.username}>{reply.user?.username}</Text>
              <Text style={styles.degree}>({reply.user?.degree})</Text>
            </View>
            {level > 0 ? bubble : (
              <View style={styles.commentContent}>
                {bubble}
              </View>
            )}
          </View>
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
    <View style={{...styles.card, zIndex: showPreview.show ? 1 : 0}}>
      {/* Post Header */}
      <View style={styles.userInfo}>
      <TouchableOpacity
  style={styles.leftGroup}
  onPress={() => {
    const email = post?.profile?.email;
    if (email) {
      router.push({
        pathname: '/profile-user',
        params: { userId: email },
      });
    } else {
      console.warn('Email not found in post.profile');
    }
  }}  
>
    <Pfp email={post.profile.email} name={post.profile.username} />
    <View>
      <Text style={styles.username}>{post.profile.username}</Text>
      <Text style={styles.degree}>{post.profile.degree}</Text>
    </View>
  </TouchableOpacity>
  <Text style={styles.timestamp}>{howLongAgo(postDate)}</Text>
</View>

      {/* Post Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.postContent}>{post.content}</Text>
        <View style={styles.imageWrapper}>
          {
            (postImageUrl || []).slice(0, 2).map((image, idx) => {
              return (
                <TouchableOpacity
                  key={idx}
                  style={styles.imageContainer}
                  onPress={() => setShowPreview({ show: true, init: idx })}
                >
                  <Image
                    source={{
                      uri: Platform.OS === 'web' ? image : `https://leqcmbvpugjvyzlxxmgs.supabase.co/storage/v1/object/public/post-image/${id}/${image}`,
                    }}
                    style={styles.postImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              );
            })
          }
        </View>
        {postImageUrl?.length > 2 && <View style={styles.imageWrapper}>
          {
            (postImageUrl || []).slice(2, 4).map((image, idx) => {
              const realIdx = idx + 2;
              return (
                <TouchableOpacity
                  key={idx}
                  style={styles.imageContainer}
                  onPress={() => setShowPreview({ show: true, init: realIdx })}
                >
                  <Image
                    source={{
                      uri: Platform.OS === 'web' ? image : `https://leqcmbvpugjvyzlxxmgs.supabase.co/storage/v1/object/public/post-image/${id}/${image}`,
                    }}
                    style={styles.postImage}
                    resizeMode="cover"
                  />
                  {postImageUrl?.length > 4 && idx === 1 && (
                    <View style={styles.imageMore}>
                      <Text style={{ color: '#fff', fontSize: 30, opacity: 0.6 }}>{`+${postImageUrl.length - 4}`}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          }
        </View>}
      </View>

      {/* Like + Comment */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={handleLike} style={[styles.iconPill, { backgroundColor: liked ? '#fde8e8' : 'transparent' }]}>
          <MaterialIcons name={liked ? 'favorite' : 'favorite-border'} size={20} color={liked ? '#e53935' : '#999'} />
          <Text style={[styles.iconPillText, { color: liked ? '#1f1f1f' : '#999' }]}>{likes}</Text>
        </TouchableOpacity>

        <View style={[styles.iconPill, { backgroundColor: allCommentsCount > 0 ? '#e6f0ff' : 'transparent' }]}>
          <MaterialIcons name="chat-bubble-outline" size={20} color={allCommentsCount > 0 ? '#1357DA' : '#999'} />
          <Text style={[styles.iconPillText, { color: allCommentsCount > 0 ? '#1f1f1f' : '#999' }]}>{allCommentsCount}</Text>
        </View>

        {allCommentsCount > 0 && (
          <TouchableOpacity onPress={() => {
            setShowComments(prev => !prev);
            if (!showComments) {
              fetchCommentsForPost();
            }
          }}>
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
      <ImagePreview
        urls={postImageUrl}
        init={showPreview.init}
        show={showPreview.show}
        onClose={() => setShowPreview({ show: false, init: 0 })}
      />
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
  imageWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  imageContainer: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  postImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  imageMore: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000010',
    borderRadius: 10
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
    gap: 8
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  }
});