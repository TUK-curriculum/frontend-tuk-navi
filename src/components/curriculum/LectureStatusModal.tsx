import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Grid,
    Divider,
} from '@mui/material';
import { Update, Delete, SchoolOutlined, Warning } from '@mui/icons-material';
import { curriculumService } from '../../services/CurriculumService';
import { CurriculumLecture } from '../../types/curriculum';

interface LectureStatusModalProps {
    open: boolean;
    lecture: CurriculumLecture | null;
    curriculumId: number;
    onClose: () => void;
    onSuccess: (lecture: CurriculumLecture) => void;
    onDeleteSuccess: (message: string) => void;
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
                        이 과목은 이미 수강내역에 존재합니다. 재수강으로 상태를 변경하시겠습니까?
                    </Typography>
                </Alert>
                <Typography variant="body2" color="text.secondary">
                    • <strong>재수강으로 변경</strong>: 학점은 0점으로 처리되며, 성적 향상을 위한 재수강으로 기록됩니다.
                    <br />
                    • <strong>취소</strong>: 상태 변경을 취소합니다.
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
                    재수강으로 변경
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const LectureStatusModal: React.FC<LectureStatusModalProps> = ({
    open,
    lecture,
    curriculumId,
    onClose,
    onSuccess,
    onDeleteSuccess,
}) => {
    const [status, setStatus] = useState<'completed' | 'current' | 'planned'>('planned');
    const [recordGrade, setRecordGrade] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [duplicateDialog, setDuplicateDialog] = useState({
        open: false,
        courseCode: '',
        courseName: ''
    });

    useEffect(() => {
        if (lecture) {
            const initialStatus = lecture.status as 'completed' | 'current' | 'planned';
            setStatus(initialStatus || 'planned');
            setRecordGrade('');
        }
    }, [lecture]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lecture) return;

        try {
            setLoading(true);
            setError(null);

            const updateData = {
                status,
                recordGrade,
            };

            const updatedLecture = await curriculumService.updateLecture(
                curriculumId,
                lecture.id,
                updateData
            );

            onSuccess(updatedLecture);
            handleClose();
        } catch (error: any) {
            console.error('Failed to update lecture status:', error);
            setError(error instanceof Error ? error.message : '상태 업데이트에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const submitStatusUpdate = async (forceRetaken: boolean = false, confirmDuplicate: boolean = false) => {
        if (!lecture) return;

        if (lecture.status === 'current' || lecture.status === 'completed') {
            setError('이 과목은 이미 수강내역에 등록되어 있어 변경할 수 없습니다. 변경을 원하시면 시간표 페이지에서 해당 강의를 삭제 후 다시 시도해 주세요.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const updateData = {
                status: status,
                recordGrade: recordGrade,
                forceRetaken,
                confirmDuplicate
            };

            const result = await curriculumService.updateLecture(
                curriculumId,
                lecture.id,
                updateData
            );

            onSuccess(result);
            handleClose();
        } catch (error: any) {
            console.error('Failed to update lecture status:', error);
            
            // 중복 기록 에러 처리
            if (error.message?.startsWith('DUPLICATE_RECORD:')) {
                const [, courseCode, courseName] = error.message.split(':');
                setDuplicateDialog({
                    open: true,
                    courseCode,
                    courseName
                });
                return;
            }
            
            setError(error instanceof Error ? error.message : '상태 업데이트에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleDuplicateConfirm = async (asRetake: boolean) => {
        setDuplicateDialog({ open: false, courseCode: '', courseName: '' });
        
        if (asRetake) {
            await submitStatusUpdate(true, true);
        }
    };

    const handleDuplicateClose = () => {
        setDuplicateDialog({ open: false, courseCode: '', courseName: '' });
    };

    const handleDelete = async () => {
        if (!lecture) return;

        if (lecture.status === 'current' || lecture.status === 'completed') {
            setError('이 과목은 이미 수강내역에 등록되어 있어 삭제할 수 없습니다. 삭제를 원하시면 시간표 페이지에서 해당 강의를 삭제한 후 다시 시도해 주세요.');
            return;
        }

        try {
            setLoading(true);
            await curriculumService.deleteLecture(curriculumId, lecture.id);
            onDeleteSuccess(`${lecture.name} 과목이 삭제되었습니다.`);
            onClose();
        } catch (err) {
            console.error('Failed to delete lecture:', err);
            setError('과목 삭제에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStatus('planned');
        setRecordGrade('');
        setError(null);
        setLoading(false);
        setDuplicateDialog({ open: false, courseCode: '', courseName: '' });
        onClose();
    };

    const statusOptions = [
        { value: 'completed', label: '수강완료', color: 'success' as const },
        { value: 'current', label: '수강중', color: 'info' as const },
        { value: 'planned', label: '수강예정', color: 'default' as const },
    ];
    
    const availableStatusOptions = React.useMemo(() => {
        if (!lecture) return statusOptions;

        if (lecture.status === 'completed') {
            return statusOptions.filter(opt => opt.value === 'completed');
        }
        if (lecture.status === 'current') {
            return statusOptions.filter(opt => opt.value === 'current' || opt.value === 'completed');
        }
        return statusOptions;
    }, [lecture]);

    const gradeOptions = ['A+', 'A0', 'B+', 'B0', 'C+', 'C0', 'D+', 'D0', 'F', 'P', 'NP'];

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'GR': return '교양필수';
            case 'GE': return '교양선택';
            case 'MR': return '전공필수';
            case 'ME': return '전공선택';
            case 'RE': return '현장연구';
            case 'FE': return '자유선택';
            default: return type;
        }
    };

    if (!lecture) return null;

    return (
        <>
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Update color="primary" />
                            <Typography variant="h6">
                                강의 수정
                            </Typography>
                        </Box>
                    </DialogTitle>

                    <DialogContent>
                        <Box sx={{ mt: 1 }}>
                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            {/* 과목 정보 표시 */}
                            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <SchoolOutlined color="primary" />
                                    <Typography variant="h6" fontWeight="bold">
                                        {lecture.name}
                                    </Typography>
                                </Box>
                                
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            과목코드
                                        </Typography>
                                        <Typography variant="body1">
                                            {lecture.lectureCode?.code || '미지정'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            학점
                                        </Typography>
                                        <Typography variant="body1">
                                            {lecture.credits}학점
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            이수구분
                                        </Typography>
                                        <Typography variant="body1">
                                            {getTypeLabel(lecture.type)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            학년/학기
                                        </Typography>
                                        <Typography variant="body1">
                                            {lecture.grade}학년 {lecture.semester}학기
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            {/* 상태 변경 */}
                            <Box sx={{ mb: 2 }}>
                                <FormControl fullWidth disabled={loading}>
                                    <InputLabel>이수 상태</InputLabel>
                                    <Select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value as 'completed' | 'current' | 'planned')}
                                        label="이수 상태"
                                        required
                                    >
                                        {availableStatusOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Chip
                                                    label={option.label}
                                                    size="small"
                                                    color={option.color}
                                                    variant="outlined"
                                                    />
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>

                            {status === 'completed' && (
                                <Box sx={{ mb: 2 }}>
                                    <FormControl fullWidth disabled={loading}>
                                        <InputLabel>성적 (선택사항)</InputLabel>
                                        <Select
                                            value={recordGrade}
                                            onChange={(e) => setRecordGrade(e.target.value)}
                                            label="성적 (선택사항)"
                                        >
                                            <MenuItem value="">
                                                <em>성적 미입력</em>
                                            </MenuItem>
                                            {gradeOptions.map((grade) => (
                                                <MenuItem key={grade} value={grade}>
                                                    {grade}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                        수강완료로 선택 시 성적을 입력하면 수강내역에도 자동 등록됩니다.
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={handleClose} disabled={loading}>
                            취소
                        </Button>
                        <Button
                            onClick={handleDelete}
                            color="error"
                            variant="outlined"
                            startIcon={<Delete />}
                            disabled={loading}
                        >
                            삭제
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={16} /> : <Update />}
                        >
                            {loading ? '업데이트 중...' : '수정'}
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

export default LectureStatusModal;