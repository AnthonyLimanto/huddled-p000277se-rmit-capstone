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

// 🔄 Subscribe to real-time group messages
export const subscribeToGroupMessages = (
  groupId: string,
  onMessageChange: (payload: any) => void
) => {
  const channel = supabase
    .channel('realtime:messages') // Create a channel for the messages table
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'messages', filter: `group_id=eq.${groupId}` },
      (payload) => {
        console.log('Real-time message change:', payload);
        onMessageChange(payload); // Call the callback function with the payload
      }
    )
    .subscribe();

  // Return a cleanup function to unsubscribe
  return () => {
    supabase.removeChannel(channel);
  };
};