import { Profile } from "./profile"

export type Post = {
    id: string,
    user_id: string,
    content: string,
    image_url?: string
    created_at: Date
    profile: Profile
    count?: {count: number}[]
    likes?: {count: number}[]
    isLike?: any[]
}