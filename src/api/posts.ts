import {supabase} from "./supabase"

export const createPost = async (userId: string, content: string, imageUrl: string) => {
    const {data, error} = await supabase
        .from("posts")
        .insert([
            {user_id: userId, content: content, image_url: imageUrl}
        ]);
    if (error) throw error;
    return data;
}

export const fetchPosts = async () => {
    const {data, error} = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data; 
} 