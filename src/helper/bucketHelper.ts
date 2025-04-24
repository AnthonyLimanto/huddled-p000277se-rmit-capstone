import { supabase } from "../api/supabase";
import { decode } from 'base64-arraybuffer'
import { ImageFileType } from '../app/(home)/create';


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

export const uploadPostImages = async (base64Data: ImageFileType[], postId: string) => {
    if (!base64Data || base64Data.length === 0) {
        return;
    }
    const uploadPromises = base64Data.map((data, index) => {
        return supabase.storage
            .from("post-image")
            .upload(`${postId}/${data.name}`, data.file, {
                cacheControl: '3600',
                upsert: true
            });
    });
    const results = await Promise.all(uploadPromises);
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
        throw new Error('Error uploading images');
    }
    return results.map(result => result.data);
}

export const downloadPostImage = async (postId: string, imageNameArr: string[]) => {
    const downloadPromises = imageNameArr.map((imageName) => {
        return supabase.storage
            .from("post-image")
            .download(`${postId}/${imageName}`);
    });
    const results = await Promise.all(downloadPromises);
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
        console.error('Error downloading images:', errors);
        return null;
    }
    const urls = results.map((result) => {
        if (result.data) {
            const url = URL.createObjectURL(result.data);
            return url;
        }
        return null;
    });
    return urls;
}