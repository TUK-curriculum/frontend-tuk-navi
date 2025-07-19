// hooks/useSearch.ts
import { useState, useMemo, useCallback } from 'react';
import { Memo, SearchFilters } from '../types';

export const useSearch = (memos: Memo[], selectedFolder: string) => {
    const [search, setSearch] = useState('');
    const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
    const [searchFilters, setSearchFilters] = useState<SearchFilters>({
        dateRange: null,
        tags: [],
        folder: 'all',
        pinned: false,
        archived: false
    });

    // 검색 및 필터링된 메모
    const filteredMemos = useMemo(() => {
        let filtered = memos.filter(memo => {
            // 기본 검색
            const matchesSearch = search === '' ||
                memo.title.toLowerCase().includes(search.toLowerCase()) ||
                memo.content.toLowerCase().includes(search.toLowerCase());

            // 고급 검색 필터
            const matchesDateRange = !searchFilters.dateRange ||
                (() => {
                    const [start, end] = searchFilters.dateRange;
                    return start && end &&
                        memo.lastModified >= start &&
                        memo.lastModified <= end;
                })();

            const matchesTags = searchFilters.tags.length === 0 ||
                searchFilters.tags.some(tag => memo.tags.includes(tag));

            const matchesFolder = searchFilters.folder === 'all' ||
                memo.folderId === searchFilters.folder;

            const matchesPinned = !searchFilters.pinned || memo.pinned;
            const matchesArchived = !searchFilters.archived || memo.archived;

            return matchesSearch && matchesDateRange && matchesTags &&
                matchesFolder && matchesPinned && matchesArchived;
        });

        // 정렬: 고정된 메모 우선, 그 다음 최신순
        return filtered.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return b.lastModified.getTime() - a.lastModified.getTime();
        });
    }, [memos, search, searchFilters]);

    // 폴더별 필터링
    const visibleMemos = useMemo(() => {
        if (selectedFolder === 'all') return filteredMemos;
        return filteredMemos.filter(memo => memo.folderId === selectedFolder);
    }, [filteredMemos, selectedFolder]);

    // 고정/일반 그룹화
    const groupedMemos = useMemo(() => {
        const pinned = visibleMemos.filter(m => m.pinned);
        const normal = visibleMemos.filter(m => !m.pinned);
        
        return [
            { section: '고정됨', memos: pinned },
            { section: '일반', memos: normal }
        ].filter(g => g.memos.length > 0);
    }, [visibleMemos]);

    const clearFilters = useCallback(() => {
        setSearchFilters({
            dateRange: null,
            tags: [],
            folder: 'all',
            pinned: false,
            archived: false
        });
        setSearch('');
    }, []);

    return {
        search,
        setSearch,
        advancedSearchOpen,
        setAdvancedSearchOpen,
        searchFilters,
        setSearchFilters,
        filteredMemos,
        visibleMemos,
        groupedMemos,
        clearFilters,
    };
};
