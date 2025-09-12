// types.ts
export interface Folder {
    id: number;
    name: string;
    color: string;
    icon: string;
    memoCount: number;
}

export interface Memo {
    id: number;
    userId: number;
    title: string;
    content: string;
    category: string;
    tags: string[];
    pinned?: boolean;
    archived?: boolean;
    order: number;
    date: string;
    folderId: string;
    lastModified: Date;
}

export interface SearchFilters {
    dateRange: [Date, Date] | null;
    tags: string[];
    folder: string;
    pinned: boolean;
    archived: boolean;
}

// 타입 가드 함수들
export const isValidMemo = (memo: any): memo is Memo => {
    return memo &&
        typeof memo.id === 'string' &&
        typeof memo.title === 'string' &&
        typeof memo.content === 'string' &&
        typeof memo.category === 'string' &&
        Array.isArray(memo.tags);
};

export const isValidFolder = (folder: any): folder is Folder => {
    return folder &&
        typeof folder.id === 'string' &&
        typeof folder.name === 'string' &&
        typeof folder.color === 'string' &&
        typeof folder.icon === 'string';
};
