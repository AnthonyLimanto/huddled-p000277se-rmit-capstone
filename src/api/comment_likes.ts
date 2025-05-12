import { supabase } from "./supabase";

export async function fetchCommentLikeInfo(comment_id: string, user_id: string) {
  try {
    const { count: likes, error: countError } = await supabase
      .from('comment_likes')
      .select('*', { count: 'exact', head: true })
      .eq('comment_id', comment_id);
    
    if (countError) throw countError;
    
    const { data: userLike, error: likeError } = await supabase
      .from('comment_likes')
      .select('*')
      .eq('comment_id', comment_id)
      .eq('user_id', user_id)
      .maybeSingle();
    
    if (likeError) throw likeError;
    
    return {
      likes: likes ?? 0,
      isLike: userLike !== null
    };
    
  } catch (error) {
    console.error('获取评论点赞信息失败:', error);
    return { likes: 0, isLike: false };
  }
}

export async function addCommentLike(comment_id: string, user_id: string) {
  try {
    const { data, error } = await supabase
      .from('comment_likes')
      .insert([
        { comment_id, user_id }
      ]);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function deleteCommentLike(comment_id: string, user_id: string) {
  try {
    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('comment_id', comment_id)
      .eq('user_id', user_id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
