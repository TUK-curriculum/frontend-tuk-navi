// constants.ts
export const DEFAULT_FOLDERS: Folder[] = [
    { id: 'all', name: '전체', color: '#60a5fa', icon: '📁', memoCount: 0 },
    { id: 'work', name: '업무', color: '#f59e0b', icon: '💼', memoCount: 0 },
    { id: 'personal', name: '개인', color: '#10b981', icon: '👤', memoCount: 0 },
    { id: 'study', name: '학습', color: '#8b5cf6', icon: '📚', memoCount: 0 },
    { id: 'ideas', name: '아이디어', color: '#ef4444', icon: '💡', memoCount: 0 },
];

export const PANEL_CONFIG = {
    MIN_WIDTH: 140,
    MAX_WIDTH: 400,
    DEFAULT_WIDTH: 240,
    DRAG_HANDLE_WIDTH: 6,
};

export const COLORS = {
    TEXT: ["#22223b", "#e11d48", "#2563eb", "#059669", "#f59e42", "#fbbf24", "#a21caf", "#64748b"],
    HIGHLIGHT: ["#fff9c4", "#bae6fd", "#fca5a5", "#bbf7d0", "#bbf7d0", "#f3e8ff", "#fef9c3", "#e0f2fe"],
};
