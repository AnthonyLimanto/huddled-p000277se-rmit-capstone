import {supabase} from "./supabase"

export const createGroup = async (name: string, users: string[]) => {
  try {
      
    const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .insert([{ name }])
        .select("id")
        .single(); 

    if (groupError) throw groupError;

    const groupId = groupData.id;

    const membersData = await addGroupMembers(groupId, users);

    return { group: groupData, members: membersData };
} catch (error) {
    console.error("Error creating group:", error);
    throw error;
}
};


  export const addGroupMembers = async (group_id: string, users: string[]) => {
    try {
      const members = users.map((userId) => ({
        group_id,
        user_id: userId,
      }));
  
      const { data, error } = await supabase
        .from('group_members')
        .insert(members, { ignoreDuplicates: true }); // <-- Ignore existing pairs
  
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error adding group members:", error);
      throw error;
    }
  };
  
export const fetchGroup = async (group_id: string) => {
  const {data: groupData, error} = await supabase
    .from('groups')
    .select("*")
    .eq('id', group_id)
    if (error) {
      console.error("Error fetching group:", error);
    } else {
        console.log("group:", groupData);
    }
    return groupData;
}

export const fetchGroups = async (user_id: string) => {
  // Step 1: Fetch groups for the user
  const { data: groupData, error } = await supabase
    .from('group_members')
    .select(`
      group:groups(
        id,
        name,
        created_at,
        members:group_members(count)
      )
    `)
    .eq('user_id', user_id)
    .order('joined_at', { ascending: false });

  if (error) {
    console.error('Error fetching groups:', error);
    throw error;
  }

  // Step 2: Fetch the latest message for each group
  const groupIds = groupData.map((item: any) => item.group.id); // Extract group IDs
  const { data: messageData, error: messageError } = await supabase
    .from('messages')
    .select(`
      group_id,
      content,
      created_at
    `)
    .in('group_id', groupIds) // Fetch messages for the group IDs
    .order('created_at', { ascending: false }); // Order by latest message

  if (messageError) {
    console.error('Error fetching messages:', messageError);
    throw messageError;
  }

  // Step 3: Combine groups with their latest messages and member count
  const processedGroups = groupData.map((item: any) => {
    const group = {
      id: item.group.id,
      name: item.group.name,
      createdAt: item.group.created_at,
      memberCount: item.group.members[0].count || 0, // Count of members
    };

    const latestMessage = messageData.find((msg: any) => msg.group_id === group.id) || null;

    const message = latestMessage
      ? {
          content: latestMessage.content,
          createdAt: latestMessage.created_at,
        }
      : null; // If no messages exist, set message to null

    return { group, message };
  });

  return processedGroups;
};

export const fetchGroupMembers = async (group_id: string) => {
    const { data: groupMemberData, error } = await supabase
        .from('group_members')
        .select('user_id, group_id, joined_at, profile:users(username, degree, pfp_url, email)')
        .eq('group_id', group_id)
        .order('joined_at', { ascending: false });

        if (error) {
            console.error("Error fetching group members:", error);
        } else {
            console.log("groups:", groupMemberData);
        }

    return groupMemberData;
} 