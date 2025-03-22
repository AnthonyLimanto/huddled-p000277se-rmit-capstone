import {supabase} from "./supabase"

export const createPost = async (userId: number, content: string, imageUrl: string) => {
    const {data, error} = await supabase
        .from("Posts")
        .insert([
            {user_id: userId, content: content, image_url: imageUrl}
        ]);
    if (error) throw error;
    return data;
}

export const fetchPosts = async () => {
    const {data, error} = await supabase
        .from('Posts')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data; 
} 