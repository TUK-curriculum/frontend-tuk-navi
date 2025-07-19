export interface Note {
    id: string;
    userId: string;
    title: string;
    content: string;
    category?: string;
    tags?: string[];
    pinned?: boolean; // isPinned -> pinned
    archived?: boolean; // isArchived -> archived
    order?: number;
    createdAt?: string;
    updatedAt?: string;
} 