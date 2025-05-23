import { supabase } from "./supabase";

// Create a post
export const createPost = async (userId: string, content: string, imageUrl: string) => {
  const { data, error } = await supabase
    .from("posts")
    .insert([
      { user_id: userId, content: content, image_url: imageUrl }
    ])
    .select();;
  if (error) throw error;
  return data;
};

// Fetch all posts with user info
export const fetchPosts = async (user_id: string) => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      content,
      created_at,
      image_url,
      profile:users!user_id(username, degree, pfp_url, email),
      count:comments(count),
      likes:post_likes!post_id(count),
      isLike:post_likes!post_id(user_id)
    `)
    .eq('isLike.user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
  } else {
    console.log("Fetched posts with user info:", data);
  }
  return data; 
};

// Search posts by content
export const searchPosts = async (searchTerm: string, user_id: string) => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      content,
      created_at,
      image_url,
      profile:users!user_id(username, degree, pfp_url, email),
      count:comments(count),
      likes:post_likes!post_id(count),
      isLike:post_likes!post_id(user_id)
    `)
    .ilike('content', `%${searchTerm}%`)
    .eq('isLike.user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error searching posts:", error);
    throw error;
  }
  return data;
};

// fetch user's post for user profile
export const fetchPostsByUserId = async (user_id: string) => {
  if (!user_id) return [];
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profile:users!posts_user_fk(user_id, username, degree, email, pfp_url),
      count:comments(count),
      likes:post_likes!post_id(count)
    `)
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Failed to fetch posts:', error);
    return [];
  }
  return data;
};



