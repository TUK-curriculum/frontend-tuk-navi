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
import { Add, Edit, Warning } from '@mui/icons-material';
import { curriculumService } from '../../services/CurriculumService';
import { CurriculumLecture, AddLectureRequest, UpdateLectureRequest } from '../../types/curriculum';

interface LectureFormModalProps {
    open: boolean;
    curriculumId: number;
    lecture?: CurriculumLecture | null;
    onClose: () => void;
    onSuccess: (lecture: CurriculumLecture) => void;
    grade: number;
    semester: '1' | '2' | 'S' | 'W';
}

interface DuplicateConfirmDialogProps {
    open: boolean;
    courseCode: string;
    courseName: string;
    onClose: () => void;
    onConfirm: (asRetake: boolean) => void;
}

const DuplicateConfirmDialog: React.FC<DuplicateConfirmDialogProps> = ({
    open,
    courseCode,
    courseName,
    onClose,
    onConfirm,
}) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning color="warning" />
                    <Typography variant="h6">
                        이미 이수한 과목입니다
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>{courseName} ({courseCode})</strong>
                    </Typography>
                    <Typography variant="body2">
                        이 과목은 이미 수강내역에 존재합니다. 재수강으로 추가하시겠습니까?
                    </Typography>
                </Alert>
                <Typography variant="body2" color="text.secondary">
                    • <strong>재수강으로 추가</strong>: 학점은 0점으로 처리되며, 성적 향상을 위한 재수강으로 기록됩니다.
                    <br />
                    • <strong>취소</strong>: 과목 추가를 취소하고 폼으로 돌아갑니다.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>
                    취소
                </Button>
                <Button 
                    onClick={() => onConfirm(true)} 
                    variant="contained" 
                    color="warning"
                >
                    재수강으로 추가
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const LectureFormModal: React.FC<LectureFormModalProps> = ({
    open,
    curriculumId,
    lecture,
    onClose,
    onSuccess,
    grade,
    semester,
}) => {
    const isEditMode = !!lecture;

    const [formData, setFormData] = useState<AddLectureRequest>({
        courseCode: '',
        lect_id: undefined,
        name: '',
        credits: 3,
        type: 'GE',
        grade,
        semester,
        status: 'planned',
        recordGrade: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [duplicateDialog, setDuplicateDialog] = useState({
        open: false,
        courseCode: '',
        courseName: ''
    });

    useEffect(() => {
        if (lecture) {
            setFormData({
                courseCode: lecture.lectureCode?.code || '',
                name: lecture.name,
                credits: lecture.credits,
                type: lecture.type,
                grade: lecture.grade,
                semester: lecture.semester,
                status: lecture.status === 'off-track' ? 'planned' : (lecture.status || 'planned'),
                recordGrade: ''
            });
        } else {
            setFormData({
                courseCode: '',
                name: '',
                credits: 3,
                type: 'GE',
                grade,
                semester,
                status: 'planned',
                recordGrade: ''
            });
        }
    }, [lecture, grade, semester]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await submitLecture(false);
    };

    const submitLecture = async (forceRetaken: boolean = false, confirmDuplicate: boolean = false) => {
        try {
            setLoading(true);
            setError(null);

            const submitData = {
                ...formData,
                forceRetaken,
                confirmDuplicate
            };

            let result: CurriculumLecture;

            if (isEditMode && lecture) {
                result = await curriculumService.updateLecture(
                    curriculumId,
                    lecture.id,
                    submitData as UpdateLectureRequest
                );
            } else {
                result = await curriculumService.addLecture(curriculumId, submitData);
            }

            onSuccess(result);
            handleClose();
        } catch (error: any) {
            console.error('Failed to save lecture:', error);
            
            // 중복 기록 처리
            if (error.message?.startsWith('DUPLICATE_RECORD:')) {
                const [, courseCode, courseName] = error.message.split(':');
                setDuplicateDialog({
                    open: true,
                    courseCode,
                    courseName
                });
                return;
            }
            
            setError(error instanceof Error ? error.message : '과목 저장에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleDuplicateConfirm = async (asRetake: boolean) => {
        setDuplicateDialog({ open: false, courseCode: '', courseName: '' });
        
        if (asRetake) {
            await submitLecture(true, true);
        }
    };

    const handleDuplicateClose = () => {
        setDuplicateDialog({ open: false, courseCode: '', courseName: '' });
    };

    const handleClose = () => {
        setFormData({
            name: '',
            credits: 3,
            type: 'GE',
            grade,
            semester,
            status: 'planned',
        });
        setError(null);
        setLoading(false);
        setDuplicateDialog({ open: false, courseCode: '', courseName: '' });
        onClose();
    };

    const handleInputChange = (field: keyof AddLectureRequest, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (error) setError(null);
    };

    const typeOptions = [
        { value: 'GR', label: '교양필수' },
        { value: 'GE', label: '교양선택' },
        { value: 'MR', label: '전공필수' },
        { value: 'ME', label: '전공선택' },
        { value: 'RE', label: '현장연구' },
        { value: 'FE', label: '자유선택' },
    ];

    const statusOptions = [
        { value: 'completed', label: '수강완료' },
        { value: 'current', label: '수강중' },
        { value: 'planned', label: '수강예정' },
    ];

    return (
        <>
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
                                        label="강의 코드"
                                        fullWidth
                                        variant="outlined"
                                        value={formData.courseCode || ''}
                                        onChange={(e) => handleInputChange('courseCode', e.target.value)}
                                        placeholder="예: ACS32022"
                                        disabled={loading}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        autoFocus
                                        label="강의명"
                                        fullWidth
                                        variant="outlined"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="예: 인공지능"
                                        disabled={loading}
                                        required
                                    />
                                </Grid>

                                <Grid item xs={6}>
                                    <TextField
                                        label="학점"
                                        type="number"
                                        fullWidth
                                        variant="outlined"
                                        value={formData.credits}
                                        onChange={(e) => {
                                        const value = Math.max(1, Math.min(3, Number(e.target.value))); 
                                        handleInputChange('credits', value);
                                        }}
                                        disabled={loading}
                                        required
                                        inputProps={{ min: 1, max: 3 }}
                                    />
                                </Grid>

                                <Grid item xs={6}>
                                    <FormControl fullWidth disabled={loading}>
                                        <InputLabel>이수 구분</InputLabel>
                                        <Select
                                            value={formData.type}
                                            onChange={(e) => handleInputChange('type', e.target.value)}
                                            label="이수 구분"
                                            required
                                        >
                                            {typeOptions.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={6}>
                                    <FormControl fullWidth disabled={loading}>
                                    <InputLabel>수강 상태</InputLabel>
                                        <Select
                                            value={formData.status || 'planned'}
                                            onChange={(e) => handleInputChange('status', e.target.value)}
                                            label="수강 상태"
                                            required
                                        >
                                            {statusOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={6}>
                                    <FormControl fullWidth disabled={formData.status !== 'completed' || loading}>
                                        <InputLabel>성적</InputLabel>
                                        <Select
                                            value={formData.recordGrade || ''}
                                            onChange={(e) => handleInputChange('recordGrade', e.target.value)}
                                            label="성적"
                                        >
                                        {['A+', 'A0', 'B+', 'B0', 'C+', 'C0', 'D+', 'D0', 'F', 'P', 'NP'].map((g) => (
                                            <MenuItem key={g} value={g}>
                                            {g}
                                            </MenuItem>
                                        ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Box>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={handleClose} disabled={loading}>
                            취소
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading || !formData.name.trim()}
                            startIcon={loading ? <CircularProgress size={16} /> : (isEditMode ? <Edit /> : <Add />)}
                        >
                            {loading ? '저장 중...' : (isEditMode ? '과목 수정' : '과목 추가')}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* 중복 확인 */}
            <DuplicateConfirmDialog
                open={duplicateDialog.open}
                courseCode={duplicateDialog.courseCode}
                courseName={duplicateDialog.courseName}
                onClose={handleDuplicateClose}
                onConfirm={handleDuplicateConfirm}
            />
        </>
    );
};

export default LectureFormModal;