import { Post } from './post'
import { Profile } from "./profile"

export type Comment = {
    id: string,
    user_id: string,
    post_id: string,
    parent_id?: string,
    content: string,
    image_url?: string
    created_at: Date
    user?: Partial<Profile>
    post?: Post
    parent?: Comment
    children?: Comment[]
    count?: {count: number}[]
    likes?: {count: number}[]
    isLike?: any[]
}

export type CommentCreate = Omit<Comment, 'id' | 'created_at' | 'user' | 'post' | 'parent' | 'children'>;