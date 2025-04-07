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
            group_id: group_id, 
            user_id: userId, 
        }));
    
        const { data: membersData, error: membersError } = await supabase
            .from("group_members")
            .insert(members);
    
        if (membersError) throw membersError;
    
        return membersData;
    } catch (error) {
        console.error("Error adding group members:", error);
        throw error;
    }
}

export const fetchGroups = async (user_id: string) => {
    const { data: groupData, error } = await supabase
        .from('group_members')
        .select('group:groups(id, name, created_at)')
        .eq('user_id', user_id)
        .order('joined_at', { ascending: false });

        if (error) {
            console.error("Error fetching groups:", error);
        } else {
            console.log("groups:", groupData);
        }

    return groupData;
} 

export const fetchGroupMembers = async (group_id: string) => {
    const { data: groupMemberData, error } = await supabase
        .from('group_members')
        .select('group_id, joined_at, profile:users(username, degree, pfp_url, email)')
        .eq('group_id', group_id)
        .order('joined_at', { ascending: false });

        if (error) {
            console.error("Error fetching group members:", error);
        } else {
            console.log("groups:", groupMemberData);
        }

    return groupMemberData;
} 