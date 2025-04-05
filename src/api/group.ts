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
  

      const members = users.map((userId) => ({
        group_id: groupId, 
        user_id: userId, 
      }));
  
      const { data: membersData, error: membersError } = await supabase
        .from("group_members")
        .insert(members);
  
      if (membersError) throw membersError;
  
      return { group: groupData, members: membersData };
    } catch (error) {
      console.error("Error creating group:", error);
      throw error;
    }
  };

export const fetchGroups = async () => {
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
            console.log("Posts with profile info:", data);
        }
    return data; 
} 