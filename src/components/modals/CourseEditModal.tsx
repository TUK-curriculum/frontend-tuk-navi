import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography
} from '@mui/material';
import { Course, CourseType, DayKey } from '../../types/course';
import { periods } from '../../data/periodMap';

interface CourseEditModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (courseData: Partial<Course>) => void;
    course?: Course | null;
    onDelete?: (id: string) => void;
}

const CourseEditModal: React.FC<CourseEditModalProps> = ({
    open,
    onClose,
    onSave,
    course,
    onDelete
}) => {
    const [form, setForm] = useState({
        code: '',
        name: '',
        day: 'monday' as DayKey,
        startPeriod: 1,
        endPeriod: 1,
        instructor: '',
        room: '',
        credits: 3,
        type: 'GE' as CourseType
    });

    // 요일
    const dayOptions = [
        { value: 'monday', label: '월요일' },
        { value: 'tuesday', label: '화요일' },
        { value: 'wednesday', label: '수요일' },
        { value: 'thursday', label: '목요일' },
        { value: 'friday', label: '금요일' },
        { value: 'saturday', label: '토요일' },
        { value: 'sunday', label: '일요일' }
    ];

    // 이수 구분
    const typeOptions = [
        { value: 'GR', label: '교양필수' },
        { value: 'GE', label: '교양선택' },
        { value: 'MR', label: '전공필수' },
        { value: 'ME', label: '전공선택' },
        { value: 'RE', label: '현장연구' },
        { value: 'FE', label: '자유선택' }
    ];

    // 교시
    const periodOptions = Array.from({ length: 14 }, (_, i) => ({
        value: i + 1,
        label: `${i + 1}교시 (${periods[i]?.start || ''} - ${periods[i]?.end || ''})`
    }));

    useEffect(() => {
        if (course) {
            const displayCode = (course as any).LectureCode?.code || course.code || '';

            setForm({
                code: displayCode,
                name: course.name || '',
                day: (course.day || 'monday') as DayKey,
                startPeriod: course.startPeriod || 1,
                endPeriod: course.endPeriod || 1,
                instructor: course.instructor || '',
                room: course.room || '',
                credits: course.credits || 3,
                type: course.type || 'GE'
            });
        } else {
            setForm({
                code: '',
                name: '',
                day: 'monday' as DayKey,
                startPeriod: 1,
                endPeriod: 1,
                instructor: '',
                room: '',
                credits: 3,
                type: 'GE'
            });
        }
    }, [course, open]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: name === 'startPeriod' || name === 'endPeriod' || name === 'credits' 
                ? parseInt(value, 10) 
                : name === 'day'
                ? value as DayKey
                : value
        }));
    };

    const handleSave = () => {
        if (form.startPeriod > form.endPeriod) {
            setForm(prev => ({ ...prev, endPeriod: form.startPeriod }));
        }

        const startPeriodObj = periods[form.startPeriod - 1];
        const endPeriodObj = periods[form.endPeriod - 1];
        const startTime = startPeriodObj ? startPeriodObj.start : '';
        const endTime = endPeriodObj ? endPeriodObj.end : '';

        onSave({
            ...form,
            startTime,
            endTime,
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 900, fontSize: 20 }}>
                {course ? '과목 수정' : '과목 추가'}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <TextField
                        label="강의코드 (강좌번호)"
                        name="code"
                        value={form.code}
                        onChange={handleChange}
                        fullWidth
                        placeholder="예: AAK20013"
                    />

                    <TextField
                        label="과목명"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        fullWidth
                        required
                        placeholder="예: 현대인의패션라이프"
                    />

                    <FormControl fullWidth required>
                        <InputLabel>요일</InputLabel>
                        <Select
                            name="day"
                            value={form.day}
                            label="요일"
                            onChange={handleChange}
                        >
                            {dayOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <FormControl fullWidth required>
                            <InputLabel>시작교시</InputLabel>
                            <Select
                                name="startPeriod"
                                value={form.startPeriod}
                                label="시작교시"
                                onChange={handleChange}
                            >
                                {periodOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth required>
                            <InputLabel>끝나는교시</InputLabel>
                            <Select
                                name="endPeriod"
                                value={form.endPeriod}
                                label="끝나는교시"
                                onChange={handleChange}
                            >
                                {periodOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <TextField
                        label="교수명"
                        name="instructor"
                        value={form.instructor}
                        onChange={handleChange}
                        fullWidth
                        placeholder="예: 김지수"
                    />

                    <TextField
                        label="강의실"
                        name="room"
                        value={form.room}
                        onChange={handleChange}
                        fullWidth
                        placeholder="예: B동101호"
                    />

                    <TextField
                        label="학점"
                        name="credits"
                        type="number"
                        value={form.credits}
                        onChange={handleChange}
                        fullWidth
                        required
                        inputProps={{ min: 1, max: 6 }}
                    />

                    <FormControl fullWidth required>
                        <InputLabel>과목 유형</InputLabel>
                        <Select
                            name="type"
                            value={form.type}
                            label="과목 유형"
                            onChange={handleChange}
                        >
                            {typeOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 1 }}>
                <Button onClick={onClose} variant="outlined">취소</Button>
                <Button onClick={handleSave} variant="contained">
                    {course ? '수정' : '추가'}
                </Button>
                {onDelete && course && (
                    <Button onClick={() => onDelete(course.id)} variant="outlined" color="error">
                        삭제
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default CourseEditModal;