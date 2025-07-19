import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Button, Box } from '@mui/material';
import type { Course, DayKey } from '../../types/course';

const dayNames = {
    monday: '월요일',
    tuesday: '화요일',
    wednesday: '수요일',
    thursday: '목요일',
    friday: '금요일',
};

const periodTimes = [
    { label: '1교시', value: 1, time: '09:30~10:20' },
    { label: '2교시', value: 2, time: '10:30~11:20' },
    { label: '3교시', value: 3, time: '11:30~12:20' },
    { label: '4교시', value: 4, time: '12:30~13:20' },
    { label: '5교시', value: 5, time: '13:30~14:20' },
    { label: '6교시', value: 6, time: '14:30~15:20' },
    { label: '7교시', value: 7, time: '15:30~16:20' },
    { label: '8교시', value: 8, time: '16:30~17:20' },
    { label: '9교시', value: 9, time: '17:25~18:15' },
    { label: '10교시', value: 10, time: '18:15~19:05' },
    { label: '11교시', value: 11, time: '19:05~19:55' },
    { label: '12교시', value: 12, time: '20:00~20:50' },
    { label: '13교시', value: 13, time: '20:50~21:40' },
    { label: '14교시', value: 14, time: '21:40~22:30' },
];

interface CourseEditModalProps {
    open: boolean;
    course: Course | null;
    onSave: (courseData: Partial<Course>) => void;
    onClose: () => void;
    onDelete?: (id: string) => void;
}

const CourseEditModal: React.FC<CourseEditModalProps> = ({ open, course, onSave, onClose, onDelete }) => {
    const [form, setForm] = useState<Partial<Course>>({
        startPeriod: 1,
        endPeriod: 1,
    });

    useEffect(() => {
        if (course) {
            setForm(course);
        } else {
            setForm({ startPeriod: 1, endPeriod: 1 });
        }
    }, [course, open]);

    // MUI Select는 SelectChangeEvent를 사용해야 함
    const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<{ name?: string; value: unknown; }> | any) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        // Ensure startPeriod/endPeriod are numbers
        const startPeriod = Number(form.startPeriod);
        const endPeriod = Number(form.endPeriod);
        // Find times for the selected periods
        const startPeriodObj = periodTimes.find(p => p.value === startPeriod);
        const endPeriodObj = periodTimes.find(p => p.value === endPeriod);
        const startTime = startPeriodObj ? startPeriodObj.time.split('~')[0] : '';
        const endTime = endPeriodObj ? endPeriodObj.time.split('~')[1] : '';
        onSave({
            ...form,
            startPeriod,
            endPeriod,
            startTime,
            endTime,
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 900, fontSize: 20 }}>{course ? '과목 수정' : '과목 추가'}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <TextField
                        label="과목명"
                        name="name"
                        value={form.name || ''}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        label="과목코드"
                        name="code"
                        value={form.code || ''}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        label="담당교수"
                        name="instructor"
                        value={form.instructor || ''}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        label="학점"
                        name="credits"
                        type="number"
                        value={form.credits || 3}
                        onChange={handleChange}
                        fullWidth
                    />
                    <FormControl fullWidth>
                        <InputLabel>요일</InputLabel>
                        <Select name="day" value={form.day || 'monday'} label="요일" onChange={handleChange}>
                            {Object.entries(dayNames).map(([key, name]) => (
                                <MenuItem key={key} value={key}>{name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <FormControl sx={{ flex: 1 }}>
                            <InputLabel>시작교시</InputLabel>
                            <Select
                                name="startPeriod"
                                value={form.startPeriod || ''}
                                label="시작교시"
                                onChange={handleChange}
                            >
                                {periodTimes.map(period => (
                                    <MenuItem key={period.value} value={period.value}>
                                        {`${period.label} (${period.time})`}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl sx={{ flex: 1 }}>
                            <InputLabel>종료교시</InputLabel>
                            <Select
                                name="endPeriod"
                                value={form.endPeriod || ''}
                                label="종료교시"
                                onChange={handleChange}
                            >
                                {periodTimes.map(period => (
                                    <MenuItem key={period.value} value={period.value}>
                                        {`${period.label} (${period.time})`}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    <TextField
                        label="강의실"
                        name="room"
                        value={form.room || ''}
                        onChange={handleChange}
                        fullWidth
                    />
                    <FormControl fullWidth>
                        <InputLabel>과목 유형</InputLabel>
                        <Select name="type" value={form.type || 'elective'} label="과목 유형" onChange={handleChange}>
                            <MenuItem value="required">필수</MenuItem>
                            <MenuItem value="elective">선택</MenuItem>
                            <MenuItem value="liberal">교양</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>취소</Button>
                <Button onClick={handleSave} variant="contained" sx={{ fontWeight: 700 }}>{course ? '수정' : '추가'}</Button>
                {onDelete && course && (
                    <Button onClick={() => onDelete(course.id)} variant="outlined" color="error">삭제</Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default CourseEditModal; 