// components/SortableMemoItem.tsx
import React, { memo } from 'react';
import { Box, ListItem, Typography, Avatar, Chip, Tooltip, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Memo } from '../utils/types';
import NoteIcon from '@mui/icons-material/Note';
import PushPinIcon from '@mui/icons-material/PushPin';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

interface SortableMemoItemProps {
    memo: Memo;
    isSelected: boolean;
    onSelect: (id: number) => void;
    onPin: (id: number) => void;
    onDelete: (id: number) => void;
    onArchive: (id: number) => Promise<void>;
    onShare: (memo: Memo) => void; 
}

// HTML 태그 제거 유틸 함수
function stripHtml(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

const SortableMemoItem: React.FC<SortableMemoItemProps> = memo((props) => {
    if (!props.memo) {
        throw new Error('memo prop is required for SortableMemoItem');
    }
    const { memo, isSelected, onSelect, onPin, onDelete } = props;
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: memo.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const getContentPreview = (content: string) => {
        const preview = stripHtml(content).replace(/\n/g, ' ').trim();
        return preview.length > 0
            ? (preview.length > 60 ? preview.slice(0, 60) + '...' : preview)
            : '';
    };

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
        >
            <ListItem
                disablePadding
                sx={{
                    borderRadius: 2,
                    mx: 1,
                    my: 0.5,
                    bgcolor: isSelected ? (memo.pinned ? '#fef9c3' : '#e0f2fe') : 'transparent',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    minHeight: 48,
                    '&:hover': {
                        bgcolor: memo.pinned ? '#fef9c3' : '#f1f5f9',
                        transform: 'translateX(2px)',
                    },
                    px: 1.5,
                    boxShadow: isSelected ? '0 2px 8px rgba(96, 165, 250, 0.15)' : undefined,
                    border: isDragging ? '2px dashed #60a5fa' : 'none',
                }}
            >
                <Box
                    onClick={() => onSelect(memo.id)}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        cursor: 'pointer',
                        p: 1,
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'rgba(96, 165, 250, 0.05)' }
                    }}
                >
                    <Box
                        {...attributes}
                        {...listeners}
                        sx={{
                            cursor: 'grab',
                            mr: 1,
                            color: '#60a5fa',
                            '&:active': { cursor: 'grabbing' },
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <DragIndicatorIcon fontSize="small" />
                    </Box>

                    <Avatar sx={{
                        width: 24,
                        height: 24,
                        bgcolor: memo.pinned ? '#facc15' : '#e0f2fe',
                        color: memo.pinned ? '#fff' : '#0ea5e9',
                        fontWeight: 700,
                        mr: 1
                    }}>
                        <NoteIcon fontSize="small" />
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography fontWeight={600} fontSize={14} noWrap color="#1e293b">
                            {memo.title}
                        </Typography>
                        {(() => {
                            const preview = getContentPreview(memo.content);
                            return preview ? (
                                <Typography fontSize={12} color="#60a5fa" noWrap>
                                    {preview}
                                </Typography>
                            ) : null;
                        })()}
                        {/* 필요 시 태그 표시 */}
                        {memo.tags.length > 0 && (
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                {memo.tags.slice(0, 2).map((tag: string, idx: number) => (
                                    <Chip
                                        key={idx}
                                        label={tag}
                                        size="small"
                                        sx={{
                                            height: 16,
                                            fontSize: 10,
                                            bgcolor: '#f1f5f9',
                                            color: '#64748b',
                                        }}
                                    />
                                ))}
                                {memo.tags.length > 2 && (
                                    <Typography fontSize={10} color="#94a3b8">
                                        +{memo.tags.length - 2}
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Box>

                    {memo.pinned && (
                        <Tooltip title="고정됨">
                            <PushPinIcon sx={{ color: '#facc15', fontSize: 16, mr: 0.5 }} />
                        </Tooltip>
                    )}

                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title={memo.pinned ? "고정 해제" : "고정"}>
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPin(memo.id);
                                }}
                                sx={{
                                    color: '#facc15',
                                    transition: 'all 0.15s',
                                    '&:hover': {
                                        color: '#eab308',
                                        transform: 'scale(1.1)',
                                    }
                                }}
                            >
                                <PushPinIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="삭제">
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(memo.id);
                                }}
                                sx={{
                                    color: '#fca5a5',
                                    transition: 'all 0.15s',
                                    '&:hover': {
                                        color: '#ef4444',
                                        transform: 'scale(1.1)',
                                    }
                                }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </ListItem>
        </motion.div>
    );
});

export default SortableMemoItem;
