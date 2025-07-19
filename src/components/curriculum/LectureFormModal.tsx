// src/components/curriculum/LectureFormModal.tsx
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
} from '@mui/material';
import { Add, Edit, Schedule } from '@mui/icons-material';
import { curriculumService } from '../../services/CurriculumService';
import { Lecture, AddLectureRequest, UpdateLectureRequest } from '../../types/curriculum';

interface LectureFormModalProps {
    open: boolean;
    curriculumId: number;
    lecture?: Lecture | null; // 편집 모드일 때만 제공
    onClose: () => void;
    onSuccess: (lecture: Lecture) => void;
}

const LectureFormModal: React.FC<LectureFormModalProps> = ({
    open,
    curriculumId,
    lecture,
    onClose,
    onSuccess,
}) => {
    const isEditMode = !!lecture;

    const [formData, setFormData] = useState<AddLectureRequest>({
        courseName: '',
        dayOfWeek: '',
        startTime: '',
        endTime: '',
        semester: 1,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 편집 모드일 때 기존 데이터로 폼 초기화
    useEffect(() => {
        if (lecture) {
            setFormData({
                courseName: lecture.courseName,
                dayOfWeek: lecture.dayOfWeek,
                startTime: lecture.startTime,
                endTime: lecture.endTime,
                semester: lecture.semester,
            });
        } else {
            setFormData({
                courseName: '',
                dayOfWeek: '',
                startTime: '',
                endTime: '',
                semester: 1,
            });
        }
    }, [lecture]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 유효성 검사
        const errors = curriculumService.validateLectureData(formData);
        if (errors.length > 0) {
            setError(errors[0]);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            let result: Lecture;

            if (isEditMode && lecture) {
                // 편집 모드
                const updateData: UpdateLectureRequest = {
                    courseName: formData.courseName,
                    dayOfWeek: formData.dayOfWeek,
                    startTime: formData.startTime,
                    endTime: formData.endTime,
                    semester: formData.semester,
                };
                result = await curriculumService.updateLecture(curriculumId, lecture.id, updateData);
            } else {
                // 추가 모드
                result = await curriculumService.addLecture(curriculumId, formData);
            }

            onSuccess(result);
            handleClose();
        } catch (error) {
            console.error('Failed to save lecture:', error);
            setError(error instanceof Error ? error.message : '과목 저장에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            courseName: '',
            dayOfWeek: '',
            startTime: '',
            endTime: '',
            semester: 1,
        });
        setError(null);
        setLoading(false);
        onClose();
    };

    const handleInputChange = (field: keyof AddLectureRequest, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (error) setError(null);
    };

    const validateTimeFormat = (time: string) => {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    };

    const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
        if (value && !validateTimeFormat(value)) {
            setError('시간 형식이 올바르지 않습니다. (HH:MM)');
            return;
        }
        handleInputChange(field, value);
    };

    const dayOptions = [
        { value: 'monday', label: '월요일' },
        { value: 'tuesday', label: '화요일' },
        { value: 'wednesday', label: '수요일' },
        { value: 'thursday', label: '목요일' },
        { value: 'friday', label: '금요일' },
    ];

    const semesterOptions = [
        { value: 1, label: '1학기' },
        { value: 2, label: '2학기' },
        { value: 3, label: '3학기' },
        { value: 4, label: '4학기' },
        { value: 5, label: '5학기' },
        { value: 6, label: '6학기' },
        { value: 7, label: '7학기' },
        { value: 8, label: '8학기' },
    ];

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {isEditMode ? <Edit color="primary" /> : <Add color="primary" />}
                        <Typography variant="h6">
                            {isEditMode ? '과목 편집' : '과목 추가'}
                        </Typography>
                    </Box>
                </DialogTitle>

                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    autoFocus
                                    label="과목명"
                                    fullWidth
                                    variant="outlined"
                                    value={formData.courseName}
                                    onChange={(e) => handleInputChange('courseName', e.target.value)}
                                    placeholder="예: 인공지능개론"
                                    disabled={loading}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth disabled={loading}>
                                    <InputLabel>요일</InputLabel>
                                    <Select
                                        value={formData.dayOfWeek}
                                        onChange={(e) => handleInputChange('dayOfWeek', e.target.value)}
                                        label="요일"
                                        required
                                    >
                                        {dayOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth disabled={loading}>
                                    <InputLabel>학기</InputLabel>
                                    <Select
                                        value={formData.semester}
                                        onChange={(e) => handleInputChange('semester', e.target.value as number)}
                                        label="학기"
                                        required
                                    >
                                        {semesterOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="시작 시간"
                                    fullWidth
                                    variant="outlined"
                                    value={formData.startTime}
                                    onChange={(e) => handleTimeChange('startTime', e.target.value)}
                                    placeholder="09:00"
                                    disabled={loading}
                                    required
                                    helperText="HH:MM 형식으로 입력"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="종료 시간"
                                    fullWidth
                                    variant="outlined"
                                    value={formData.endTime}
                                    onChange={(e) => handleTimeChange('endTime', e.target.value)}
                                    placeholder="10:30"
                                    disabled={loading}
                                    required
                                    helperText="HH:MM 형식으로 입력"
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                <strong>입력 예시:</strong><br />
                                과목명: 인공지능개론<br />
                                요일: 월요일<br />
                                시간: 09:00 - 10:30<br />
                                학기: 3학기
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose} disabled={loading}>
                        취소
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || !formData.courseName.trim() || !formData.dayOfWeek || !formData.startTime || !formData.endTime}
                        startIcon={loading ? <CircularProgress size={16} /> : (isEditMode ? <Edit /> : <Add />)}
                    >
                        {loading ? '저장 중...' : (isEditMode ? '과목 수정' : '과목 추가')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default LectureFormModal; 