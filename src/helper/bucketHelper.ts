import { supabase } from "../api/supabase";
import { decode } from 'base64-arraybuffer'


// since all the bucket methods are similar, we should create a base function to handle the common logic, that we can reuse for all the buckets to follow the Open/Closed principle - TODO
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

export const uploadPostImage = async (base64Data: string, postId: string) => {
    const {data, error} = await supabase.storage
        .from("post-image")
        .upload(postId + '/post-image.png', decode(base64Data), {
            cacheControl: '3600',
            upsert: true
          });
    if (error) throw error;
    return data;
}

export const downloadPostImage = async (postId: string) => {
    const {data, error} = await supabase.storage
        .from("post-image")
        .download(postId + '/post-image.png');

    console.log(error)
    if (error) return null;

    const url = URL.createObjectURL(data);
    return url;
}