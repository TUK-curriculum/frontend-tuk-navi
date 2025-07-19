import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, List, ListItem, ListItemText, Checkbox, ListItemIcon, Divider } from '@mui/material';
import { Course } from '../../types/course';

interface OcrResultModalProps {
    open: boolean;
    onClose: () => void;
    suggestions: Partial<Course>[];
    onApply: (selectedCourses: Partial<Course>[]) => void;
}

const OcrResultModal: React.FC<OcrResultModalProps> = ({ open, onClose, suggestions, onApply }) => {
    const [selected, setSelected] = useState<Set<string>>(new Set());

    useEffect(() => {
        // 모달이 열릴 때 모든 제안을 기본으로 선택
        if (open) {
            setSelected(new Set(suggestions.map(s => s.id!)));
        }
    }, [open, suggestions]);

    const handleToggle = (id: string) => {
        const newSelected = new Set(selected);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelected(newSelected);
    };

    const handleApplyClick = () => {
        const selectedCourses = suggestions.filter(s => selected.has(s.id!));
        onApply(selectedCourses);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle fontWeight="bold">과목 추가 제안</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    이미지를 분석하여 아래 과목들을 찾았습니다. 시간표에 추가할 과목을 선택해주세요.
                </Typography>
                <List sx={{ bgcolor: 'background.paper' }}>
                    {suggestions.map((s) => {
                        const labelId = `checkbox-list-label-${s.id}`;
                        return (
                            <ListItem
                                key={s.id}
                                role="listitem"
                                button
                                onClick={() => handleToggle(s.id!)}
                            >
                                <ListItemIcon>
                                    <Checkbox
                                        edge="start"
                                        checked={selected.has(s.id!)}
                                        tabIndex={-1}
                                        disableRipple
                                        inputProps={{ 'aria-labelledby': labelId }}
                                    />
                                </ListItemIcon>
                                <ListItemText
                                    id={labelId}
                                    primary={s.name}
                                    secondary={`요일: ${s.day}, 교시: ${s.startPeriod}-${s.endPeriod}`}
                                />
                            </ListItem>
                        );
                    })}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>취소</Button>
                <Button onClick={handleApplyClick} variant="contained" disabled={selected.size === 0}>
                    {selected.size}개 과목 추가
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default OcrResultModal; 