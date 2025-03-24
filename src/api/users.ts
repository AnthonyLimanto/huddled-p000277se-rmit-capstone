import {supabase} from "./supabase"

export const signUp = async (username: string, password: string) => {
    const {data, error} = await supabase
        .from("User")
        .insert([
            {username: username, password: password}
        ]);
    if (error) throw error;
    return data;
}

export const fetchUsers = async () => {
    const {data, error} = await supabase
        .from('Users')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data; 
} 

export const fetchUser = async (username: string) => {
    const {data, error} = await supabase
        .from('Users')
        .select('username')
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data; 
} 