import { supabase } from "./supabase";
import { uploadPfp } from "../helper/bucketHelper";

export const signUp = async (username: string, password: string) => {
  const { data, error } = await supabase
    .from("User") 
    .insert([{ username, password }]);

  if (error) throw error;
  return data;
};


// ✨ Full signup with PFP upload
export const completeSignUp = async (
  email: string,
  password: string,
  username: string,
  degree: string,
  pfpFile?: { uri: string; name: string; type: string } | null
) => {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (!data?.user?.id) throw new Error("User creation failed - no ID returned");

    const userId = data.user.id;

    // Upload or fallback to auto avatar
    let pfpUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`;

    if (pfpFile) {
      const response = await fetch(pfpFile.uri); // Fetch local file
      const blob = await response.blob();        // Convert to Blob
      
      // Upload to Supabase Storage bucket 'pfp'
      await uploadPfp(blob, email);
      pfpUrl = `https://leqcmbvpugjvyzlxxmgs.supabase.co/storage/v1/object/public/pfp/${email}/profile-picture.png`;
    }

    //Insert user profile
    const { error: profileError } = await supabase
      .from("users")
      .insert([
        {
          user_id: userId,
          username,
          degree,
          email,
          pfp_url: pfpUrl,
        },
      ]);

    if (profileError) throw profileError;

    return data.user;
  } catch (error) {
    console.error("Signup failed:", error);
    throw error;
  }
};

//Fetch all users (from lowercase `users`)
export const fetchUsers = async () => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

//Fetch one user by email
export const fetchUser = async (email: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error) throw error;
  return data;
};

//Get logged-in user + profile info from `users`
export const getSessionUser = async () => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.user?.id) {
    throw new Error("No user session found");
  }

  const authUser = session.user;

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", authUser.id)
    .single();

  if (profileError) {
    console.error("Error fetching user profile:", profileError);
    throw profileError;
  }

  return {
    id: authUser.id,
    email: authUser.email,
    username: profile.username,
    degree: profile.degree,
    pfp_url: profile.pfp_url,
  };
};

//Search users by username or email
export const searchUsers = async (searchTerm: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .or(`username.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
    .order("username", { ascending: true });

  if (error) throw error;
  return data;
};
