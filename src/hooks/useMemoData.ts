// hooks/useMemosData.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Memo, Folder } from '../types';
import { useData } from '../../contexts/SeparatedDataContext';
import { useAuth } from '../../contexts/AuthContext';

export const useMemosData = () => {
    const { user } = useAuth();
    const { notes, addNote, updateNote, deleteNote } = useData();
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'info'
    });

    // 메모 데이터 변환 (useMemo로 최적화)
    const memos = useMemo(() => {
        if (!notes || !Array.isArray(notes)) return [];
        
        return notes.map(note => ({
            id: note.id,
            userId: note.userId,
            title: note.title,
            content: note.content,
            category: note.category,
            tags: note.tags || [],
            pinned: note.pinned || false,
            archived: note.archived || false,
            order: note.order,
            date: note.createdAt,
            folderId: note.category || 'all',
            lastModified: note.updatedAt ? new Date(note.updatedAt) : new Date(),
        }));
    }, [notes]);

    const showSnackbar = useCallback((message: string, severity: 'success' | 'error' | 'info' = 'success') => {
        setSnackbar({ open: true, message, severity });
    }, []);

    const hideSnackbar = useCallback(() => {
        setSnackbar(prev => ({ ...prev, open: false }));
    }, []);

    // 메모 추가
    const handleAddMemo = useCallback(async (selectedFolder: string) => {
        if (!user) {
            showSnackbar('로그인 후 메모를 추가할 수 있습니다.', 'error');
            return null;
        }

        try {
            const newNoteResult = await addNote({
                title: '새 메모',
                content: '',
                category: selectedFolder === 'all' ? 'all' : selectedFolder,
                tags: [],
                pinned: false,
                archived: false,
                order: notes.length
            });

            if (newNoteResult?.id) {
                showSnackbar('새 메모가 생성되었습니다.', 'success');
                return newNoteResult;
            } else {
                showSnackbar('메모 생성에 실패했습니다.', 'error');
                return null;
            }
        } catch (error) {
            console.error('[handleAddMemo] 메모 생성 중 오류:', error);
            showSnackbar('메모 생성 중 오류가 발생했습니다.', 'error');
            return null;
        }
    }, [addNote, user, notes.length, showSnackbar]);

    // 메모 업데이트
    const handleUpdateMemo = useCallback(async (id: string, updates: Partial<Memo>) => {
        try {
            await updateNote(id, updates);
            showSnackbar('메모가 업데이트되었습니다.', 'success');
        } catch (error) {
            console.error('[handleUpdateMemo] 메모 업데이트 중 오류:', error);
            showSnackbar('메모 업데이트 중 오류가 발생했습니다.', 'error');
        }
    }, [updateNote, showSnackbar]);

    // 메모 삭제
    const handleDeleteMemo = useCallback(async (id: string) => {
        try {
            await deleteNote(id);
            showSnackbar('메모가 삭제되었습니다.', 'success');
        } catch (error) {
            console.error('[handleDeleteMemo] 메모 삭제 중 오류:', error);
            showSnackbar('메모 삭제 중 오류가 발생했습니다.', 'error');
        }
    }, [deleteNote, showSnackbar]);

    return {
        memos,
        snackbar,
        hideSnackbar,
        handleAddMemo,
        handleUpdateMemo,
        handleDeleteMemo,
    };
};
