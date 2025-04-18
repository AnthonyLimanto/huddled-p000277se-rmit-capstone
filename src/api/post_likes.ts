import { supabase } from "./supabase";

export async function fetchPostLikeInfo(post_id: string, user_id: string) {
  try {
    const { count: likes, error: countError } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post_id);
    
    if (countError) throw countError;
    
    const { data: userLike, error: likeError } = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', post_id)
      .eq('user_id', user_id)
      .maybeSingle();
    
    if (likeError) throw likeError;
    
    return {
      likes: likes ?? 0,
      isLike: userLike !== null
    };
    
  } catch (error) {
    console.error('获取帖子点赞信息失败:', error);
    return { likes: 0, isLike: false };
  }
}

export async function addPostLike(post_id: string, user_id: string) {
  try {
    const { data, error } = await supabase
      .from('post_likes')
      .insert([
        { post_id, user_id }
      ]);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function deletePostLike(post_id: string, user_id: string) {
  try {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', post_id)
      .eq('user_id', user_id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

