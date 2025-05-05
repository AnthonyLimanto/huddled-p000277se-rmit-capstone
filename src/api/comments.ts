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

export const updateCommentLayerId = async () => {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      image_urls,
      user_id,
      post_id,
      parent_id,
      layer_id,
      created_at,
      children: comments!parent_id(
        id,
        content,
        image_urls,
        user_id,
        post_id,
        parent_id,
        layer_id,
        created_at
      ) 
    `)
    .not('parent_id', 'is', null);
  if (error) throw error;
  data.forEach(async (comment: any) => {
    const layerId = comment.parent_id ? comment.layer_id : comment.id;
    if (layerId && comment.children && comment.children.length > 0) {
      const childrenIds = comment.children.filter((c: any) => !c.layer_id).map((child: any) => child.id);
      await supabase
        .from('comments')
        .update({ layer_id: layerId })
        .in('id', childrenIds);
    }
  });
}

export const fetchCommentById = async (id: string, layer_id?: string) => {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      image_urls,
      user_id,
      post_id,
      parent_id,
      layer_id,
      created_at,
      user: users!user_id(username, degree, pfp_url, email),
      count:comments!layer_id(count),
      likes:comment_likes!comment_id(count),
      isLike:comment_likes!comment_id(user_id)
    `)
    .eq('id', id)
    .single();
  if (error) {
    console.error("Error fetching comment:", error);
    return null;
  }
  const comment: any = {...data}
  if (layer_id && data.parent_id !== layer_id) {
    const { data: parentData, error: parentError } = await supabase
      .from('comments')
      .select(`
        user: users!user_id(username, degree, pfp_url, email)
      `)
      .eq('id', data.parent_id)
      .single();
    if (parentError) {
      console.error("Error fetching parent comment:", parentError);
      return null;
    }
    comment.parent = parentData;
  }
  return comment;
}

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
      layer_id,
      created_at,
      user:users!user_id(username, degree, pfp_url, email),
      count:comments!layer_id(count),
      likes:comment_likes!comment_id(count),
      isLike:comment_likes!comment_id(user_id)
    `)
    .eq('post_id', post_id)
    .is('parent_id', null)
    .eq('isLike.user_id', user_id)
    .order('created_at', { ascending: true });

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
      layer_id,
      created_at,
      user: users!user_id(username, degree, pfp_url, email),
      count:comments!parent_id(count),
      likes:comment_likes!comment_id(count),
      isLike:comment_likes!comment_id(user_id),
      children: comments!parent_id(
        id,
        content,
        image_urls,
        user_id,
        post_id,
        parent_id,
        created_at,
        user: users!user_id(username, degree, pfp_url, email),
        count:comments!parent_id(count),
        likes:comment_likes!comment_id(count),
        isLike:comment_likes!comment_id(user_id).eq(user_id, ${user_id})
      ) 
    `)
    .eq('parent_id', parent_id)
    .eq('isLike.user_id', user_id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Error fetching posts:", error);
  } else {
    console.log("Fetched posts with user info:", data);
  }
  return data; 
}

export const fetchCommentsByLayerId = async (layer_id: string, user_id: string) => {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      image_urls,
      user_id,
      post_id,
      parent_id,
      layer_id,
      created_at,
      user: users!user_id(username, degree, pfp_url, email),
      count:comments!layer_id(count),
      likes:comment_likes!comment_id(count),
      isLike:comment_likes!comment_id(user_id)
    `)
    .eq('layer_id', layer_id)
    .eq('isLike.user_id', user_id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
  const dataMap = Object.fromEntries(data.map((item: any) => [item.id, item]));
  data.forEach((item: any) => {
    if (item.parent_id && item.parent_id !== layer_id) {
      const parent = dataMap[item.parent_id];
      if (parent) {
        item.parent = parent;
      }
    }
  });
  return data; 
}
