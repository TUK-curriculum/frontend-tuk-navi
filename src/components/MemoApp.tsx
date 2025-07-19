// MemoApp.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
    Box, Typography, Button, IconButton, List,
    TextField, Tooltip, InputBase, Dialog,
    Snackbar, Alert, Badge, useMediaQuery,
    DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DndContext, closestCenter, KeyboardSensor, PointerSensor,
    useSensor, useSensors, DragOverlay
} from '@dnd-kit/core';
import {
    arrayMove, SortableContext, sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { EditorContent } from '@tiptap/react';

// 아이콘 imports
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatStrikethroughIcon from '@mui/icons-material/FormatStrikethrough';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';

// 커스텀 훅 및 컴포넌트 imports
import { useMemosData } from './hooks/useMemosData';
import { useFolders } from './hooks/useFolders';
import { useSearch } from './hooks/useSearch';
import { useMemoEditor } from './hooks/useEditor';
import SortableMemoItem from './components/SortableMemoItem';
import { PANEL_CONFIG, COLORS } from './constants';
import { Memo, Folder } from '../utils/types';

interface MemoAppProps {
    open: boolean;
    onClose: () => void;
}

const MemoApp: React.FC<MemoAppProps> = ({ open, onClose }) => {
    const theme = useMuiTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isDark = theme.palette.mode === 'dark';

    // 커스텀 훅들
    const {
        memos,
        snackbar,
        hideSnackbar,
        handleAddMemo,
        handleUpdateMemo,
        handleDeleteMemo
    } = useMemosData();

    const {
        folders,
        selectedFolder,
        setSelectedFolder,
        editingFolderId,
        setEditingFolderId,
        handleAddFolder,
        handleDeleteFolder,
        handleEditFolder,
    } = useFolders(memos);

    const {
        search,
        setSearch,
        advancedSearchOpen,
        setAdvancedSearchOpen,
        groupedMemos,
        clearFilters,
    } = useSearch(memos, selectedFolder);

    // 로컬 상태
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editing, setEditing] = useState(false);
    const [saved, setSaved] = useState(false);
    const [leftPanelWidth, setLeftPanelWidth] = useState(PANEL_CONFIG.DEFAULT_WIDTH);
    const [isResizing, setIsResizing] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [addFolderDialogOpen, setAddFolderDialogOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    // 에디터 훅
    const {
        editor,
        linkDialogOpen,
        setLinkDialogOpen,
        linkUrl,
        setLinkUrl,
        handleAddLink
    } = useMemoEditor(editContent, (content) => {
        setEditContent(content);
        setEditing(true);
        setSaved(false);
    });

    // 드래그 앤 드롭 센서
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // 리사이징 핸들러
    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            const dialog = document.querySelector('.memoapp-dialog-content') as HTMLElement;
            if (!dialog) return;

            const rect = dialog.getBoundingClientRect();
            let newWidth = e.clientX - rect.left;

            newWidth = Math.max(PANEL_CONFIG.MIN_WIDTH, Math.min(PANEL_CONFIG.MAX_WIDTH, newWidth));
            setLeftPanelWidth(newWidth);
        };

        const handleMouseUp = () => setIsResizing(false);

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    // 메모 선택 핸들러
    const handleSelectMemo = useCallback((id: string) => {
        setSelectedId(id);
        const memo = memos.find(m => m.id === id);
        if (memo) {
            setEditTitle(memo.title);
            setEditContent(memo.content);
            setSaved(false);
            setEditing(false);
        }
    }, [memos]);

    // 메모 저장 핸들러 (수정됨)
    const handleSave = useCallback(async (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        if (!selectedId) return;

        // ① 에디터의 실제 최신 내용 가져오기
        const currentContent = editor?.getHTML() || editContent;
        const currentTitle = editTitle.trim();
        const updateData = { title: currentTitle, content: currentContent };

        // 디버깅용 로그 추가
        console.log('🟦 editor:', editor);
        console.log('🟦 editor.getHTML:', editor?.getHTML());
        console.log('🟦 editTitle:', editTitle);
        console.log('🟦 editContent:', editContent);
        console.log('🟦 updateData:', updateData);

        // ② 디버깅 로그
        console.log('🔍 [handleSave] 시작:', {
            selectedId,
            currentTitle,
            currentContent: currentContent.slice(0, 100) + '…'
        });

        try {
            console.log('📤 [handleSave] 전송 데이터:', updateData);

            await handleUpdateMemo(selectedId.toString(), updateData);
            // handleUpdateMemo는 내부적으로 showSnackbar 호출함

            setSaved(true);
            setEditing(false);
            setTimeout(() => setSaved(false), 1200);
            showSnackbar('메모가 저장되었습니다!', 'success');
            console.log('📊 [handleSave] memos 상태:', memos.map(n => ({
                id: n.id,
                title: n.title,
                content: n.content.slice(0, 50) + '…'
            })));
        } catch (err) {
            console.error('❌ [handleSave] 오류:', err);
            showSnackbar('저장 중 오류가 발생했습니다.', 'error');
        }
    }, [selectedId, editTitle, editContent, editor, handleUpdateMemo, memos, showSnackbar]);

    // 새 메모 추가 핸들러
    const handleAdd = useCallback(async () => {
        const newMemo = await handleAddMemo(selectedFolder);
        if (newMemo) {
            setSelectedId(newMemo.id);
            setEditTitle(newMemo.title);
            setEditContent(newMemo.content);
            setSaved(false);
            setEditing(false);
        }
    }, [handleAddMemo, selectedFolder]);

    // 메모 고정/해제 핸들러
    const handlePin = useCallback(async (id: string) => {
        const memo = memos.find(m => m.id === id);
        if (memo) {
            await handleUpdateMemo(id, { pinned: !memo.pinned });
        }
    }, [memos, handleUpdateMemo]);

    // 메모 삭제 핸들러
    const handleDelete = useCallback(async (id: string) => {
        await handleDeleteMemo(id);
        if (selectedId === id) {
            setSelectedId(null);
            setEditTitle('');
            setEditContent('');
            setSaved(false);
            setEditing(false);
        }
    }, [handleDeleteMemo, selectedId]);

    // 드래그 앤 드롭 핸들러
    const handleDragStart = useCallback((event: any) => {
        setActiveId(event.active.id);
    }, []);

    const handleDragEnd = useCallback((event: any) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            // 드래그 앤 드롭 순서 변경 로직
            console.log('메모 순서 변경:', active.id, '->', over.id);
        }
    }, []);

    // 폴더 추가 핸들러
    const handleAddFolderSubmit = useCallback(() => {
        if (newFolderName.trim()) {
            handleAddFolder(newFolderName);
            setNewFolderName('');
            setAddFolderDialogOpen(false);
        }
    }, [newFolderName, handleAddFolder]);

    const selectedMemo = memos.find((m: Memo) => m.id === selectedId);

    // TipTap 에디터 동기화 개선
    useEffect(() => {
        if (editor && editContent !== editor.getHTML()) {
            console.log('🔄 [에디터동기화] 기존→새:', {
                old: editor.getHTML().slice(0, 50) + '…',
                new: editContent.slice(0, 50) + '…'
            });
            editor.commands.setContent(editContent || '<p></p>', { emitUpdate: false });
        }
    }, [editContent, editor]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            scroll="body"
            PaperProps={{
                sx: {
                    borderRadius: 2,
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
                    minWidth: 700,
                    minHeight: 600,
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
                    background: '#fff',
                    px: 2,
                    pt: 1.5,
                    pb: 0.5,
                    borderBottom: '1px solid #e2e8f0',
                    position: 'relative',
                    zIndex: 10
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mr: 2, ml: 0.5 }}>
                        <Box sx={{ width: 16, height: 16, bgcolor: '#FF5F57', borderRadius: '50%', cursor: 'pointer' }} onClick={onClose} />
                        <Box sx={{ width: 16, height: 16, bgcolor: '#FFBD2E', borderRadius: '50%', cursor: 'pointer' }} />
                        <Box sx={{ width: 16, height: 16, bgcolor: '#28C840', borderRadius: '50%', cursor: 'pointer' }} />
                    </Box>
                    <Typography sx={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: 18, color: '#22223b' }}>
                        TUK MEMO
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Tooltip title="고급 검색">
                            <IconButton
                                onClick={() => setAdvancedSearchOpen(!advancedSearchOpen)}
                                size="small"
                                sx={{
                                    color: advancedSearchOpen ? 'primary.main' : 'text.secondary',
                                    bgcolor: advancedSearchOpen ? 'primary.50' : 'transparent'
                                }}
                            >
                                <SearchIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* 메인 콘텐츠 */}
                <Box sx={{
                    flex: 1,
                    display: 'flex',
                    minHeight: 0,
                    height: '70vh',
                    userSelect: isResizing ? 'none' : 'auto',
                }}>
                    {/* 좌측 패널 */}
                    <Box sx={{
                        width: isMobile ? 90 : leftPanelWidth,
                        minWidth: isMobile ? 70 : PANEL_CONFIG.MIN_WIDTH,
                        maxWidth: isMobile ? 120 : PANEL_CONFIG.MAX_WIDTH,
                        bgcolor: '#f8fafc',
                        borderRight: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'width 0.3s',
                    }}>
                        {/* 검색창 */}
                        <Box sx={{ p: 2, pb: 1, borderBottom: '1px solid #e2e8f0' }}>
                            <InputBase
                                placeholder="검색..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
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
                                    }
                                }}
                            />
                        </Box>

                        {/* 폴더 리스트 */}
                        <Box sx={{ flex: 0, p: 1.5, pt: 2, pb: 0.5 }}>
                            {folders.map((folder: Folder) => (
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
                                                onChange={(e) => handleEditFolder(folder.id, e.target.value)}
                                                onBlur={() => setEditingFolderId(null)}
                                                onKeyPress={(e) => e.key === 'Enter' && setEditingFolderId(null)}
                                                style={{
                                                    fontSize: 14,
                                                    fontWeight: 600,
                                                    border: 'none',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                    color: 'inherit',
                                                    width: 60
                                                }}
                                                autoFocus
                                            />
                                            <IconButton size="small" onClick={() => setEditingFolderId(null)}>
                                                <CheckIcon fontSize="small" />
                                            </IconButton>
                                        </>
                                    ) : (
                                        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {folder.name}
                                        </span>
                                    )}
                                    {folder.id !== 'all' && (
                                        <>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingFolderId(folder.id);
                                                }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteFolder(folder.id);
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
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
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                <IconButton size="small" onClick={() => setAddFolderDialogOpen(true)}>
                                    <AddIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>

                        {/* 메모 리스트 */}
                        <Box sx={{ flex: 1, overflowY: 'auto', p: 0, mt: 1 }}>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                            >
                                {groupedMemos.map((group: { section: string; memos: Memo[] }) => (
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
                                            items={group.memos.map((m: Memo) => m.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            <List sx={{ p: 0 }}>
                                                <AnimatePresence>
                                                    {group.memos.map((memo: Memo) => (
                                                        <SortableMemoItem
                                                            key={memo.id}
                                                            memo={memo}
                                                            isSelected={memo.id === selectedId}
                                                            onSelect={handleSelectMemo}
                                                            onPin={handlePin}
                                                            onDelete={handleDelete}
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
                            <Button
                                fullWidth
                                onClick={handleAdd}
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
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                새 메모
                            </Button>
                        </Box>
                    </Box>

                    {/* 드래그 핸들 */}
                    {!isMobile && (
                        <Box
                            sx={{
                                width: PANEL_CONFIG.DRAG_HANDLE_WIDTH,
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

                    {/* 우측 패널 - 메모 편집 */}
                    <Box sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        minWidth: 0,
                        bgcolor: '#fff',
                        overflowY: 'auto',
                        p: { xs: 2, sm: 3 },
                    }}>
                        {selectedMemo ? (
                            <Box sx={{ maxWidth: 680, mx: 'auto', width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <TextField
                                    variant="standard"
                                    value={editTitle}
                                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                                        const val = e.target.value;
                                        console.log('📝 [타이틀변경]', val);
                                        setEditTitle(val);
                                        setEditing(true);
                                        setSaved(false);
                                    }, [])}
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

                                {/* 에디터 툴바 */}
                                <Box sx={{
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
                                }}>
                                    {editor && (
                                        <>
                                            <Tooltip title="굵게">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => editor.chain().focus().toggleBold().run()}
                                                    color={editor.isActive('bold') ? 'primary' : 'default'}
                                                >
                                                    <FormatBoldIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="이탤릭">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => editor.chain().focus().toggleItalic().run()}
                                                    color={editor.isActive('italic') ? 'primary' : 'default'}
                                                >
                                                    <FormatItalicIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="밑줄">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                                                    color={editor.isActive('underline') ? 'primary' : 'default'}
                                                >
                                                    <FormatUnderlinedIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="취소선">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => editor.chain().focus().toggleStrike().run()}
                                                    color={editor.isActive('strike') ? 'primary' : 'default'}
                                                >
                                                    <FormatStrikethroughIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="리스트">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                                                    color={editor.isActive('bulletList') ? 'primary' : 'default'}
                                                >
                                                    <FormatListBulletedIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="체크박스">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => editor.chain().focus().toggleList('taskList', 'listItem').run()}
                                                    color={editor.isActive('taskList') ? 'primary' : 'default'}
                                                >
                                                    <CheckBoxIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="인용구">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                                                    color={editor.isActive('blockquote') ? 'primary' : 'default'}
                                                >
                                                    <FormatQuoteIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="왼쪽 정렬">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                                                    color={editor.isActive({ textAlign: 'left' }) ? 'primary' : 'default'}
                                                >
                                                    <FormatAlignLeftIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="가운데 정렬">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                                                    color={editor.isActive({ textAlign: 'center' }) ? 'primary' : 'default'}
                                                >
                                                    <FormatAlignCenterIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="오른쪽 정렬">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                                                    color={editor.isActive({ textAlign: 'right' }) ? 'primary' : 'default'}
                                                >
                                                    <FormatAlignRightIcon />
                                                </IconButton>
                                            </Tooltip>

                                            {/* 글자색 팔레트 */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                                                {COLORS.TEXT.map((color: string) => (
                                                    <IconButton
                                                        key={color}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: color,
                                                            borderRadius: '50%',
                                                            border: '1.5px solid #e0e8f0',
                                                            width: 22,
                                                            height: 22,
                                                            transition: 'all 0.18s',
                                                            '&:hover': {
                                                                boxShadow: '0 2px 8px #60a5fa33',
                                                                transform: 'scale(1.12)'
                                                            }
                                                        }}
                                                        onClick={() => editor.chain().focus().setColor(color).run()}
                                                    />
                                                ))}
                                            </Box>

                                            {/* 배경색 팔레트 */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                                                {COLORS.HIGHLIGHT.map((color: string) => (
                                                    <IconButton
                                                        key={color}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: color,
                                                            borderRadius: '50%',
                                                            border: '1.5px solid #e0e8f0',
                                                            width: 22,
                                                            height: 22,
                                                            transition: 'all 0.18s',
                                                            '&:hover': {
                                                                boxShadow: '0 2px 8px #60a5fa33',
                                                                transform: 'scale(1.12)'
                                                            }
                                                        }}
                                                        onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
                                                    />
                                                ))}
                                            </Box>

                                            {/* 링크 삽입 */}
                                            <Tooltip title="링크">
                                                <IconButton size="small" onClick={() => setLinkDialogOpen(true)}>
                                                    <InsertLinkIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </>
                                    )}
                                </Box>

                                {/* 에디터 */}
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
                                    <EditorContent
                                        editor={editor}
                                        style={{
                                            minHeight: 220,
                                            outline: 'none',
                                            fontFamily: 'inherit',
                                            fontSize: 'inherit',
                                            color: 'inherit',
                                            background: 'none',
                                            transition: 'all 0.18s cubic-bezier(.4,0,.2,1)'
                                        }}
                                    />
                                </div>

                                {/* 저장 버튼 */}
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

                {/* 스낵바 */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={hideSnackbar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={hideSnackbar}
                        severity={snackbar.severity}
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>

                {/* 폴더 추가 다이얼로그 */}
                <Dialog open={addFolderDialogOpen} onClose={() => setAddFolderDialogOpen(false)}>
                    <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, fontSize: 22, letterSpacing: '-0.5px', pt: 3 }}>
                        새 폴더 생성
                    </DialogTitle>
                    <DialogContent sx={{
                        bgcolor: '#f8fafc',
                        borderRadius: 4,
                        boxShadow: '0 8px 32px 0 rgba(80,110,240,0.10)',
                        p: 4,
                        minWidth: 320,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2
                    }}>
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
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder="예: 2024 프로젝트, 회의록 등"
                                onKeyPress={(e) => e.key === 'Enter' && handleAddFolderSubmit()}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
                        <Button
                            onClick={() => setAddFolderDialogOpen(false)}
                            sx={{ borderRadius: 2, px: 4, py: 1.2 }}
                        >
                            취소
                        </Button>
                        <Button
                            onClick={handleAddFolderSubmit}
                            disabled={!newFolderName.trim()}
                            variant="contained"
                            sx={{ borderRadius: 2, px: 4, py: 1.2 }}
                        >
                            확인
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* 링크 다이얼로그 */}
                <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)}>
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
                            onChange={(e) => setLinkUrl(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddLink()}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setLinkDialogOpen(false)}>취소</Button>
                        <Button onClick={handleAddLink}>추가</Button>
                    </DialogActions>
                </Dialog>
            </DialogContent>
        </Dialog>
    );
};

export default MemoApp;
