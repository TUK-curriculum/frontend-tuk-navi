// src/pages/Curriculum.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Grid,
    Typography,
    Card,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Snackbar,
    Alert,
    Divider,
    Button,
    useTheme,
    useMediaQuery,
    Fade,
    Zoom,
    IconButton,
    Skeleton,
    InputAdornment,
    LinearProgress,
    FormControlLabel,
    Switch,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    Tooltip,
    Paper,
    Avatar,
    Badge,
} from '@mui/material';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import AddCircleOutline from '@mui/icons-material/AddCircleOutline';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import EmojiObjectsOutlined from '@mui/icons-material/EmojiObjectsOutlined';
import SchoolOutlined from '@mui/icons-material/SchoolOutlined';
import PublicOutlined from '@mui/icons-material/PublicOutlined';
import StarOutline from '@mui/icons-material/StarOutline';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ComputerIcon from '@mui/icons-material/Computer';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BusinessIcon from '@mui/icons-material/Business';
import LanguageIcon from '@mui/icons-material/Language';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { styled } from '@mui/system';
import { curriculumService } from '../services/CurriculumService';
import {
    Curriculum as CurriculumType,
    CurriculumWithStats,
    CurriculumFormData,
    AddLectureRequest,
    Lecture,
    CurriculumLecture,
    Curriculum,
} from '../types/curriculum';
import CurriculumCreateModal from '../components/curriculum/CurriculumCreateModal';
import CurriculumDetailModal from '../components/curriculum/CurriculumDetailModal';
import CurriculumEditModal from '../components/curriculum/CurriculumEditModal';
import LectureFormModal from '../components/curriculum/LectureFormModal';
import LectureStatusModal from '../components/curriculum/LectureStatusModal';
import ScheduleCreationModal from '../components/modals/ScheduleCreationModal';
import apiClient from '../config/apiClient';
import { apiService } from '@/services/ApiService';

// Constants
const CONSTANTS = {
    HIGHLIGHT_DURATION: 2500,
    MAX_SEMESTER_DISPLAY: 2,
    DEFAULT_CREDITS: 3,
    DAYS_OF_WEEK: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    SEMESTERS: [1, 2, 3, 4, 5, 6, 7, 8],
    CATEGORIES: {
        MAJOR_REQUIRED: '전공필수',
        MAJOR_ELECTIVE: '전공선택',
        LIBERAL_ARTS: '교양',
        EXTERNAL: '외부강의/인증',
        RESEARCH: '현장연구',
        FREE: '자유',
    },
} as const;

// Styled Components
const TimelineCard = styled(Card)(({ theme }) => ({
    border: `2px solid ${theme.palette.primary.light}`,
    borderRadius: 16,
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        borderColor: theme.palette.primary.main,
    },
}));

const CompletedCard = styled(Card)(({ theme }) => ({
    border: `2px solid ${theme.palette.success.main}`,
    borderRadius: 16,
    background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
    opacity: 0.8,
}));

const CurrentCard = styled(Card)(({ theme }) => ({
    border: `3px solid ${theme.palette.info.main}`,
    borderRadius: 16,
    background: 'linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%)',
    boxShadow: `0 0 0 4px ${theme.palette.info.light}, 0 8px 32px 0 rgba(30,144,255,0.2)`,
    transform: 'scale(1.02)',
}));

const CategoryIcon = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: '50%',
    marginRight: theme.spacing(1),
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.palette.grey[200],
    '& .MuiLinearProgress-bar': {
        borderRadius: 4,
    },
}));

// Utility functions
const getCategoryIcon = (category: string) => {
    switch (category) {
        case CONSTANTS.CATEGORIES.MAJOR_REQUIRED:
            return <ComputerIcon color="primary" />;
        case CONSTANTS.CATEGORIES.MAJOR_ELECTIVE:
            return <PsychologyIcon color="secondary" />;
        case CONSTANTS.CATEGORIES.LIBERAL_ARTS:
            return <LanguageIcon color="success" />;
        case CONSTANTS.CATEGORIES.RESEARCH:
            return <BusinessIcon color="info" />;
        case CONSTANTS.CATEGORIES.FREE:
            return <StarOutline color="warning" />;
        case CONSTANTS.CATEGORIES.EXTERNAL:
            return <PublicOutlined color="action" />;
        default:
            return <SchoolOutlined color="info" />;
    }
};


const getStatusChip = (lecture: CurriculumLecture | string) => {
    const status = typeof lecture === 'string' ? lecture : lecture.status;
    const isRetaken = typeof lecture === 'object' ? lecture.isRetaken : false;
    
    if (isRetaken) {
        return { label: '재수강', color: 'secondary' as const };
    }
    
    switch (status) {
        case 'completed':
            return { label: '수강완료', color: 'success' as const };
        case 'current':
            return { label: '수강중', color: 'info' as const };
        case 'planned':
            return { label: '수강예정', color: 'default' as const };
        case 'off-track':
            return { label: '미이수', color: 'warning' as const };
        default:
            return { label: '수강예정', color: 'default' as const };
    }
};

const getStatusIcon = (lecture: CurriculumLecture | string) => {
    const status = typeof lecture === 'string' ? lecture : lecture.status;
    
    switch (status) {
        case 'completed':
            return <CheckCircleIcon color="success" />;
        case 'current':
            return <PendingIcon color="info" />;
        case 'planned':
            return <ScheduleIcon color="action" />;
        case 'off-track':
            return <RadioButtonUncheckedIcon color="warning" />;
        default:
            return <RadioButtonUncheckedIcon color="disabled" />;
    }
};

const getSemesterLabel = (semester: string) => {
    const [grade, sem] = semester.split('-');
    return `${grade}학년 ${sem}학기`;
};

const getSemesterYear = (semester: string, baseYear: number = 2025) => {
    const [grade] = semester.split('-');
    return baseYear + (parseInt(grade) - 1);
};

// 과목 카테고리 분류 함수
const categorizeLecture = (lecture: CurriculumLecture): string => {
    switch (lecture.type) {
        case 'MR':
            return CONSTANTS.CATEGORIES.MAJOR_REQUIRED;
        case 'ME':
            return CONSTANTS.CATEGORIES.MAJOR_ELECTIVE;
        case 'GR':
        case 'GE':
            return CONSTANTS.CATEGORIES.LIBERAL_ARTS;
        case 'RE':
            return CONSTANTS.CATEGORIES.RESEARCH; 
        case 'FE':
            return CONSTANTS.CATEGORIES.FREE;
        default:
            return CONSTANTS.CATEGORIES.MAJOR_ELECTIVE;
    }
};

// Error handling utilities
class CurriculumError extends Error {
    constructor(message: string, public code: string, public details?: any) {
        super(message);
        this.name = 'CurriculumError';
    }
}

const handleCurriculumError = (error: unknown): string => {
    if (error instanceof CurriculumError) {
        switch (error.code) {
            case 'NO_LECTURES':
                return '현재 커리큘럼에 과목이 없습니다.';
            case 'INVALID_CURRICULUM':
                return '유효하지 않은 커리큘럼 데이터입니다.';
            case 'NETWORK_ERROR':
                return '네트워크 연결을 확인해주세요.';
            case 'UNAUTHORIZED':
                return '로그인이 필요합니다.';
            default:
                return error.message || '커리큘럼 처리 중 오류가 발생했습니다.';
        }
    }
    if (error instanceof Error) {
        console.error('Curriculum error:', error);
        return error.message;
    }
    console.error('Unknown curriculum error:', error);
    return '알 수 없는 오류가 발생했습니다.';
};

interface SnackbarState {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
}

// Custom Hooks
const useCurriculumData = () => {
    const { user } = useAuth();
    const [curricula, setCurricula] = useState<Curriculum[]>([]);
    const [currentSemester, setCurrentSemester] = useState<string>('1-1');
    const [userProfile, setUserProfile] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDefaultOnly, setShowDefaultOnly] = useState(false);

    const loadCurricula = useCallback(async () => {
        if (!user?.email) {
            setCurricula([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const [curriculaData, profileResponse] = await Promise.all([
                curriculumService.getCurriculums(showDefaultOnly),
                apiClient.get('/profile')
            ]);

            const profileData = profileResponse.data.data;
            setUserProfile(profileData);

            const grade = profileData.grade || 1;
            const semester = profileData.semester || 1;
            setCurrentSemester(`${grade}-${semester}`);

            setCurricula(curriculaData);

        } catch (error) {
            console.error('Failed to load curricula:', error);
            setError(handleCurriculumError(error));
        } finally {
            setLoading(false);
        }
    }, [user?.email, showDefaultOnly]);

    useEffect(() => {
        loadCurricula();
    }, [loadCurricula]);

    return {
        curricula,
        currentSemester,
        userProfile,
        setCurricula,
        loading,
        error,
        loadCurricula,
        deleteCurriculum: async (id: number) => {
            try {
                await curriculumService.deleteCurriculum(id);
                setCurricula(prev => prev.filter(c => c.id !== id));
            } catch (err) {
                console.error('Failed to delete curriculum:', err);
                throw err;
            }
        },
        showDefaultOnly,
        setShowDefaultOnly
    };
};

const useCurriculumFiltering = (curricula: CurriculumType[]) => {
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<'recent' | 'name'>('recent');

    const filteredCurricula = useMemo(() => {
        return curriculumService.filterAndSortCurriculums(curricula, search, sort);
    }, [curricula, search, sort]);

    return {
        search,
        setSearch,
        sort,
        setSort,
        filteredCurricula,
    };
};

// Components
interface SemesterCardProps {
    semester: string;
    lectures: CurriculumLecture[];
    isCurrent: boolean;
    isCompleted: boolean;
    onAddLecture: (curriculumId: number, semester: string) => void;
    curriculumId: number;
    currentUserSemester: string;
    onLectureClick: (lecture: CurriculumLecture) => void;
}

const SemesterCard: React.FC<SemesterCardProps> = ({
    semester,
    lectures,
    isCurrent,
    isCompleted,
    onAddLecture,
    curriculumId,
    currentUserSemester,
    onLectureClick,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const CardComponent = isCompleted ? CompletedCard : isCurrent ? CurrentCard : TimelineCard;

    const [currentGrade, currentSem] = currentUserSemester.split('-').map(Number);
    
    // 과목들을 카테고리별로 분류
    const categorizedLectures = useMemo(() => {
        const categories = new Map<string, CurriculumLecture[]>();

        lectures.forEach(lecture => {
            const category = categorizeLecture(lecture);

            if (!categories.has(category)) {
                categories.set(category, []);
            }
            categories.get(category)!.push(lecture);
        });

        return categories;
    }, [lectures]);

    const totalCredits = lectures.reduce((sum, lecture) => sum + (lecture.credits || 3), 0);
    const semesterLabel = getSemesterLabel(semester);

    return (
        <Zoom in={true} style={{ transitionDelay: isCurrent ? '0ms' : '100ms' }}>
            <CardComponent sx={{ mb: 2 }}>
                <Box sx={{ p: 2 }}>
                    {/* 학기 헤더 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box>
                            <Typography variant="h6" component="h3" fontWeight="bold">
                                {semesterLabel}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                총 {lectures.length}과목 • {totalCredits}학점
                            </Typography>
                        </Box>
                        <Chip
                            label={isCompleted ? '완료' : isCurrent ? '진행중' : '예정'}
                            color={isCompleted ? 'success' : isCurrent ? 'info' : 'default'}
                            size="small"
                        />
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* 강의가 없을 때 */}
                    {lectures.length === 0 ? (
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={() => onAddLecture(curriculumId, semester)}
                            >
                                과목 추가
                            </Button>
                        </Box>
                    ) : (
                        <>
                            {/* 강의가 있을 때: 기존 카테고리별 렌더링 */}
                            {Array.from(
                                lectures.reduce((categories, lecture) => {
                                    const category = categorizeLecture(lecture);
                                    if (!categories.has(category)) categories.set(category, []);
                                    categories.get(category)!.push(lecture);
                                    return categories;
                                }, new Map<string, CurriculumLecture[]>())
                            ).map(([category, categoryLectures]) => (
                                <Accordion key={category} sx={{ mb: 1 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <CategoryIcon>{getCategoryIcon(category)}</CategoryIcon>
                                            <Typography variant="subtitle1" fontWeight="medium">
                                                {category} ({categoryLectures.length}과목)
                                            </Typography>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <List dense>
                                            {categoryLectures.map((lecture, index) => {
                                                const statusChip = getStatusChip(lecture);
                                                return (
                                                    <ListItem
                                                        key={index}
                                                        button
                                                        onClick={() => onLectureClick(lecture)}
                                                    >
                                                        <ListItemIcon>{getStatusIcon(lecture)}</ListItemIcon>
                                                        <ListItemText
                                                            primary={
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Typography>{lecture.name}</Typography>
                                                                    <Chip
                                                                        label={statusChip.label}
                                                                        size="small"
                                                                        color={statusChip.color}
                                                                        variant="outlined"
                                                                    />
                                                                </Box>
                                                            }
                                                        />
                                                    </ListItem>
                                                );
                                            })}
                                        </List>
                                    </AccordionDetails>
                                </Accordion>
                            ))}

                            {/* 과목 추가 버튼 */}
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<AddIcon />}
                                    onClick={() => onAddLecture(curriculumId, semester)}
                                >
                                    과목 추가
                                </Button>
                            </Box>
                        </>
                    )}
                </Box>
            </CardComponent>
        </Zoom>
    );
}; 

interface CurriculumTimelineProps {
    curriculum: CurriculumWithStats;
    currentSemester: string;
    userProfile?: any;
    onAddLecture: (curriculumId: number, semester: string) => void;
    onEdit: (curriculum: CurriculumType) => void;
    onDelete: (id: number) => void;
    onCreateSchedule: (curriculum: CurriculumType) => void;
    onLectureClick: (lecture: CurriculumLecture) => void;
    onAddSemester: (curriculumId: number, grade: number, semester: number) => void;
}

const CurriculumTimeline: React.FC<CurriculumTimelineProps> = ({
    curriculum,
    currentSemester,
    userProfile,
    onAddLecture,
    onEdit,
    onDelete,
    onCreateSchedule,
    onLectureClick,
    onAddSemester,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const lectures = curriculum.lectures || [];
    const relevantLectures = lectures.filter(lecture => lecture.curri_id === curriculum.id);

    // 학기별로 과목 분류
    const semesterMap = new Map<string, CurriculumLecture[]>();
    lectures.forEach(lecture => {
        const semesterKey = `${lecture.grade}-${lecture.semester}`;
        if (!semesterMap.has(semesterKey)) {
        semesterMap.set(semesterKey, []);
        }
        semesterMap.get(semesterKey)!.push(lecture);
    });

    const getNextSemester = (
        lectures: CurriculumLecture[],
        extraSemesters: { grade: number; semester: number }[] = []
    ) => {
        const allSemesters = [
            ...lectures.map(l => ({ grade: l.grade, semester: Number(l.semester) })),
            ...extraSemesters,
        ];

        if (allSemesters.length === 0) {
            return { grade: 5, semester: 1 };
        }

        const last = allSemesters.reduce((latest, cur) => {
            if (cur.grade > latest.grade) return cur;
            if (cur.grade === latest.grade && cur.semester > latest.semester) return cur;
            return latest;
        });

        let nextGrade = last.grade;
        let nextSemester = last.semester;

        if (nextSemester === 1) {
            nextSemester = 2;
        } else if (nextSemester === 2) {
            nextGrade += 1;
            nextSemester = 1;
        }

        return { grade: nextGrade, semester: nextSemester };
    };

    const nextSem = getNextSemester(lectures, curriculum.extraSemesters ?? []);
    const totalCredits = curriculum.total_credits || 0;
    const completedLectures = lectures.filter(lecture => lecture.isCompleted).length;
    const completionRate = lectures.length > 0 ? (completedLectures / lectures.length) * 100 : 0;

    const [currentGrade, currentSem] = currentSemester.split('-').map(Number);

    const allSemesters = [];
    for (let grade = 1; grade <= 4; grade++) {
        for (let sem = 1; sem <= 2; sem++) {
            allSemesters.push(`${grade}-${sem}`);
        }
    }

    const statusStats = useMemo(() => {
        const [currentGrade, currentSem] = currentSemester.split('-').map(Number);
        
        const stats = {
            completed: 0,
            current: 0,
            planned: 0,
            offTrack: 0
        };
        
        relevantLectures.forEach(lecture => {
            const status = lecture.status as 'completed' | 'current' | 'planned' | 'off-track';
            switch (status) {
                case 'completed':
                    stats.completed++;
                    break;
                case 'current':
                    stats.current++;
                    break;
                case 'planned':
                    stats.planned++;
                    break;
                case 'off-track':
                    stats.offTrack++;
                    break;
            }
        });
        
        return stats;
    }, [relevantLectures, currentSemester]);

    return (
        <Box sx={{ mb: 4 }}>
            {/* 커리큘럼 헤더 */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                            <SchoolOutlined fontSize="large" />
                        </Avatar>
                        <Box>
                            <Typography variant="h4" component="h1" fontWeight="bold">
                                📚 {curriculum.name}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                현재 학기: {currentGrade}학년 {currentSem}학기 
                                {userProfile && (
                                    <> • {userProfile.name || ''}님 ({userProfile.major || ''})</>
                                )}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => onEdit(curriculum)}
                        >
                            편집
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<ScheduleIcon />}
                            onClick={() => onCreateSchedule(curriculum)}
                            disabled={relevantLectures.length === 0}
                            title={
                                relevantLectures.length === 0
                                ? '시간표를 생성할 과목이 없습니다'
                                : '시간표 생성'
                            }
                        >
                            시간표 생성
                        </Button>
                        <IconButton
                            color="error"
                            onClick={() => onDelete(curriculum.id)}
                        >
                            <DeleteOutline />
                        </IconButton>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            총 과목
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                            {relevantLectures.length}과목
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            총 학점
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                            {totalCredits}학점
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            완료율
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                            {Math.round(curriculum.completionRate)}%
                        </Typography>
                    </Box>
                </Box>

                <ProgressBar
                    variant="determinate"
                    value={curriculum.completionRate ?? 0}
                    sx={{
                        height: 12,
                        borderRadius: 6,
                        [`& .MuiLinearProgress-bar`]: {
                            backgroundColor: theme.palette.primary.main,
                        },
                    }}
                />
            </Paper>

            {/* 학기별 카드 */}
            <Grid container spacing={3}>
                {[...semesterMap.keys(), ...(curriculum.extraSemesters ?? []).map(s => `${s.grade}-${s.semester}`)]
                    .sort((a, b) => {
                        const [ag, as] = a.split('-').map(Number);
                        const [bg, bs] = b.split('-').map(Number);
                        return ag === bg ? as - bs : ag - bg;
                    })
                    .map((semesterKey) => {
                        const [grade, semester] = semesterKey.split('-').map(Number);
                        const semesterLectures = semesterMap.get(semesterKey) || [];
                        const isCurrent = grade === currentGrade && semester === currentSem;
                        const isCompleted = grade < currentGrade || (grade === currentGrade && semester < currentSem);

                        return (
                        <Grid item xs={12} md={6} lg={4} key={semesterKey}>
                            <SemesterCard
                            semester={semesterKey}
                            lectures={semesterLectures}
                            isCurrent={isCurrent}
                            isCompleted={isCompleted}
                            onAddLecture={onAddLecture}
                            curriculumId={curriculum.id}
                            currentUserSemester={currentSemester}
                            onLectureClick={onLectureClick}
                            />
                        </Grid>
                    );
                })}

                {/* 새 학기 추가 버튼 */}
                <Grid item xs={12} md={6} lg={4}>
                    <Card
                    sx={{
                        p: 4,
                        border: '2px dashed #90caf9',
                        borderRadius: 3,
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                    }}
                    >
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => onAddSemester(curriculum.id, nextSem.grade, nextSem.semester)}
                    >
                        {`${nextSem.grade}학년 ${nextSem.semester}학기 추가`}
                    </Button>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

interface CurriculumHeaderProps {
    search: string;
    sort: 'recent' | 'name';
    showDefaultOnly: boolean;
    onSearchChange: (value: string) => void;
    onSortChange: (value: 'recent' | 'name') => void;
    onShowDefaultOnlyChange: (value: boolean) => void;
    onCreateNew: () => void;
}

const CurriculumHeader: React.FC<CurriculumHeaderProps> = ({
    search,
    sort,
    showDefaultOnly,
    onSearchChange,
    onSortChange,
    onShowDefaultOnlyChange,
    onCreateNew,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box sx={{ p: 2, pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SchoolOutlined color="primary" fontSize="large" />
                    <Typography variant="h4" component="h1">
                        나의 학습 로드맵
                    </Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <Button
                    variant="contained"
                    startIcon={<AddCircleOutline />}
                    onClick={onCreateNew}
                    sx={{ minWidth: isMobile ? 'auto' : 120 }}
                >
                    {isMobile ? '추가' : '새 커리큘럼'}
                </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                    size="small"
                    placeholder="커리큘럼 검색..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ minWidth: 200, flexGrow: 1 }}
                />

                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>정렬</InputLabel>
                    <Select
                        value={sort}
                        onChange={(e) => onSortChange(e.target.value as 'recent' | 'name')}
                        label="정렬"
                    >
                        <MenuItem value="recent">최신순</MenuItem>
                        <MenuItem value="name">이름순</MenuItem>
                    </Select>
                </FormControl>

                <FormControlLabel
                    control={
                        <Switch
                            checked={showDefaultOnly}
                            onChange={(e) => onShowDefaultOnlyChange(e.target.checked)}
                            size="small"
                        />
                    }
                    label="기본만"
                />
            </Box>
        </Box>
    );
};

// Main Component
const CurriculumPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [highlightId, setHighlightId] = useState<number | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [addLectureOpen, setAddLectureOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [selectedCurriculum, setSelectedCurriculum] = useState<CurriculumType | null>(null);
    const [selectedLecture, setSelectedLecture] = useState<CurriculumLecture | null>(null);
    const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
    const [selectedGrade, setSelectedGrade] = useState<number>(1);
    const [selectedSemester, setSelectedSemester] = useState<'1' | '2' | 'S' | 'W'>('1');
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [selectedCurriculumForSchedule, setSelectedCurriculumForSchedule] = useState<{
        id: number;
        name: string;
    } | null>(null);

    // 커리큘럼 생성(챗봇에서 전달) mock 데이터
    const newCurriculum = location.state?.newCurriculum;

    // Custom hooks
    const { curricula, currentSemester, userProfile, setCurricula, loading, error, loadCurricula, deleteCurriculum, showDefaultOnly, setShowDefaultOnly } = useCurriculumData();
    const { search, setSearch, sort, setSort, filteredCurricula } = useCurriculumFiltering(curricula);

    // 과목 클릭 핸들러
    const handleLectureClick = useCallback((lecture: CurriculumLecture) => {
        setSelectedLecture(lecture);
        setSelectedCurriculum(curricula.find(c => c.id === lecture.curri_id) || null);
        setStatusModalOpen(true);
    }, [curricula]);

    const handleStatusUpdate = useCallback((lecture: CurriculumLecture) => {
        loadCurricula();
        setSnackbar({ open: true, message: '과목 상태가 업데이트되었습니다.', severity: 'success' });
    }, [loadCurricula]);

    // Calculate stats for each curriculum
    const curriculaWithStats = useMemo(() => {
        return filteredCurricula.map(curriculum => {
            const lectures = curriculum.lectures || [];
            const relevantLectures = lectures.filter(lecture => lecture.curri_id === curriculum.id);
            const totalLectures = relevantLectures.length;

            const semesterMap = new Map<string, CurriculumLecture[]>();
            relevantLectures.forEach(lecture => {
                const semesterKey = `${lecture.grade}-${lecture.semester}`;
                if (!semesterMap.has(semesterKey)) {
                    semesterMap.set(semesterKey, []);
                }
                semesterMap.get(semesterKey)!.push(lecture);
            });

            const semesterBreakdown = Array.from(semesterMap.entries())
                .map(([semester, semesterLectures]) => ({
                    semester,
                    lectures: semesterLectures,
                    credits: semesterLectures.reduce((sum, lecture) => sum + (lecture.credits || 0), 0),
                }))
                .sort((a, b) => a.semester.localeCompare(b.semester));

            
            return {
                ...curriculum,
                totalLectures,
                totalCredits: curriculum.total_credits,
                completionRate: curriculum.completionRate ?? 0,
                semesterBreakdown,
            };
        });
    }, [filteredCurricula]);


    // Highlight on new curriculum with cleanup
    useEffect(() => {
        const id = (location.state as any)?.newCurriculumId;
        if (id) {
            setHighlightId(id);
            const timer = setTimeout(() => setHighlightId(null), CONSTANTS.HIGHLIGHT_DURATION);
            return () => clearTimeout(timer);
        }
    }, [location.state]);

    // Error handling
    useEffect(() => {
        if (error) {
            setSnackbar({ open: true, message: error, severity: 'error' });
        }
    }, [error]);

    // Event handlers
    const handleAddSemester = (curriculumId: number, grade: number, semester: number) => {
        setCurricula(prev =>
            prev.map(cur => {
                if (cur.id !== curriculumId) return cur;

                const newSemesterKey = `${grade}-${semester}`;
                const existing = cur.lectures?.some(l => `${l.grade}-${l.semester}` === newSemesterKey);

                if (existing) return cur;

                return {
                    ...cur,
                    lectures: [...(cur.lectures ?? [])],
                    extraSemesters: [...(cur.extraSemesters ?? []), { grade, semester }],
                };
            })
        );
    };

    const handleDetail = useCallback((curriculum: CurriculumType) => {
        setSelectedCurriculum(curriculum);
        setDetailOpen(true);
    }, []);

    const handleEdit = useCallback((curriculum: CurriculumType) => {
        setSelectedCurriculum(curriculum);
        setEditOpen(true);
    }, []);

    const handleAddLecture = useCallback((curriculumId: number, semester?: string) => {
        console.log('[DEBUG] handleAddLecture called with semester:', semester);

        setSelectedCurriculum(curricula.find(c => c.id === curriculumId) || null);

        if (semester) {
            const [gradeStr, semStr] = semester.split('-');
            setSelectedGrade(Number(gradeStr));
            setSelectedSemester(semStr as '1' | '2' | 'S' | 'W');
        }

        setAddLectureOpen(true);
    }, [curricula]);

    const handleDelete = useCallback(async (id: number) => {
        try {
            await deleteCurriculum(id);
            setSnackbar({ open: true, message: '커리큘럼이 삭제되었습니다.', severity: 'info' });
            setDeleteDialog({ open: false, id: null });
        } catch (error) {
            console.error('Failed to delete curriculum:', error);
            const errorMessage = handleCurriculumError(error);
            setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        }
    }, [deleteCurriculum]);

    const handleDeleteConfirm = useCallback(() => {
        if (deleteDialog.id) {
            handleDelete(deleteDialog.id);
        }
    }, [deleteDialog.id, handleDelete]);

    const handleCreateNew = useCallback(() => {
        setCreateOpen(true);
    }, []);

    const handleCreateSuccess = useCallback((newCurriculum: CurriculumType) => {
        setCurricula((prev: CurriculumType[]) => [newCurriculum, ...prev]);
        setSnackbar({ open: true, message: '커리큘럼이 생성되었습니다.', severity: 'success' });
    }, [setCurricula]);

    const handleEditSuccess = useCallback((updatedCurriculum: CurriculumType) => {
        setCurricula((prev: CurriculumType[]) => prev.map((curriculum: CurriculumType) =>
            curriculum.id === updatedCurriculum.id ? updatedCurriculum : curriculum
        ));
        setSnackbar({ open: true, message: '커리큘럼이 수정되었습니다.', severity: 'success' });
    }, [setCurricula]);

    const handleLectureSuccess = useCallback((lecture: CurriculumLecture) => {
        // 커리큘럼 목록 새로고침
        loadCurricula();
        setSnackbar({ open: true, message: '과목이 저장되었습니다.', severity: 'success' });
    }, [loadCurricula]);

    // 시간표 생성 핸들러
    const handleCreateSchedule = useCallback((curriculum: CurriculumType) => {
        setSelectedCurriculumForSchedule({
            id: curriculum.id,
            name: curriculum.name
        });
        setScheduleModalOpen(true);
    }, []);

    // 생성된 시간표 저장 핸들러
    const handleSaveSchedule = useCallback(
        async (schedule: any) => {
            try {
                const data = await apiService.saveTimetable({
                    semester: currentSemester,
                    courses: schedule.lectures,
                });

                setSnackbar({
                    open: true,
                    message: '시간표가 현재 학기에 저장되었습니다!',
                    severity: 'success',
                });

                navigate('/schedule');
            } catch (error) {
                setSnackbar({
                    open: true,
                    message:
                    error instanceof Error
                        ? error.message
                        : '시간표 저장 중 오류가 발생했습니다.',
                    severity: 'error',
                });
            }
        },
        [navigate]
    );

    // Loading state
    if (loading) {
        return (
            <Box sx={{ pt: '64px', minHeight: `calc(100vh - 64px)`, bgcolor: 'background.default', px: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 3 }}>
                    <Skeleton variant="circular" width={80} height={80} />
                    <Box>
                        <Skeleton variant="text" width={120} height={40} />
                        <Skeleton variant="text" width={200} height={20} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }} />
                    <Skeleton variant="rectangular" width={180} height={40} sx={{ borderRadius: 2 }} />
                    <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 2 }} />
                    <Skeleton variant="rectangular" width={150} height={40} sx={{ borderRadius: 2 }} />
                </Box>
                <Grid container spacing={3}>
                    {[...Array(6)].map((_, i) => (
                        <Grid item xs={12} sm={6} md={4} key={i}>
                            <Card sx={{ p: 2, height: 240 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Skeleton variant="circular" width={40} height={40} />
                                    <Skeleton variant="text" width="60%" height={24} />
                                </Box>
                                <Skeleton variant="text" width="100%" height={16} />
                                <Skeleton variant="text" width="80%" height={16} />
                                <Box sx={{ my: 1 }}>
                                    <Skeleton variant="rectangular" width="100%" height={8} sx={{ borderRadius: 4 }} />
                                    <Skeleton variant="text" width="50%" height={14} />
                                </Box>
                                <Divider sx={{ my: 1 }} />
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                                    <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 12 }} />
                                    <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: 12 }} />
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                                    <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 2 }} />
                                    <Skeleton variant="rectangular" width={60} height={32} sx={{ borderRadius: 2 }} />
                                    <Skeleton variant="circular" width={32} height={32} />
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                pt: '64px',
                minHeight: `calc(100vh - 64px)`,
                bgcolor: 'background.default',
                pb: 6,
            }}
            role="main"
        >
            <CurriculumHeader
                search={search}
                sort={sort}
                showDefaultOnly={showDefaultOnly}
                onSearchChange={setSearch}
                onSortChange={setSort}
                onShowDefaultOnlyChange={setShowDefaultOnly}
                onCreateNew={handleCreateNew}
            />

            <Box sx={{ mx: 2 }}>
                {newCurriculum && (
                    <Card sx={{ mb: 4, p: 3, border: '2px solid #38bdf8', background: '#f0f9ff' }}>
                        <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
                            생성된 커리큘럼 (데모)
                        </Typography>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>{newCurriculum.title}</Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>{newCurriculum.description}</Typography>
                        {newCurriculum.semesters && newCurriculum.semesters.map((sem: any, idx: number) => (
                            <Box key={idx} sx={{ mb: 1.5 }}>
                                <Typography variant="subtitle1" fontWeight={700} color="primary" sx={{ mb: 0.5 }}>
                                    {sem.semester}
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {sem.subjects.map((subject: any, i: number) => (
                                        <Chip
                                            key={i}
                                            label={subject.name}
                                            size="small"
                                            sx={{ bgcolor: '#e0f2fe', color: '#22223b', fontWeight: 600, borderRadius: 1.5, px: 1.5, fontSize: '0.97rem', boxShadow: 'none' }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        ))}
                        <Box sx={{ mt: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                sx={{ fontWeight: 700, borderRadius: 2, fontSize: '1.08rem', px: 3, py: 1.2, boxShadow: '0 2px 8px 0 rgba(14,165,233,0.10)' }}
                                onClick={() => navigate('/schedule', { state: { fromCurriculum: newCurriculum } })}
                            >
                                시간표 생성
                            </Button>
                        </Box>
                    </Card>
                )}
                {curriculaWithStats.length === 0 ? (
                    <Fade in>
                        <Box sx={{ textAlign: 'center', my: 10 }}>
                            <AutoAwesome sx={{ fontSize: 80, color: 'text.disabled' }} />
                            <Typography variant="h6" color="text.disabled">
                                아직 커리큘럼이 없습니다.
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                새로운 커리큘럼을 만들어보세요!
                            </Typography>
                        </Box>
                    </Fade>
                ) : (
                    <Box>
                        {curriculaWithStats.map((curriculum) => (
                            <CurriculumTimeline
                                key={curriculum.id}
                                curriculum={curriculum}
                                currentSemester={currentSemester}
                                userProfile={userProfile}
                                onAddLecture={handleAddLecture}
                                onEdit={handleEdit}
                                onDelete={(id) => setDeleteDialog({ open: true, id })}
                                onCreateSchedule={handleCreateSchedule}
                                onLectureClick={handleLectureClick}
                                onAddSemester={handleAddSemester}
                            />
                        ))}
                    </Box>
                )}
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, id: null })}
                maxWidth="xs"
                aria-labelledby="delete-dialog-title"
            >
                <DialogTitle id="delete-dialog-title">정말 삭제하시겠습니까?</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary">
                        이 작업은 되돌릴 수 없습니다.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, id: null })}>
                        취소
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={handleDeleteConfirm}
                    >
                        삭제
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Curriculum Create Modal */}
            <CurriculumCreateModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onSuccess={handleCreateSuccess}
            />

            {/* Curriculum Detail Modal */}
            <CurriculumDetailModal
                open={detailOpen}
                curriculum={selectedCurriculum}
                onClose={() => setDetailOpen(false)}
                onEdit={(curriculum) => {
                    setSelectedCurriculum(curriculum);
                    setEditOpen(true);
                    setDetailOpen(false);
                }}
                onDelete={(id) => setDeleteDialog({ open: true, id })}
                onAddLecture={(curriculumId) => {
                    setSelectedCurriculum(curricula.find(c => c.id === curriculumId) || null);
                    setAddLectureOpen(true);
                    setDetailOpen(false);
                }}
            />

            {/* Curriculum Edit Modal */}
            <CurriculumEditModal
                open={editOpen}
                curriculum={selectedCurriculum}
                onClose={() => setEditOpen(false)}
                onSuccess={handleEditSuccess}
            />

            {/* Lecture Form Modal */}
            <LectureFormModal
                open={addLectureOpen}
                curriculumId={selectedCurriculum?.id || 0}
                lecture={selectedLecture}
                grade={selectedGrade}
                semester={selectedSemester}
                onClose={() => {
                    setAddLectureOpen(false);
                    setSelectedLecture(null);
                }}
                onSuccess={handleLectureSuccess}
            />

            {/* Lecture Status Modal */}
            <LectureStatusModal
                open={statusModalOpen}
                lecture={selectedLecture}
                curriculumId={selectedCurriculum?.id || 0}
                onClose={() => {
                    setStatusModalOpen(false);
                    setSelectedLecture(null);
                }}
                onSuccess={handleStatusUpdate}
                onDeleteSuccess={(message) => {
                    loadCurricula();
                    setSnackbar({ open: true, message, severity: 'info' });
                }}
            />

            {/* Schedule Creation Modal */}
            <ScheduleCreationModal
                open={scheduleModalOpen}
                onClose={() => setScheduleModalOpen(false)}
                curriculumId={selectedCurriculumForSchedule?.id || 0}
                curriculumName={selectedCurriculumForSchedule?.name || ''}
                onSaveSchedule={handleSaveSchedule}
            />

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CurriculumPage; 