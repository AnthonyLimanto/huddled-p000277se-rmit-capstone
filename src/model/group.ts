export type Group = {
    id: string;
    name: string;
    created_at: Date;
}

export type GroupMember = {
    group: {
        id: string;
        name: string;
        created_at: string;
    }[];
}