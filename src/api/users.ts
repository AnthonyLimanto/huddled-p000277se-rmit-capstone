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

export const completeSignUp = async (
    email: string,
    password: string,
    username: string,
    degree: string,
    pfpFile?: File | null
  ) => {
    try {
      // 1. Sign up with email/password
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (!data?.user?.id) throw new Error('User creation failed - no ID returned');
  
      // 2. Handle profile picture (optional)
      let pfpUrl = "PLACEHOLDER"; // Default placeholder if no file is uploaded
      
      /* Uncomment this when ready to implement PFP uploads
      if (pfpFile) {
        const filePath = `pfp/${data.user.id}/${pfpFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('user-avatars')
          .upload(filePath, pfpFile);
        if (uploadError) throw uploadError;
  
        const { data: { publicUrl } } = supabase.storage
          .from('user-avatars')
          .getPublicUrl(filePath);
        pfpUrl = publicUrl;
      } else {
        pfpUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`;
      }
      */
  
      // 3. Insert user into the users table
      const { error: usersTableError } = await supabase
        .from('users')
        .insert([{
          user_id: data.user.id,  // Using the user ID returned from auth
          username,           // Storing the username
          pfp_url: pfpUrl,     // Storing the profile picture URL
          degree,
          email
        }]);
  
      if (usersTableError) throw usersTableError;
  
      // Return the authenticated user
      return data.user;
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };