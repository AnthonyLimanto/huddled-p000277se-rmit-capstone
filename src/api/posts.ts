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
export const fetchPosts = async () => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      content,
      created_at,
      profile:users(username, degree, pfp_url, email)  
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
  } else {
    console.log("Fetched posts with user info:", data);
  }
  return data; 
};
