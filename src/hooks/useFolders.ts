// hooks/useFolders.ts
import { useState, useMemo, useCallback } from 'react';
import { Folder, Memo } from '../types';
import { DEFAULT_FOLDERS } from '../constants';

export const useFolders = (memos: Memo[]) => {
    const [folders, setFolders] = useState<Folder[]>(DEFAULT_FOLDERS);
    const [selectedFolder, setSelectedFolder] = useState<string>('all');
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);

    // 폴더별 메모 수 계산 (무한 루프 방지)
    const foldersWithCounts = useMemo(() => {
        return folders.map(folder => ({
            ...folder,
            memoCount: folder.id === 'all'
                ? memos.filter(m => !m.archived).length
                : memos.filter(memo => memo.folderId === folder.id && !memo.archived).length
        }));
    }, [folders, memos]);

    // 폴더 추가
    const handleAddFolder = useCallback((name: string) => {
        if (!name.trim()) return;
        
        const newFolder: Folder = {
            id: Date.now().toString(),
            name: name.trim(),
            color: '#60a5fa',
            icon: '📁',
            memoCount: 0
        };
        
        setFolders(prev => [...prev, newFolder]);
    }, []);

    // 폴더 삭제
    const handleDeleteFolder = useCallback((id: number) => {
        setFolders(prev => prev.filter(f => f.id !== id));
        if (selectedFolder === id) {
            setSelectedFolder('all');
        }
    }, [selectedFolder]);

    // 폴더 편집
    const handleEditFolder = useCallback((id: number, name: string) => {
        if (!name.trim()) return;
        
        setFolders(prev => prev.map(f => 
            f.id === id ? { ...f, name: name.trim() } : f
        ));
        setEditingFolderId(null);
    }, []);

    return {
        folders: foldersWithCounts,
        selectedFolder,
        setSelectedFolder,
        editingFolderId,
        setEditingFolderId,
        handleAddFolder,
        handleDeleteFolder,
        handleEditFolder,
    };
};
