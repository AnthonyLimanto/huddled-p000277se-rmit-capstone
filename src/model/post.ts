export type Post = {
    id: number,
    user_id: number,
    content: string,
    image_url?: string
    created_at: Date
}