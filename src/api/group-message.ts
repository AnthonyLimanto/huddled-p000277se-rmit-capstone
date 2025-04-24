import { supabase } from './supabase';

// 📨 Send a message to a group
export const sendGroupMessage = async (
  groupId: string,
  userId: string,
  content: string
) => {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ group_id: groupId, user_id: userId, content }])
    .select();

  if (error) {
    console.error('Error sending group message:', error);
    throw error;
  }

  return data[0];
};

// 📥 Fetch messages for a specific group
export const fetchGroupMessages = async (groupId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      id,
      content,
      created_at,
      user_id,
      users (
        username
      )
    `)
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching group messages:', error);
    throw error;
  }

  return data;
};
