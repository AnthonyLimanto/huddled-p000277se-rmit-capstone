import { CommentCreate } from '../model/comment';
import { supabase } from "./supabase";

// Create a Comment
export const createComment = async (params: CommentCreate) => {
  const { data, error } = await supabase
    .from("comments")
    .insert([
      params
    ])
    .select();
  if (error) throw error;
  return data;
};

// Fetch all posts with user info
export const fetchComments = async (post_id: string, user_id: string) => {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      image_urls,
      user_id,
      post_id,
      parent_id,
      created_at,
      user: users!user_id(username, degree, pfp_url, email),
      count:comments(count),
      likes:comment_likes!comment_id(count),
      isLike:comment_likes!comment_id(user_id).eq(user_id, ${user_id})
      children: comments (
        id,
        content,
        image_urls,
        user_id,
        post_id,
        parent_id,
        created_at,
        user: users(username, degree, pfp_url, email),
        count:comments(count),
        likes:comment_likes!comment_id(count),
        isLike:comment_likes!comment_id(user_id).eq(user_id, ${user_id})
      ) 
    `)
    .eq('post_id', post_id)
    .is('parent_id', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
  } else {
    console.log("Fetched posts with user info:", data);
  }
  return data; 
};

export const fetchCommentsByParentId = async (parent_id: string, user_id: string) => {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      image_urls,
      user_id,
      post_id,
      parent_id,
      created_at,
      user: users!user_id(username, degree, pfp_url, email),
      count:comments(count),
      likes:comment_likes!comment_id(count),
      isLike:comment_likes!comment_id(user_id).eq(user_id, ${user_id})
      children: comments (
        id,
        content,
        image_urls,
        user_id,
        post_id,
        parent_id,
        created_at,
        user: users!user_id(username, degree, pfp_url, email),
        count:comments(count),
        likes:comment_likes!comment_id(count),
        isLike:comment_likes!comment_id(user_id).eq(user_id, ${user_id})
      ) 
    `)
    .eq('parent_id', parent_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
  } else {
    console.log("Fetched posts with user info:", data);
  }
  return data; 
}
