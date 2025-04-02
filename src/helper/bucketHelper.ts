import { supabase } from "../api/supabase";

export const uploadPfp = async (file: File, email: string) => {
    const {data, error} = await supabase.storage
        .from("pfp")
        .upload(email + '/profile-picture.png', file, {
            cacheControl: '3600',
            upsert: true
          });
    if (error) throw error;
    return data;
}

export const downloadPfp = async (email: string) => {
    const {data, error} = await supabase.storage
        .from("pfp")
        .download(email + '/profile-picture.png');

    console.log(error)
    if (error) return "default";

    const url = URL.createObjectURL(data);
    return url;
}