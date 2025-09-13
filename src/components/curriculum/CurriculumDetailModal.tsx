// src/components/curriculum/CurriculumDetailModal.tsx
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Chip,
    Divider,
    Grid,
    Card,
    CardContent,
    LinearProgress,
    IconButton,
    Alert,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import {
    Visibility,
    Edit,
    Delete,
    Add,
    ExpandMore,
    Schedule,
    School,
    TrendingUp,
} from '@mui/icons-material';
import { curriculumService } from '../../services/CurriculumService';
import { Curriculum, Lecture, CurriculumWithStats } from '../../types/curriculum';

interface CurriculumDetailModalProps {
    open: boolean;
    curriculum: Curriculum | null;
    onClose: () => void;
    onEdit: (curriculum: Curriculum) => void;
    onDelete: (id: number) => void;
    onAddLecture: (curriculumId: number) => void;
}

const CurriculumDetailModal: React.FC<CurriculumDetailModalProps> = ({
    open,
    curriculum,
    onClose,
    onEdit,
    onDelete,
    onAddLecture,
}) => {
    const [curriculumWithStats, setCurriculumWithStats] = useState<CurriculumWithStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && curriculum) {
            loadCurriculumDetails();
        }
    }, [open, curriculum]);

    const loadCurriculumDetails = async () => {
        if (!curriculum) return;

        try {
            setLoading(true);
            setError(null);

            // 상세 정보 로드
            const detailedCurriculum = await curriculumService.getCurriculumById(curriculum.id);
            const stats = curriculumService.calculateCurriculumStats(detailedCurriculum);
            setCurriculumWithStats(stats);
        } catch (error) {
            console.error('Failed to load curriculum details:', error);
            setError(error instanceof Error ? error.message : '커리큘럼 상세 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        if (curriculum) {
            onDelete(curriculum.id);
            onClose();
        }
    };

    const formatTime = (time: string) => {
        // HH:MM 형식으로 변환
        return time;
    };

    const getDayOfWeekLabel = (day: string) => {
        const dayMap: Record<string, string> = {
            monday: '월요일',
            tuesday: '화요일',
            wednesday: '수요일',
            thursday: '목요일',
            friday: '금요일',
            saturday: '토요일',
            sunday: '일요일'
        };
        return dayMap[day] || day;
    };

    if (!curriculum) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <School color="primary" />
                        <Typography variant="h6">{curriculum.name}</Typography>
                        {curriculum.isDefault && (
                            <Chip label="기본" size="small" color="primary" />
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                            size="small"
                            onClick={() => onAddLecture(curriculum.id)}
                            color="primary"
                        >
                            <Add />
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={() => onEdit(curriculum)}
                            color="primary"
                        >
                            <Edit />
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={handleDelete}
                            color="error"
                        >
                            <Delete />
                        </IconButton>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                ) : curriculumWithStats ? (
                    <Box sx={{ mt: 2 }}>
                        {/* 통계 정보 */}
                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    커리큘럼 통계
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h4" color="primary">
                                                {curriculumWithStats.totalLectures}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                총 과목 수
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h4" color="success.main">
                                                {curriculumWithStats.totalCredits}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                총 학점
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h4" color="info.main">
                                                {Math.round(curriculumWithStats.completionRate)}%
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                진행률
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>

                                <Box sx={{ mt: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            진행률
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {Math.round(curriculumWithStats.completionRate)}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={curriculumWithStats.completionRate}
                                        sx={{ height: 8, borderRadius: 4 }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>

                        {/* 학기별 과목 목록 */}
                        <Typography variant="h6" gutterBottom>
                            학기별 과목
                        </Typography>

                        {curriculumWithStats.semesterBreakdown.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography variant="body1" color="text.secondary">
                                    아직 등록된 과목이 없습니다.
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={() => onAddLecture(curriculum.id)}
                                    sx={{ mt: 2 }}
                                >
                                    과목 추가
                                </Button>
                            </Box>
                        ) : (
                            curriculumWithStats.semesterBreakdown.map((semester) => (
                                <Accordion key={semester.semester} sx={{ mb: 1 }}>
                                    <AccordionSummary expandIcon={<ExpandMore />}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                            <Typography variant="h6">
                                                {semester.semester}학기
                                            </Typography>
                                            <Chip
                                                label={`${semester.lectures.length}과목`}
                                                size="small"
                                                color="primary"
                                            />
                                            <Chip
                                                label={`${semester.credits}학점`}
                                                size="small"
                                                color="success"
                                            />
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid container spacing={2}>
                                            {semester.lectures.map((lecture) => (
                                                <Grid item xs={12} key={lecture.id}>
                                                    <Card variant="outlined">
                                                        <CardContent sx={{ py: 1.5 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                <Box>
                                                                    <Typography variant="subtitle1" fontWeight="medium">
                                                                        {lecture.courseName}
                                                                    </Typography>
                                                                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                                                        <Chip
                                                                            label={getDayOfWeekLabel(lecture.dayOfWeek ?? '')}
                                                                            size="small"
                                                                            variant="outlined"
                                                                        />
                                                                        <Chip
                                                                            label={`${formatTime(lecture.startTime ?? '')} - ${formatTime(lecture.endTime ?? '')}`}
                                                                            size="small"
                                                                            variant="outlined"
                                                                            icon={<Schedule fontSize="small" />}
                                                                        />
                                                                    </Box>
                                                                </Box>
                                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                                    <IconButton size="small" color="primary">
                                                                        <Edit />
                                                                    </IconButton>
                                                                    <IconButton size="small" color="error">
                                                                        <Delete />
                                                                    </IconButton>
                                                                </Box>
                                                            </Box>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                            ))
                        )}
                    </Box>
                ) : null}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>
                    닫기
                </Button>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => onAddLecture(curriculum.id)}
                >
                    과목 추가
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CurriculumDetailModal; 