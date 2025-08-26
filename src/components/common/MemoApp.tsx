import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    Box, Typography, Button, IconButton, List, ListItem,
    TextField, Tooltip, Avatar, InputBase, Dialog,
    Snackbar, Alert, Chip, useMediaQuery, Badge,
    Grid, FormControl, InputLabel, Select, MenuItem,
    Checkbox, FormControlLabel, DialogTitle, DialogContent,
    DialogActions, Card, CardContent, Stack
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PushPinIcon from '@mui/icons-material/PushPin';
import NoteIcon from '@mui/icons-material/Note';
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatStrikethroughIcon from '@mui/icons-material/FormatStrikethrough';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import { useData } from '../../contexts/SeparatedDataContext';
import { useAuth } from '../../contexts/AuthContext';
import ReactDOM from 'react-dom';
import CloseIcon from '@mui/icons-material/Close';
import SortableMemoItem from '../SortableMemoItem';

// 타입 정의
interface Folder {
    id: string;
    name: string;
    color: string;
    icon: string;
    memoCount: number;
}

interface Memo {
    id: string;
    userId: string;
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

interface SearchFilters {
    dateRange: [Date, Date] | null;
    tags: string[];
    folder: string;
    pinned: boolean;
    archived: boolean;
}

// MemoAppProps 타입 추가
interface MemoAppProps {
    open: boolean;
    onClose: () => void;
}

// 기본 폴더 데이터
const defaultFolders: Folder[] = [
    { id: 'all', name: '전체', color: '#60a5fa', icon: '📁', memoCount: 0 },
    { id: 'work', name: '업무', color: '#f59e0b', icon: '💼', memoCount: 0 },
    { id: 'personal', name: '개인', color: '#10b981', icon: '👤', memoCount: 0 },
    { id: 'study', name: '학습', color: '#8b5cf6', icon: '📚', memoCount: 0 },
    { id: 'ideas', name: '아이디어', color: '#ef4444', icon: '💡', memoCount: 0 },
];

const MemoApp: React.FC<MemoAppProps> = ({ open, onClose }) => {
    // 모든 훅 선언 (최상단)
    const theme = useMuiTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isDark = theme.palette.mode === 'dark';
    const { user } = useAuth();
    const { notes, addNote, updateNote, deleteNote } = useData();
    const isDataReady = notes !== undefined && Array.isArray(notes);
    // 패널 폭 상태 (좌측 패널)
    const [leftPanelWidth, setLeftPanelWidth] = useState(240);
    const minPanelWidth = 140;
    const maxPanelWidth = 400;
    const dragHandleWidth = 6;
    const [isResizing, setIsResizing] = useState(false);
    // 메모 데이터를 Note[]에서 Memo[]로 변환
    const memos = notes.map(note => ({
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
    // 폴더(카테고리) 상태: 기본 폴더들
    const [folders, setFolders] = useState<Folder[]>(defaultFolders);
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [addFolderDialogOpen, setAddFolderDialogOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [newFolderColor, setNewFolderColor] = useState('#60a5fa');
    const [newFolderIcon, setNewFolderIcon] = useState('📁');
    const [selectedId, setSelectedId] = useState<string | null>(memos[0]?.id || null);
    const [selectedFolder, setSelectedFolder] = useState<string>('all');
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [saved, setSaved] = useState(false);
    const [search, setSearch] = useState('');
    const [editing, setEditing] = useState(false);
    // 전체화면 애니메이션 상태
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    // 팝업/스낵바 상태
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [shareMemo, setShareMemo] = useState<Memo | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');
    // 새로운 기능 상태
    const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
    const [searchFilters, setSearchFilters] = useState<SearchFilters>({
        dateRange: null,
        tags: [] as string[],
        folder: 'all',
        pinned: false,
        archived: false
    });
    // MemoApp 내부 상태 추가
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    // MemoApp 컴포넌트 최상단 state들 옆에
    const compact = false; // PiP 모드 제거
    // 메모 템플릿
    const memoTemplates = [
        {
            name: '회의록',
            content: `# 회의록

## 📅 회의 정보
- 날짜: 
- 시간: 
- 참석자: 

## 안건
1. 
2. 
3. 

## 💬 논의 내용
- 

## 결정사항
- 

## 다음 액션 아이템
- [ ] 
- [ ] 
- [ ] 

## 📅 다음 회의
- 날짜: 
- 시간: 
- 장소: `
        },
        {
            name: '프로젝트 계획',
            content: `# 프로젝트 계획

## 프로젝트 목표
- 

## 📅 일정
- 시작일: 
- 완료일: 
- 마일스톤: 

## 👥 팀 구성
- 프로젝트 매니저: 
- 개발자: 
- 디자이너: 

## 주요 작업
- [ ] 
- [ ] 
- [ ] 

## 💰 예산
- 

## 리스크
- 

## 진행률
- 현재: 0%
- 목표: 100%`
        },
        {
            name: '일일 계획',
            content: `# 일일 계획

## 📅 ${new Date().toLocaleDateString('ko-KR')}

## 오늘의 목표
- [ ] 
- [ ] 
- [ ] 

## 할 일
- [ ] 
- [ ] 
- [ ] 

## 💡 아이디어
- 

## 📚 학습
- 

## 🏃‍♂️ 운동
- 

## 🍽️ 식사
- 아침: 
- 점심: 
- 저녁: 

## 하루 요약
- 성취도: 
- 만족도: 
- 개선점: `
        },
        {
            name: '학습 노트',
            content: `# 학습 노트

## 📚 과목명
- 

## 📅 학습 날짜
- 

## 학습 목표
- 

## 📖 주요 내용
### 1. 
- 

### 2. 
- 

### 3. 
- 

## 핵심 개념
- 

## 질문사항
- 

## 과제/프로젝트
- 

## 참고 자료
- 

## 이해도
- 현재: 
- 목표: `
        }
    ];
    // 드래그 앤 드롭 센서
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );
    // Tiptap 에디터 인스턴스 생성
    const editor = useEditor({
        extensions: [
            StarterKit,
            Highlight,
            TextStyle,
            Color,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Underline,
            Link,
            Placeholder.configure({ placeholder: '메모를 입력하세요...' })
        ],
        content: editContent,
        onUpdate: ({ editor }) => {
            setEditContent(editor?.getHTML() || '');
            setEditing(true);
            setSaved(false);
        },
    });
    // editContent가 바뀌면 에디터 내용도 동기화
    useEffect(() => {
        if (editor && editContent !== editor.getHTML()) {
            editor.commands.setContent(editContent || '<p></p>');
        }

    }, [editContent, editor]);
    // 폴더별 메모 수 업데이트 - useMemo로 최적화
    const foldersWithCounts = useMemo(() => {
        return folders.map(folder => ({
            ...folder,
            memoCount: folder.id === 'all'
                ? memos.filter(m => !m.archived).length
                : memos.filter(memo => memo.folderId === folder.id && !memo.archived).length
        }));
    }, [folders, memos]);
    // setFolders 대신 foldersWithCounts 사용
    useEffect(() => {
        // memoCount가 변경된 경우에만 상태 업데이트 (무한 루프 방지)
        const isSame = folders.length === foldersWithCounts.length &&
            folders.every((f, idx) => f.memoCount === foldersWithCounts[idx].memoCount);
        if (!isSame) {
            setFolders(foldersWithCounts);
        }
    }, [foldersWithCounts, folders]);
    // 컴포넌트 언마운트 시 에디터 정리
    useEffect(() => {
        return () => {
            if (editor) {
                editor.destroy();
            }
        };
    }, [editor]);
    // 드래그 핸들러
    useEffect(() => {
        if (!isResizing) return;
        const handleMouseMove = (e: MouseEvent) => {
            // DialogContent 기준 좌표
            const dialog = document.querySelector('.memoapp-dialog-content') as HTMLElement;
            if (!dialog) return;
            const rect = dialog.getBoundingClientRect();
            let newWidth = e.clientX - rect.left;
            if (newWidth < minPanelWidth) newWidth = minPanelWidth;
            if (newWidth > maxPanelWidth) newWidth = maxPanelWidth;
            setLeftPanelWidth(newWidth);
        };
        const handleMouseUp = () => setIsResizing(false);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);
    // 스낵바 표시 (가장 먼저 선언)
    const showSnackbar = useCallback((message: string, severity: 'success' | 'error' | 'info' = 'success') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    }, []);
    // 새로운 기능 함수들
    const handleShareMemo = (memo: Memo) => {
        setShareMemo(memo);
        setShareDialogOpen(true);
    };
    const handleCopyShareLink = () => {
        if (shareMemo) {
            const shareLink = `${window.location.origin}/memo/${shareMemo.id}`;
            navigator.clipboard.writeText(shareLink);
            showSnackbar('공유 링크가 복사되었습니다!', 'success');
        }
    };
    const handleUseTemplate = (template: typeof memoTemplates[0]) => {
        const newMemo: Memo = {
            id: '',
            userId: user?.userId || '',
            title: template.name,
            content: template.content,
            category: selectedFolder,
            tags: [],
            pinned: false,
            archived: false,
            order: notes.length,
            date: new Date().toISOString(),
            folderId: selectedFolder,
            lastModified: new Date(),
        };
        setSelectedId(newMemo.id);
        setEditTitle(newMemo.title);
        setEditContent(newMemo.content);
        showSnackbar('템플릿이 적용되었습니다!', 'success');
    };
    const handleAdvancedSearch = () => {
        setAdvancedSearchOpen(!advancedSearchOpen);
    };
    // 검색 및 필터링된 메모
    const filteredMemos = useMemo(() => {
        const filtered = memos.filter(memo => {
            // 기본 검색
            const matchesSearch = search === '' ||
                memo.title.toLowerCase().includes(search.toLowerCase()) ||
                memo.content.toLowerCase().includes(search.toLowerCase());

            // 고급 검색 필터
            const matchesDateRange = !searchFilters.dateRange ||
                (() => {
                    const [start, end] = searchFilters.dateRange || [];
                    return start instanceof Date && end instanceof Date &&
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

        return filtered.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return b.lastModified.getTime() - a.lastModified.getTime();
        });
    }, [memos, search, searchFilters]);
    // 메모 리스트 폴더별 필터링 (폴더 클릭 시 해당 폴더 메모만)
    const visibleMemos = useMemo(() => {
        if (selectedFolder === 'all') return filteredMemos;
        return filteredMemos.filter(memo => memo.folderId === selectedFolder);
    }, [filteredMemos, selectedFolder]);
    // 고정/일반 분리
    const grouped = [
        { section: '고정됨', memos: visibleMemos.filter(m => m.pinned) },
        { section: '일반', memos: visibleMemos.filter(m => !m.pinned) }
    ].filter(g => g.memos.length > 0);
    // 메모 선택
    const handleSelect = useCallback((id: string) => {
        setSelectedId(id);
        const memo = memos.find(m => m.id === id);
        setEditTitle(memo?.title || '');
        setEditContent(memo?.content || '');
        setSaved(false);
        setEditing(false);
    }, [memos]);
    // 메모 저장
    const handleSave = async (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        if (!selectedId) return;
        try {
            await updateNote(selectedId.toString(), { title: editTitle, content: editContent });
            setSaved(true);
            setEditing(false);
            setTimeout(() => setSaved(false), 1200);
            showSnackbar('메모가 저장되었습니다!', 'success');
            // updateNote 이후 notes 최신 상태 출력
            console.log('[handleSave] notes after update:', notes.map(n => ({ id: n.id, title: n.title, content: n.content })));
        } catch (err) {
            console.error(err);
            showSnackbar('저장 중 오류가 발생했습니다.', 'error');
        }
    };
    // 메모 추가 (다이얼로그 방식)
    const handleAdd = useCallback(async () => {
        if (!user) {
            showSnackbar('로그인 후 메모를 추가할 수 있습니다.', 'error');
            return;
        }
        if (!isDataReady) {
            showSnackbar('데이터가 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.', 'error');
            return;
        }
        if (typeof addNote !== 'function') {
            console.error('[MemoApp] addNote가 함수가 아님:', addNote);
            return;
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
            const newNote = await newNoteResult;
            if (newNote && newNote.id) {
                setSelectedId(newNote.id); // id를 string으로 세팅
                setEditTitle(newNote.title);
                setEditContent(newNote.content);
                setSaved(false);
                setEditing(false);
                showSnackbar('새 메모가 생성되었습니다.', 'success');
            } else if (newNote === null) {
                showSnackbar('메모 생성에 실패했습니다.', 'error');
            } else {
                showSnackbar('메모 생성에 실패했습니다.', 'error');
            }
        } catch (error) {
            console.error('[handleAdd] 메모 생성 중 오류:', error);
            showSnackbar('메모 생성 중 오류가 발생했습니다.', 'error');
        }
    }, [addNote, selectedFolder, user, isDataReady, showSnackbar, notes]);
    // 메모 삭제
    const handleDelete = useCallback(async (id: string) => {
        console.log('[handleDelete] try delete', id, typeof id); // UUID(string)인지 확인
        await deleteNote(id);
        // notes 상태는 context에서 동기화됨
        setSelectedId(null);
        setEditTitle('');
        setEditContent('');
        setSaved(false);
        setEditing(false);
        showSnackbar('메모가 삭제되었습니다.', 'success');
    }, [deleteNote, showSnackbar]);
    // 고정/핀
    const handlePin = useCallback(async (id: string) => {
        const memo = memos.find(m => m.id === id);
        if (memo) {
            await updateNote(id, { pinned: !memo.pinned } as Partial<Memo>);
        }
    }, [memos, updateNote]);
    // 보관
    const handleArchive = useCallback(async (id: string) => {
        const memo = memos.find(m => m.id === id);
        if (memo) {
            await updateNote(id, { archived: !memo.archived } as Partial<Memo>);
            showSnackbar(memo.archived ? '메모가 복원되었습니다.' : '메모가 보관되었습니다.', 'info');
        }
    }, [memos, updateNote, showSnackbar]);
    // 폴더 이동 (category 변경)
    const handleMoveToFolder = useCallback(async (id: string, folderId: string) => {
        await updateNote(id, { category: folderId });
        showSnackbar('메모가 폴더로 이동되었습니다.', 'success');
    }, [updateNote, showSnackbar]);
    // 태그 추가/수정
    const handleUpdateTags = useCallback(async (id: string, tags: string[]) => {
        await updateNote(id, { tags });
        showSnackbar('태그가 업데이트되었습니다.', 'success');
    }, [updateNote, showSnackbar]);
    // 정렬 순서 변경 (order)
    const handleReorder = useCallback(async (id, newOrder) => {
        await updateNote(id, { order: newOrder });
        showSnackbar('메모 순서가 변경되었습니다.', 'success');
    }, [updateNote, showSnackbar]);
    // 공유
    const handleShare = useCallback((memo: Memo) => {
        setShareMemo(memo);
        setShareDialogOpen(true);
    }, []);
    // 복사
    const handleCopy = useCallback(async (memo: Memo) => {
        const text = `${memo.title}\n\n${memo.content}`;
        try {
            await navigator.clipboard.writeText(text);
            showSnackbar('메모가 클립보드에 복사되었습니다.', 'success');
        } catch (err) {
            showSnackbar('복사에 실패했습니다.', 'error');
        }
        setShareDialogOpen(false);
    }, [showSnackbar]);
    // 다운로드
    const handleDownload = useCallback((memo: Memo) => {
        const text = `${memo.title}\n\n${memo.content}`;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${memo.title}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showSnackbar('메모가 다운로드되었습니다.', 'success');
        setShareDialogOpen(false);
    }, [showSnackbar]);
    // 드래그 앤 드롭 핸들러
    const handleDragStart = useCallback((event: any) => {
        setActiveId(event.active.id);
    }, []);
    const handleDragEnd = useCallback((event: any) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            const oldIndex = memos.findIndex(memo => memo.id === active.id);
            const newIndex = memos.findIndex(memo => memo.id === over.id);

            // setMemos(memos => arrayMove(memos, oldIndex, newIndex)); // 이 부분은 메모 리스트 상태가 아니라 현재 편집 중인 메모를 업데이트하는 것이므로 제거
        }
    }, [memos]);
    // MacOS 윈도우 컨트롤 핸들러
    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);
    const handleMinimize = useCallback(() => {
        setIsMinimized(true);
        setTimeout(() => setIsMinimized(false), 1000);
    }, []);
    const handleMaximize = useCallback(() => {
        setIsFullscreen(!isFullscreen);
    }, [isFullscreen]);
    // 폴더 추가 (다이얼로그 방식)
    const handleAddFolder = () => {
        if (!newFolderName.trim()) return;
        const id = Date.now().toString();
        setFolders([...folders, { id, name: newFolderName, color: '#60a5fa', icon: '📁', memoCount: 0 }]);
        setNewFolderName('');
        setAddFolderDialogOpen(false);
    };
    // 폴더 삭제
    const handleDeleteFolder = (id: string) => {
        setFolders(folders.filter(f => f.id !== id));
        if (selectedFolder === id) setSelectedFolder('all');
    };
    // 폴더 이름변경
    const handleEditFolder = (id: string, name: string) => {
        setFolders(folders.map(f => f.id === id ? { ...f, name } : f));
        setEditingFolderId(null);
    };
    const selectedMemo = memos.find(m => m.id === selectedId);
    // 전체화면 스타일 동적 적용
    const fullscreenStyle = isFullscreen ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        borderRadius: 0,
        boxShadow: 'none',
        margin: 0,
        background: '#fff',
        transition: 'all 0.4s cubic-bezier(.4,0,.2,1)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fullscreenEnter 0.4s cubic-bezier(.4,0,.2,1)',
        '@keyframes fullscreenEnter': {
            '0%': {
                transform: 'scale(0.9)',
                opacity: 0.8,
                borderRadius: '16px'
            },
            '100%': {
                transform: 'scale(1)',
                opacity: 1,
                borderRadius: '0px'
            }
        }
    } : {
        transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
    };
    // notes(=memos) 변경 시 선택/편집 상태 자동 초기화
    React.useEffect(() => {
        // 현재 선택된 메모가 notes에서 사라졌을 때만 입력창 초기화
        if (selectedId && !memos.find(m => m.id === selectedId)) {
            if (memos.length > 0) {
                const firstMemo = memos[0] as Memo;
                setSelectedId(firstMemo.id);
                setEditTitle(firstMemo.title);
                setEditContent(firstMemo.content);
                setSaved(true);
                setEditing(false);
            } else {
                setSelectedId(null);
                setEditTitle('');
                setEditContent('');
                setSaved(false);
                setEditing(false);
            }
        }
        // 메모를 새로 추가한 직후에는 setSelectedId(newNote.id)로 직접 동기화됨
    }, [memos, selectedId]);
    // 모든 훅 선언 이후에만 early return
    if (!user) return null;
    if (!isDataReady) return <div>Loading...</div>;
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={isFullscreen ? false : 'lg'}
            fullWidth={!isFullscreen}
            scroll="body"
            PaperProps={{
                sx: isFullscreen
                    ? {
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        maxWidth: '100vw',
                        maxHeight: '100vh',
                        minWidth: 0,
                        minHeight: 0,
                        borderRadius: 0,
                        zIndex: 2000,
                        m: 0,
                        p: 0,
                        transition: 'all 0.5s cubic-bezier(.4,0,.2,1)',
                        boxShadow: '0 8px 32px 0 rgba(80,110,240,0.10)',
                        overflow: 'hidden',
                    }
                    : {
                        borderRadius: 2,
                        transition: 'all 0.5s cubic-bezier(.4,0,.2,1)',
                        minWidth: 700,
                        maxWidth: '68vw',
                        m: { xs: 1, sm: 2, md: 4 },
                        boxShadow: '0 8px 32px 0 rgba(80,110,240,0.10)',
                    },
            }}
        >
            <DialogContent
                className="memoapp-dialog-content"
                sx={{
                    p: 0,
                    minWidth: isFullscreen ? '100vw' : 700,
                    minHeight: isFullscreen ? '100vh' : 600,
                    height: isFullscreen ? '100vh' : 'auto',
                    transition: 'all 0.5s cubic-bezier(.4,0,.2,1)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                }}
            >
                {/* 상단바 */}
                <Box sx={{
                    width: '100%',
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                    background: '#fff',
                    px: 2,
                    pt: 1.5,
                    pb: 0.5,
                    borderBottom: '1px solid #e2e8f0',
                    position: 'relative',
                    zIndex: 10
                }}>
                    {/* MacOS 버튼 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mr: 2, ml: 0.5 }}>
                        <Box sx={{ width: 16, height: 16, bgcolor: '#FF5F57', borderRadius: '50%', cursor: 'pointer' }} onClick={onClose} />
                        <Box sx={{ width: 16, height: 16, bgcolor: '#FFBD2E', borderRadius: '50%', cursor: 'pointer' }} onClick={() => setIsFullscreen(f => !f)} />
                        <Box sx={{ width: 16, height: 16, bgcolor: '#28C840', borderRadius: '50%', cursor: 'pointer' }} onClick={() => setIsFullscreen(f => !f)} />
                    </Box>
                    <Typography sx={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: 18, color: '#22223b' }}>
                        TUK MEMO
                    </Typography>
                    {/* 1. 상단바에서 템플릿 사용, 협업 모드 버튼 제거 */}
                    {/* 2. 상태: templateDialogOpen, collaborationMode, collaborators, setTemplateDialogOpen, setCollaborationMode 등 제거 */}
                    {/* 3. 핸들러: handleUseTemplate, handleToggleCollaboration 등 제거 */}
                    {/* 4. 템플릿 다이얼로그, 협업 관련 코드/JSX 완전 삭제 */}
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {/* PiP 모드 버튼 (노란색) - 남겨두되 동작 없음 */}
                        <Tooltip title="PiP 모드(항상 위에 고정)"><IconButton color="warning" disabled><PushPinIcon /></IconButton></Tooltip>
                        {/* 남은 버튼들만 유지 (고급 검색, 메모 공유, 다운로드 등) */}
                        <Tooltip title="고급 검색">
                            <IconButton
                                onClick={handleAdvancedSearch}
                                size="small"
                                sx={{
                                    color: advancedSearchOpen ? 'primary.main' : 'text.secondary',
                                    bgcolor: advancedSearchOpen ? 'primary.50' : 'transparent'
                                }}
                            >
                                <SearchIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="메모 공유">
                            <IconButton
                                onClick={() => selectedMemo && handleShareMemo(selectedMemo)}
                                size="small"
                                sx={{ color: 'text.secondary' }}
                                disabled={!selectedMemo}
                            >
                                <ContentCopyIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="메모 다운로드">
                            <IconButton
                                onClick={() => selectedMemo && handleDownload(selectedMemo)}
                                size="small"
                                sx={{ color: 'text.secondary' }}
                                disabled={!selectedMemo}
                            >
                                <DownloadIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
                {/* 검색/폴더/메모리스트/상세 */}
                <Box sx={{
                    flex: 1,
                    display: 'flex',
                    minHeight: 0,
                    height: isFullscreen ? 'calc(100vh - 48px - 80px)' : '70vh',
                    userSelect: isResizing ? 'none' : 'auto',
                    gap: isFullscreen ? 4 : 0,
                    transition: 'all 0.5s cubic-bezier(.4,0,.2,1)',
                }}>
                    {/* 좌측: 검색+폴더+메모리스트 */}
                    {!compact && (
                        <Box sx={{
                            width: isMobile ? 90 : (isFullscreen ? 320 : leftPanelWidth),
                            minWidth: isMobile ? 70 : (isFullscreen ? 200 : minPanelWidth),
                            maxWidth: isMobile ? 120 : (isFullscreen ? 400 : maxPanelWidth),
                            bgcolor: '#f8fafc',
                            borderRight: '1px solid #e2e8f0',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'width 0.3s',
                            p: isFullscreen ? 2 : 0,
                        }}>
                            {/* 검색창 */}
                            <Box sx={{ p: 2, pb: 1, borderBottom: '1px solid #e2e8f0' }}>
                                <InputBase
                                    placeholder="검색..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    sx={{
                                        width: '100%',
                                        bgcolor: '#fff',
                                        borderRadius: 2,
                                        px: 1.5,
                                        fontSize: 14,
                                        border: '1px solid #e2e8f0',
                                        height: 36,
                                        transition: 'all 0.2s',
                                        '&:focus-within': {
                                            borderColor: '#60a5fa',
                                            boxShadow: '0 0 0 2px rgba(96, 165, 250, 0.1)'
                                        },
                                        '& .MuiInputBase-input': {
                                            fontSize: 14,
                                            color: '#1e293b'
                                        }
                                    }}
                                    inputProps={{ style: { padding: 0 } }}
                                />
                            </Box>

                            {/* 폴더리스트 */}
                            <Box sx={{ flex: 0, p: 1.5, pt: 2, pb: 0.5 }}>
                                {folders.map(folder => (
                                    <Box
                                        key={folder.id}
                                        onClick={() => setSelectedFolder(folder.id)}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            px: 1.5,
                                            py: 0.8,
                                            borderRadius: 2,
                                            cursor: 'pointer',
                                            bgcolor: selectedFolder === folder.id ? '#e0f2fe' : 'transparent',
                                            color: selectedFolder === folder.id ? '#0ea5e9' : '#64748b',
                                            fontWeight: 600,
                                            fontSize: 14,
                                            mb: 0.5,
                                            transition: 'all 0.2s',
                                            '&:hover': { bgcolor: '#f1f5f9' }
                                        }}
                                    >
                                        <span style={{ fontSize: 16 }}>{folder.icon}</span>
                                        {editingFolderId === folder.id ? (
                                            <>
                                                <input
                                                    value={folder.name}
                                                    onChange={e => handleEditFolder(folder.id, e.target.value)}
                                                    style={{ fontSize: 14, fontWeight: 600, border: 'none', outline: 'none', background: 'transparent', color: 'inherit', width: 60 }}
                                                    autoFocus
                                                />
                                                <IconButton size="small" onClick={() => setEditingFolderId(null)}><CheckIcon fontSize="small" /></IconButton>
                                            </>
                                        ) : (
                                            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {folder.name}
                                            </span>
                                        )}
                                        {/* 전체 폴더는 편집/삭제 불가 */}
                                        {folder.id !== 'all' && (
                                            <>
                                                <IconButton size="small" onClick={e => { e.stopPropagation(); setEditingFolderId(folder.id); }}><EditIcon fontSize="small" /></IconButton>
                                                <IconButton size="small" onClick={e => { e.stopPropagation(); handleDeleteFolder(folder.id); }}><DeleteIcon fontSize="small" /></IconButton>
                                            </>
                                        )}
                                        <Badge
                                            badgeContent={folder.memoCount}
                                            color="primary"
                                            sx={{
                                                '& .MuiBadge-badge': {
                                                    fontSize: 10,
                                                    height: 16,
                                                    minWidth: 16,
                                                    bgcolor: '#60a5fa'
                                                }
                                            }}
                                        />
                                    </Box>
                                ))}
                                {/* 폴더 추가 버튼만 */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                    <IconButton size="small" onClick={() => setAddFolderDialogOpen(true)}><AddIcon fontSize="small" /></IconButton>
                                </Box>
                            </Box>

                            {/* 메모리스트 */}
                            <Box sx={{ flex: 1, overflowY: 'auto', p: 0, mt: 1 }}>
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                >
                                    {grouped.map(group => (
                                        <Box key={group.section} sx={{ mb: 1.5 }}>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: group.section === '고정됨' ? '#facc15' : '#60a5fa',
                                                    pl: 2,
                                                    pt: 1,
                                                    pb: 0.5,
                                                    fontWeight: 700,
                                                    fontSize: 12
                                                }}
                                            >
                                                {group.section}
                                            </Typography>
                                            <SortableContext
                                                items={group.memos.map(m => m.id)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                <List sx={{ p: 0 }}>
                                                    <AnimatePresence>
                                                        {group.memos.map(memo => (
                                                            <SortableMemoItem
                                                                key={memo.id}
                                                                memo={memo}
                                                                isSelected={memo.id === selectedId}
                                                                onSelect={handleSelect}
                                                                onPin={handlePin}
                                                                onDelete={handleDelete}
                                                                onShare={handleShare}
                                                                onArchive={handleArchive}
                                                            />
                                                        ))}
                                                    </AnimatePresence>
                                                </List>
                                            </SortableContext>
                                        </Box>
                                    ))}
                                </DndContext>
                            </Box>

                            {/* 새 메모 버튼 */}
                            <Box sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}>
                                <Tooltip title={!isDataReady ? "데이터 로딩 중..." : "새 메모 추가"}>
                                    <span>
                                        <Button
                                            fullWidth
                                            onClick={() => {
                                                console.log('[MemoApp] 새 메모 버튼 클릭됨');
                                                handleAdd();
                                            }}
                                            disabled={!isDataReady}
                                            startIcon={<AddIcon />}
                                            sx={{
                                                bgcolor: '#60a5fa',
                                                color: '#fff',
                                                fontWeight: 600,
                                                borderRadius: 2,
                                                fontSize: 14,
                                                py: 1,
                                                '&:hover': {
                                                    bgcolor: '#0ea5e9',
                                                    transform: 'translateY(-1px)',
                                                    boxShadow: '0 4px 12px rgba(96, 165, 250, 0.3)'
                                                },
                                                '&:disabled': {
                                                    bgcolor: '#cbd5e1',
                                                    color: '#64748b',
                                                    transform: 'none',
                                                    boxShadow: 'none'
                                                },
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            새 메모
                                        </Button>
                                    </span>
                                </Tooltip>
                            </Box>
                        </Box>
                    )}
                    {/* 드래그 핸들 */}
                    {!isMobile && (
                        <Box
                            sx={{
                                width: dragHandleWidth,
                                cursor: 'col-resize',
                                bgcolor: isResizing ? '#bae6fd' : 'transparent',
                                transition: 'background 0.15s',
                                zIndex: 20,
                                '&:hover': { bgcolor: '#e0e7ef' },
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                userSelect: 'none',
                            }}
                            onMouseDown={() => setIsResizing(true)}
                        >
                            <Box sx={{ width: 2, height: 32, bgcolor: '#cbd5e1', borderRadius: 1 }} />
                        </Box>
                    )}
                    {/* 우측: 메모 상세/편집 */}
                    <Box sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        minWidth: 0,
                        bgcolor: '#fff',
                        overflowY: 'auto',
                        p: isFullscreen ? 5 : { xs: 2, sm: 3 },
                        transition: 'padding 0.3s',
                    }}>
                        {selectedMemo ? (
                            <Box sx={{ maxWidth: 680, mx: 'auto', width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <TextField
                                    variant="standard"
                                    value={editTitle}
                                    onChange={e => {
                                        setEditTitle(e.target.value);
                                        setEditing(true);
                                        setSaved(false);
                                    }}
                                    InputProps={{
                                        disableUnderline: true,
                                        style: {
                                            fontWeight: 700,
                                            fontSize: 22,
                                            background: 'none',
                                            color: '#1e293b'
                                        }
                                    }}
                                    sx={{
                                        width: '100%',
                                        bgcolor: 'transparent',
                                        mb: 2,
                                        border: 'none',
                                        boxShadow: 'none',
                                        outline: 'none'
                                    }}
                                />
                                {/* 에디터 툴바 (항상 상단 고정) */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        bgcolor: isDark ? 'rgba(40,40,40,0.98)' : 'rgba(255,255,255,0.98)',
                                        borderRadius: 6,
                                        boxShadow: isDark ? '0 8px 32px #0008' : '0 8px 32px #0001',
                                        p: { xs: 1, sm: 1.5 },
                                        gap: { xs: 1, sm: 1.5 },
                                        minWidth: 700,
                                        maxWidth: '100%',
                                        overflowX: 'auto',
                                        backdropFilter: 'blur(8px)',
                                        border: isDark ? '1.5px solid #333' : '1.5px solid #e0e8f0',
                                        minHeight: 44,
                                        mb: 2,
                                        mt: 1,
                                        mx: 'auto',
                                        width: 'fit-content',
                                        transition: 'all 0.18s cubic-bezier(.4,0,.2,1)'
                                    }}
                                >
                                    {/* 기존 서식 버튼 */}
                                    {editor && <Tooltip title="굵게"><IconButton size="small" onClick={() => editor.chain().focus().toggleBold().run()} color={editor.isActive('bold') ? 'primary' : 'default'}><FormatBoldIcon /></IconButton></Tooltip>}
                                    {editor && <Tooltip title="이탤릭"><IconButton size="small" onClick={() => editor.chain().focus().toggleItalic().run()} color={editor.isActive('italic') ? 'primary' : 'default'}><FormatItalicIcon /></IconButton></Tooltip>}
                                    {editor && <Tooltip title="밑줄"><IconButton size="small" onClick={() => editor.chain().focus().toggleUnderline().run()} color={editor.isActive('underline') ? 'primary' : 'default'}><FormatUnderlinedIcon /></IconButton></Tooltip>}
                                    {editor && <Tooltip title="취소선"><IconButton size="small" onClick={() => editor.chain().focus().toggleStrike().run()} color={editor.isActive('strike') ? 'primary' : 'default'}><FormatStrikethroughIcon /></IconButton></Tooltip>}
                                    {editor && <Tooltip title="리스트"><IconButton size="small" onClick={() => editor.chain().focus().toggleBulletList().run()} color={editor.isActive('bulletList') ? 'primary' : 'default'}><FormatListBulletedIcon /></IconButton></Tooltip>}
                                    {editor && <Tooltip title="체크박스"><IconButton size="small" onClick={() => editor.chain().focus().toggleList('taskList', 'listItem').run()} color={editor.isActive('taskList') ? 'primary' : 'default'}><CheckBoxIcon /></IconButton></Tooltip>}
                                    {editor && <Tooltip title="인용구"><IconButton size="small" onClick={() => editor.chain().focus().toggleBlockquote().run()} color={editor.isActive('blockquote') ? 'primary' : 'default'}><FormatQuoteIcon /></IconButton></Tooltip>}
                                    {/* 텍스트 정렬 */}
                                    {editor && <Tooltip title="왼쪽 정렬"><IconButton size="small" onClick={() => editor.chain().focus().setTextAlign('left').run()} color={editor.isActive({ textAlign: 'left' }) ? 'primary' : 'default'}><FormatAlignLeftIcon /></IconButton></Tooltip>}
                                    {editor && <Tooltip title="가운데 정렬"><IconButton size="small" onClick={() => editor.chain().focus().setTextAlign('center').run()} color={editor.isActive({ textAlign: 'center' }) ? 'primary' : 'default'}><FormatAlignCenterIcon /></IconButton></Tooltip>}
                                    {editor && <Tooltip title="오른쪽 정렬"><IconButton size="small" onClick={() => editor.chain().focus().setTextAlign('right').run()} color={editor.isActive({ textAlign: 'right' }) ? 'primary' : 'default'}><FormatAlignRightIcon /></IconButton></Tooltip>}
                                    {/* 글자색 팔레트 */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                                        {["#22223b", "#e11d48", "#2563eb", "#059669", "#f59e42", "#fbbf24", "#a21caf", "#64748b"].map(color => (
                                            <IconButton
                                                key={color}
                                                size="small"
                                                sx={{ bgcolor: color, borderRadius: '50%', border: '1.5px solid #e0e8f0', width: 22, height: 22, transition: 'all 0.18s', '&:hover': { boxShadow: '0 2px 8px #60a5fa33', transform: 'scale(1.12)' } }}
                                                onClick={() => editor && editor.chain().focus().setColor(color).run()}
                                            />
                                        ))}
                                    </Box>
                                    {/* 배경색(형광펜) 팔레트 */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                                        {["#fff9c4", "#bae6fd", "#fca5a5", "#bbf7d0", "#bbf7d0", "#f3e8ff", "#fef9c3", "#e0f2fe"].map(color => (
                                            <IconButton
                                                key={color}
                                                size="small"
                                                sx={{ bgcolor: color, borderRadius: '50%', border: '1.5px solid #e0e8f0', width: 22, height: 22, transition: 'all 0.18s', '&:hover': { boxShadow: '0 2px 8px #60a5fa33', transform: 'scale(1.12)' } }}
                                                onClick={() => editor && editor.chain().focus().toggleHighlight({ color }).run()}
                                            />
                                        ))}
                                    </Box>
                                    {/* 링크 삽입 */}
                                    <Tooltip title="링크">
                                        <IconButton size="small" onClick={() => setShowLinkDialog(true)}>
                                            <InsertLinkIcon />
                                        </IconButton>
                                    </Tooltip>
                                    {/* 링크 입력 다이얼로그 */}
                                    <Dialog open={showLinkDialog} onClose={() => setShowLinkDialog(false)}>
                                        <DialogTitle>링크 추가</DialogTitle>
                                        <DialogContent>
                                            <TextField
                                                autoFocus
                                                margin="dense"
                                                label="URL"
                                                type="url"
                                                fullWidth
                                                variant="standard"
                                                value={linkUrl}
                                                onChange={e => setLinkUrl(e.target.value)}
                                            />
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={() => setShowLinkDialog(false)}>취소</Button>
                                            <Button onClick={() => {
                                                if (editor) editor.chain().focus().setLink({ href: linkUrl }).run();
                                                setShowLinkDialog(false);
                                                setLinkUrl('');
                                            }}>추가</Button>
                                        </DialogActions>
                                    </Dialog>
                                </Box>
                                {/* 에디터(에디터 툴바 바로 아래) */}
                                <div style={{
                                    position: 'relative',
                                    minHeight: 400,
                                    marginBottom: 20,
                                    borderRadius: 20,
                                    background: isDark ? 'rgba(36,37,40,0.98)' : '#f8fafc',
                                    border: isDark ? '1.5px solid #333' : '1.5px solid #e0e8f0',
                                    boxShadow: isDark ? '0 8px 32px #0008' : '0 8px 32px #0001',
                                    padding: '32px 32px 40px 32px',
                                    fontFamily: 'Pretendard, Inter, Apple SD Gothic Neo, sans-serif',
                                    fontSize: 17,
                                    color: isDark ? '#f3f4f6' : '#22223b',
                                    lineHeight: 1.7,
                                    transition: 'all 0.18s cubic-bezier(.4,0,.2,1)'
                                }}>
                                    <EditorContent editor={editor} style={{ minHeight: 220, outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit', background: 'none', transition: 'all 0.18s cubic-bezier(.4,0,.2,1)' }} />
                                </div>
                                {/* 하단 저장/자동저장 영역 */}
                                <Box sx={{ textAlign: 'right', mt: 'auto', pb: 1 }}>
                                    <Typography
                                        variant="caption"
                                        color={saved ? 'success.main' : editing ? '#facc15' : '#60a5fa'}
                                        sx={{ mr: 2 }}
                                    >
                                        {saved ? '저장됨' : editing ? '수정중...' : '자동저장'}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        onClick={handleSave}
                                        size="small"
                                        sx={{
                                            bgcolor: '#60a5fa',
                                            color: '#fff',
                                            fontWeight: 600,
                                            borderRadius: 2,
                                            px: 3,
                                            py: 1,
                                            boxShadow: 'none',
                                            '&:hover': { bgcolor: '#0ea5e9' },
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        저장
                                    </Button>
                                </Box>
                            </Box>
                        ) : (
                            <Typography
                                color="#60a5fa"
                                sx={{
                                    mt: 8,
                                    textAlign: 'center',
                                    fontWeight: 600,
                                    fontSize: 16
                                }}
                            >
                                메모를 선택하거나 새로 추가해보세요.
                            </Typography>
                        )}
                    </Box>
                </Box>

                {/* 고급 검색 패널 */}
                {advancedSearchOpen && (
                    <Box sx={{
                        p: isFullscreen ? 4 : 2,
                        borderBottom: '1px solid rgba(0,0,0,0.1)',
                        bgcolor: 'grey.50',
                        borderRadius: 2,
                        mb: 1,
                        width: '100%',
                        maxWidth: { xs: '100vw', sm: '100vw', md: isFullscreen ? '100%' : 1300 },
                        minWidth: 0,
                        mx: isFullscreen ? 0 : 'auto',
                        transition: 'all 0.5s cubic-bezier(.4,0,.2,1)',
                    }}>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2, flexWrap: 'wrap', rowGap: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, minWidth: 100, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SearchIcon sx={{ fontSize: 22, color: '#60a5fa' }} /> 고급 검색
                            </Typography>
                            <InputBase
                                placeholder="검색어를 입력하세요..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                sx={{
                                    bgcolor: '#fff',
                                    borderRadius: 2,
                                    px: 2,
                                    fontSize: 15,
                                    border: '1px solid #e2e8f0',
                                    height: 40,
                                    minWidth: 220,
                                    boxShadow: '0 1px 4px #60a5fa11',
                                    flex: 1
                                }}
                                inputProps={{ style: { padding: 0 } }}
                            />
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>폴더</InputLabel>
                                <Select
                                    value={searchFilters.folder}
                                    onChange={(e) => setSearchFilters(prev => ({ ...prev, folder: e.target.value }))}
                                    label="폴더"
                                >
                                    <MenuItem value="all">전체</MenuItem>
                                    {folders.filter(f => f.id !== 'all').map(folder => (
                                        <MenuItem key={folder.id} value={folder.id}>
                                            {folder.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={searchFilters.pinned}
                                        onChange={(e) => setSearchFilters(prev => ({ ...prev, pinned: e.target.checked }))}
                                    />
                                }
                                label="고정된 메모만"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={searchFilters.archived}
                                        onChange={(e) => setSearchFilters(prev => ({ ...prev, archived: e.target.checked }))}
                                    />
                                }
                                label="보관된 메모 포함"
                            />
                            <Button
                                variant="outlined"
                                onClick={() => setSearchFilters({
                                    dateRange: null,
                                    tags: [],
                                    folder: 'all',
                                    pinned: false,
                                    archived: false
                                })}
                                size="medium"
                                sx={{ height: 40, borderRadius: 2, color: '#38bdf8', borderColor: '#38bdf8', fontWeight: 600, ml: 1 }}
                            >
                                필터 초기화
                            </Button>
                        </Stack>
                    </Box>
                )}

                {/* 스낵바 */}
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={3000}
                    onClose={() => setSnackbarOpen(false)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={() => setSnackbarOpen(false)}
                        severity={snackbarSeverity}
                        sx={{ width: '100%' }}
                    >
                        {snackbarMessage}
                    </Alert>
                </Snackbar>

                {/* 템플릿 다이얼로그 */}
                {/* 공유 다이얼로그 */}
                <Dialog
                    open={shareDialogOpen}
                    onClose={() => setShareDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle sx={{ fontWeight: 700 }}>
                        메모 공유
                    </DialogTitle>
                    <DialogContent>
                        {shareMemo && (
                            <Box>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    "{shareMemo.title}" 공유하기
                                </Typography>

                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                                        공유 링크:
                                    </Typography>
                                    <Box sx={{
                                        p: 2,
                                        bgcolor: 'grey.100',
                                        borderRadius: 1,
                                        fontFamily: 'monospace',
                                        fontSize: '0.875rem'
                                    }}>
                                        {`${window.location.origin}/memo/${shareMemo.id}`}
                                    </Box>
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                                        협업자 추가:
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="이메일 주소 입력"
                                        size="small"
                                        sx={{ mb: 1 }}
                                    />
                                    <Button variant="outlined" size="small">
                                        추가
                                    </Button>
                                </Box>

                                <Box>
                                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                                        권한 설정:
                                    </Typography>
                                    <FormControlLabel
                                        control={<Checkbox defaultChecked />}
                                        label="읽기 권한"
                                    />
                                    <FormControlLabel
                                        control={<Checkbox />}
                                        label="편집 권한"
                                    />
                                </Box>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCopyShareLink}>
                            링크 복사
                        </Button>
                        <Button variant="contained">
                            공유하기
                        </Button>
                        <Button onClick={() => setShareDialogOpen(false)}>
                            닫기
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* 폴더 추가 다이얼로그 */}
                <Dialog open={addFolderDialogOpen} onClose={() => setAddFolderDialogOpen(false)}>
                    <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, fontSize: 22, letterSpacing: '-0.5px', pt: 3 }}>새 폴더 생성</DialogTitle>
                    <DialogContent
                        sx={{
                            bgcolor: '#f8fafc',
                            borderRadius: 4,
                            boxShadow: '0 8px 32px 0 rgba(80,110,240,0.10)',
                            p: 4,
                            minWidth: 320,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                            <Box sx={{ fontSize: 28, color: '#60a5fa', mr: 1 }}>📁</Box>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="폴더 이름"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={newFolderName}
                                onChange={e => setNewFolderName(e.target.value)}
                                placeholder="예: 2024 프로젝트, 회의록 등"
                                InputProps={{
                                    sx: {
                                        bgcolor: '#fff',
                                        borderRadius: 2,
                                        fontWeight: 600,
                                        fontSize: 17,
                                        px: 2,
                                        boxShadow: '0 2px 8px #60a5fa11',
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#bae6fd' },
                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#38bdf8' },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#38bdf8', borderWidth: 2 }
                                    }
                                }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
                        <Button
                            onClick={() => setAddFolderDialogOpen(false)}
                            sx={{
                                bgcolor: '#f1f5f9',
                                color: '#64748b',
                                borderRadius: 2,
                                px: 4,
                                py: 1.2,
                                fontWeight: 600,
                                fontSize: 16,
                                boxShadow: 'none',
                                '&:hover': { bgcolor: '#e0e7ef' },
                                transition: 'all 0.18s'
                            }}
                        >취소</Button>
                        <Button
                            onClick={handleAddFolder}
                            disabled={!newFolderName.trim()}
                            sx={{
                                bgcolor: '#38bdf8',
                                color: '#fff',
                                borderRadius: 2,
                                px: 4,
                                py: 1.2,
                                fontWeight: 700,
                                fontSize: 16,
                                boxShadow: 'none',
                                '&:hover': { bgcolor: '#0ea5e9' },
                                transition: 'all 0.18s'
                            }}
                        >확인</Button>
                    </DialogActions>
                </Dialog>
            </DialogContent>
        </Dialog>
    );
};

export default MemoApp; 