import { supabase } from "./supabase";
import { uploadPfp } from "../helper/bucketHelper"; // 👈 Import upload helper

// ✨ Dummy signup to old 'User' table (likely unused if using Auth)
export const signUp = async (username: string, password: string) => {
  const { data, error } = await supabase
    .from("User") // ⚡ Be careful: "User" (capital U) table name
    .insert([{ username, password }]);

  if (error) throw error;
  return data;
};

// ✨ Fetch all users
export const fetchUsers = async () => {
  const { data, error } = await supabase
    .from('Users') // ⚡ Make sure this matches your table ('Users' or 'users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const fetchUser = async (email: string) => {
    const {data, error} = await supabase
        .from('Users')
        .select('*')
        .eq('email', email)
    
    if (error) throw error;
    return data; 
} 


// ✨ Full signup with PFP upload
export const completeSignUp = async (
  email: string,
  password: string,
  username: string,
  degree: string,
  pfpFile?: { uri: string; name: string; type: string } | null // ✅ Correct type
) => {
  try {
    // 1. Create user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (!data?.user?.id) throw new Error('User creation failed - no ID returned');

    // 2. Handle profile picture
    let pfpUrl = "PLACEHOLDER"; // Default placeholder image

    if (pfpFile) {
      const response = await fetch(pfpFile.uri); // Fetch local file
      const blob = await response.blob();        // Convert to Blob

      // Upload to Supabase Storage bucket 'pfp'
      await uploadPfp(blob, email);

      // Set public URL
      pfpUrl = `https://leqcmbvpugjvyzlxxmgs.supabase.co/storage/v1/object/public/pfp/${email}/profile-picture.png`;
    } else {
      // Fallback: use default avatar
      pfpUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`;
    }

    // 3. Insert user details into 'users' table
    const { error: usersTableError } = await supabase
      .from('users') // ⚡ Make sure this is lowercase 'users'
      .insert([{
        user_id: data.user.id,
        username,
        degree,
        email,
        pfp_url: pfpUrl
      }]);

    if (usersTableError) throw usersTableError;

    // 4. Done
    return data.user;

  } catch (error) {
    console.error('Signup failed:', error);
    throw error;
  }
};
