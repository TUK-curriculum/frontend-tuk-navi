import React, { useReducer, useRef, useEffect, useCallback, useState, useMemo } from 'react';
import {
    Box, Grid, Typography, Card, CardContent, Avatar, Chip, Skeleton, Alert, Paper, Divider
} from '@mui/material';

import {
    FaBookOpen, FaTrophy, FaRobot, FaCalendarAlt, FaExternalLinkAlt, FaCheckCircle, FaServer, FaLaptopCode, FaChartBar, FaVrCardboard, FaUserTie, FaGamepad, FaPencilRuler, FaCube, FaNetworkWired, FaCogs, FaCheck, FaCloud, FaDatabase, FaShieldAlt, FaMobileAlt, FaProjectDiagram, FaLightbulb
} from 'react-icons/fa';

import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/SeparatedDataContext';
import mascotBg from '../assets/dashboard.png';
import { diagnoseGraduation } from '../data/graduationRequirements';
import PersonIcon from '@mui/icons-material/Person';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import EditIcon from '@mui/icons-material/Edit';
import InterestSelection from './InterestSelection';

const isSemesterStart = true;

// 커리큘럼 리스트를 컴포넌트 외부로 이동하여 리렌더링 최적화
const curriculumList = [
    "백엔드 과정 커리큘럼",
    "프론트엔드 과정 커리큘럼",
    "웹개발 종합 로드맵",
    "정보보안 전문가 트랙",
    "AI/머신러닝 입문",
    "데이터사이언스 마스터",
    "모바일 앱 개발",
    "클라우드 엔지니어링",
    "게임 개발자 과정",
    "UI/UX 디자이너 트랙",
    "블록체인 개발",
    "IoT 개발자 과정",
    "빅데이터 분석",
    "네트워크 전문가",
    "DevOps 엔지니어",
    "QA/테스트 엔지니어",
    "IT 컨설턴트 트랙",
    "AR/VR 개발",
    "로봇 소프트웨어",
    "IT 창업가 과정"
];

function getRandomCurriculums<T>(list: T[], n: number): T[] {
    const shuffled = [...list].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12,
            duration: 0.9,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.7,
            ease: [0.25, 0.46, 0.45, 0.94],
            type: "spring",
            stiffness: 120,
            damping: 16
        }
    },
};

const floatingVariants = {
    animate: {
        y: [-8, 8, -8],
        transition: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

// Enhanced micro-interaction variants
const cardHoverVariants = {
    rest: { scale: 1, y: 0 },
    hover: {
        scale: 1.02,
        y: -4,
        transition: {
            duration: 0.25,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    },
    tap: { scale: 0.98 }
};

// 커리큘럼별 아이콘 매핑
const curriculumIcons: Record<string, React.ReactNode> = {
    '백엔드 과정 커리큘럼': <FaServer size={32} color="#0ea5e9" />,
    '프론트엔드 과정 커리큘럼': <FaLaptopCode size={32} color="#0ea5e9" />,
    '빅데이터 분석': <FaChartBar size={32} color="#0ea5e9" />,
    'AR/VR 개발': <FaVrCardboard size={32} color="#0ea5e9" />,
    'IT 컨설턴트 트랙': <FaUserTie size={32} color="#0ea5e9" />,
    'AI/머신러닝 입문': <FaRobot size={32} color="#0ea5e9" />,
    '게임 개발자 과정': <FaGamepad size={32} color="#0ea5e9" />,
    'UI/UX 디자이너 트랙': <FaPencilRuler size={32} color="#0ea5e9" />,
    '블록체인 개발': <FaCube size={32} color="#0ea5e9" />,
    'IoT 개발자 과정': <FaNetworkWired size={32} color="#0ea5e9" />,
    'DevOps 엔지니어': <FaCogs size={32} color="#0ea5e9" />,
    'QA/테스트 엔지니어': <FaCheck size={32} color="#0ea5e9" />,
    '클라우드 엔지니어링': <FaCloud size={32} color="#0ea5e9" />,
    '데이터사이언스 마스터': <FaDatabase size={32} color="#0ea5e9" />,
    '정보보안 전문가 트랙': <FaShieldAlt size={32} color="#0ea5e9" />,
    '모바일 앱 개발': <FaMobileAlt size={32} color="#0ea5e9" />,
    '네트워크 전문가': <FaProjectDiagram size={32} color="#0ea5e9" />,
    'IT 창업가 과정': <FaLightbulb size={32} color="#0ea5e9" />,
};

// 커리큘럼 카드 클릭 시 Chatbot으로 presetInput/selectedTrack 전달
function getTrackTitleFromCard(cardName: string): string {
    // 카드명에서 불필요한 단어 제거 및 Chatbot 트랙 title과 매칭
    return cardName
        .replace(/(커리큘럼|트랙|로드맵|마스터|입문|과정)/g, '')
        .replace(/\s+/g, '')
        .toUpperCase();
}

// 상태 및 리듀서 정의
const initialState = {
    contentLoading: true,
    dataError: null as string | null,
    backendData: {
        totalCredits: 0,
        graduationProgress: 0,
        upcomingCourses: [],
        recentNotes: [],
        notifications: [],
        profile: {}
    }
};

function dashboardReducer(state: typeof initialState, action: any) {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, contentLoading: action.payload };
        case 'SET_ERROR':
            return { ...state, dataError: action.payload };
        case 'SET_BACKEND_DATA':
            return { ...state, backendData: action.payload };
        default:
            return state;
    }
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { userData, completedCourses, isLoading, error } = useData();

    // 졸업 요구 학점 상태
    const [requiredThresholds, setRequiredThresholds] = useState({
        totalRequired: 130,
        majorRequired: 69,
        liberalRequired: 37,
    });

    // useReducer로 상태 통합
    const [state, dispatch] = useReducer(dashboardReducer, initialState);
    const { contentLoading, dataError, backendData } = state;

    // 온보딩 편집 모달 상태
    const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

    // 랜덤 커리큘럼 useRef로 관리(불필요한 리렌더링 방지)
    const randomCurriculumsRef = useRef<string[]>([]);
    const [randomCurriculums, setRandomCurriculums] = useState<string[]>([]);

    useEffect(() => {
        const saved = sessionStorage.getItem('randomCurriculums');
        if (saved) {
            randomCurriculumsRef.current = JSON.parse(saved);
            setRandomCurriculums(randomCurriculumsRef.current);
        } else {
            const picked = getRandomCurriculums(curriculumList, 5);
            randomCurriculumsRef.current = picked;
            setRandomCurriculums(picked);
            sessionStorage.setItem('randomCurriculums', JSON.stringify(picked));
        }
    }, []);

    // 백엔드 데이터 즉시 fetch
    const loadBackendData = useCallback(async () => {
        if (!user?.email) return;
        try {
            const { apiService } = await import('../services/ApiService');
            const [profileData, dashboardData] = await Promise.all([
                apiService.getProfile(),
                apiService.getDashboardSummary()
                ]);

            if (dashboardData?.thresholds) {
                setRequiredThresholds({
                    totalRequired: dashboardData.thresholds.totalRequired || 130,
                    majorRequired: dashboardData.thresholds.majorRequired || 69,
                    liberalRequired: dashboardData.thresholds.liberalRequired || 37,
                });
            }

            dispatch({
                type: 'SET_BACKEND_DATA',
                payload: { ...dashboardData, profile: profileData }
            });
            dispatch({ type: 'SET_LOADING', payload: false });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: '백엔드 데이터 로드 실패' });
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [user?.email]);

    useEffect(() => {
        loadBackendData();
    }, [loadBackendData]);

    // 사용자 데이터 계산 최적화 (백엔드 + localStorage 통합)
    const userInfo = useMemo(() => {
        if (!userData) return null;

        const onboarding = userData.onboarding || {};
        const backendProfile = backendData.profile;

        return {
            grade: backendProfile?.grade || userData.profile?.grade || onboarding.year || '-',
            credits: backendData.totalCredits || backendProfile?.completedCredits || userData.graduationInfo?.totalCredits || onboarding.completedCredits || 0,
            courses: userData.completedCourses || [],
            interests: backendProfile?.interests || userData.profile?.interests || onboarding.interests || [],
            career: backendProfile?.career || onboarding.career || '미설정',
            department: backendProfile?.major || onboarding.department || userData.profile?.department || '미설정',
            remainingSemesters: backendProfile?.remainingSemesters || onboarding.remainingSemesters || 0,
            maxCreditsPerTerm: backendProfile?.maxCreditsPerTerm || onboarding.maxCreditsPerTerm || 18,
            // 백엔드 데이터 추가
            upcomingCourses: backendData.upcomingCourses,
            recentNotes: backendData.recentNotes,
            notifications: backendData.notifications
        };
    }, [userData, backendData]);

    // 졸업 진단 최적화 - 졸업까지 퍼센트로 계산
    const graduationProgress = useMemo(() => {
        if (backendData.graduationProgress > 0) {
            return backendData.graduationProgress;
        }

        if (!userInfo?.courses || !userInfo.credits) return 0;

        const requiredCredits = requiredThresholds.totalRequired;
        const currentCredits = typeof userInfo.credits === 'number' ? userInfo.credits : 0;
        const progress = Math.min((currentCredits / requiredCredits) * 100, 100);

        return Math.round(progress);
    }, [userInfo?.courses, userInfo?.credits, backendData.graduationProgress, requiredThresholds.totalRequired]);

    // 세션별 통계 카드 최적화
    const statCards = useMemo(() => {
        const baseCards = isSemesterStart
            ? [
                {
                    title: 'AI 추천 커리큘럼',
                    value: '3개 과목',
                    desc: '이번 학기 맞춤 추천',
                    icon: <FaRobot size={32} color="#0ea5e9" />,
                    color: '#e0f2fe',
                    link: '/curriculum',
                    gradient: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(59, 130, 246, 0.05) 100%)'
                },
                {
                    title: 'AI 추천 시간표',
                    value: '최적 배치',
                    desc: '학습 효율 극대화',
                    icon: <FaCalendarAlt size={32} color="#22c55e" />,
                    color: '#dcfce7',
                    link: '/curriculum',
                    gradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(16, 185, 129, 0.05) 100%)'
                },
                {
                    title: '외부 강의 추천',
                    value: '5개 강의',
                    desc: '전공 역량 강화',
                    icon: <FaExternalLinkAlt size={32} color="#f2740d" />,
                    color: '#fef7ed',
                    link: '/curriculum',
                    gradient: 'linear-gradient(135deg, rgba(251, 146, 60, 0.08) 0%, rgba(245, 101, 101, 0.05) 100%)'
                },
                {
                    title: '졸업까지',
                    value: `${graduationProgress}%`,
                    desc: '목표 달성률',
                    icon: <FaCheckCircle size={32} color="#ab47bc" />,
                    color: '#f3e5f5',
                    link: '/profile',
                    gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(139, 92, 246, 0.05) 100%)'
                },
            ]
            : [
                {
                    title: '진행 중인 강의',
                    value: `${userInfo?.courses.length || 0}개`,
                    desc: '현재 수강 과목',
                    icon: <FaBookOpen size={32} color="#0ea5e9" />,
                    color: '#e0f2fe',
                    link: '/curriculum',
                    gradient: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(59, 130, 246, 0.05) 100%)'
                },
                {
                    title: '다가오는 일정',
                    value: '2건',
                    desc: '과제 및 시험',
                    icon: <FaCalendarAlt size={32} color="#22c55e" />,
                    color: '#dcfce7',
                    link: '/curriculum',
                    gradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(16, 185, 129, 0.05) 100%)'
                },
                {
                    title: '학습 분석',
                    value: '우수',
                    desc: '꾸준한 학습 패턴',
                    icon: <FaRobot size={32} color="#f2740d" />,
                    color: '#fef7ed',
                    link: '/profile',
                    gradient: 'linear-gradient(135deg, rgba(251, 146, 60, 0.08) 0%, rgba(245, 101, 101, 0.05) 100%)'
                },
                {
                    title: '졸업까지',
                    value: `${graduationProgress}%`,
                    desc: '목표 달성률',
                    icon: <FaTrophy size={32} color="#ab47bc" />,
                    color: '#f3e5f5',
                    link: '/profile',
                    gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(139, 92, 246, 0.05) 100%)'
                },
            ];

        return baseCards;
    }, [isSemesterStart, userInfo?.courses.length, graduationProgress]);

    // 로딩 상태 관리
    useEffect(() => {
        if (!isLoading && userData) {
            const timer = setTimeout(() => {
                dispatch({ type: 'SET_LOADING', payload: false });
            }, 600); // 부드러운 로딩 전환

            return () => clearTimeout(timer);
        }
    }, [isLoading, userData]);

    // 커리큘럼 카드 클릭 핸들러 최적화
    const handleCurriculumCardClick = useMemo(() => {
        return (cardName: string) => {
            try {
                navigate('/chatbot', {
                    state: {
                        presetInput: `${cardName} 커리큘럼 만들어줘!`,
                        selectedTrack: cardName
                    }
                });
            } catch (error) {
                console.error('네비게이션 오류:', error);
                dispatch({ type: 'SET_ERROR', payload: '페이지 이동 중 오류가 발생했습니다.' });
            }
        };
    }, [navigate]);

    // 에러 상태 렌더링
    if (error || dataError) {
        return (
            <Box sx={{
                pt: 0,
                minHeight: `calc(100vh - 0px)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2
            }}>
                <Alert
                    severity="error"
                    sx={{
                        maxWidth: 600,
                        borderRadius: 3,
                        boxShadow: 2
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        데이터 로딩 중 오류가 발생했습니다
                    </Typography>
                    <Typography variant="body2">
                        {error || dataError}
                    </Typography>
                </Alert>
            </Box>
        );
    }

    // 로딩 스켈레톤
    if (isLoading || contentLoading) {
        return (
            <Box sx={{
                pt: 0,
                minHeight: `calc(100vh - 0px)`,
                background: 'linear-gradient(135deg, #e0f2ff 0%, #f3e8ff 100%)',
                px: { xs: 2, md: 6 },
                py: { xs: 4, md: 6 }
            }}>
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
                            {/* Header Skeleton */}
                            <Skeleton
                                variant="text"
                                height={60}
                                sx={{ mb: 2, borderRadius: 2 }}
                            />
                            <Skeleton
                                variant="text"
                                height={40}
                                width="60%"
                                sx={{ mb: 4, borderRadius: 2 }}
                            />

                            {/* Stats Cards Skeleton */}
                            <Grid container spacing={4} sx={{ mb: 4 }}>
                                {[1, 2, 3, 4].map((i) => (
                                    <Grid item xs={12} sm={6} md={3} key={i}>
                                        <Skeleton
                                            variant="rectangular"
                                            height={180}
                                            sx={{ borderRadius: 4 }}
                                        />
                                    </Grid>
                                ))}
                            </Grid>

                            {/* Profile Info Skeleton */}
                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                <Grid item xs={12} md={6}>
                                    <Skeleton
                                        variant="rectangular"
                                        height={300}
                                        sx={{ borderRadius: 4 }}
                                    />
                                </Grid>
                            </Grid>

                            {/* Curriculum Cards Skeleton */}
                            <Skeleton
                                variant="rectangular"
                                height={400}
                                sx={{ borderRadius: 4 }}
                            />
                        </Box>
                    </motion.div>
                </AnimatePresence>
            </Box>
        );
    }

    return (
        <Box sx={{
            pt: 0,
            minHeight: `calc(100vh - 0px)`,
            background: 'linear-gradient(135deg, #e0f2ff 0%, #f3e8ff 100%)',
            position: 'relative',
            overflow: 'hidden',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}>
            {/* 배경 장식 요소들 */}
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                    radial-gradient(circle at 20% 80%, rgba(201, 231, 255, 0.35) 0%, transparent 60%),
                    radial-gradient(circle at 80% 20%, rgba(243, 232, 255, 0.35) 0%, transparent 60%),
                    radial-gradient(circle at 40% 40%, rgba(224, 242, 255, 0.25) 0%, transparent 60%)
                `,
                pointerEvents: 'none'
            }} />

            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ width: '100%' }}
                >
                    <Box sx={{
                        width: '100%',
                        maxWidth: 1280,
                        mx: 'auto',
                        py: 0,
                        mt: { xs: 4, md: 6 },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: 'rgba(255,255,255,0.88)',
                        borderRadius: 6,
                        boxShadow: '0 8px 40px rgba(14,165,233,0.08), 0 2px 16px rgba(14,165,233,0.04)',
                        px: { xs: 3, md: 7 },
                        pt: { xs: 5, md: 7 },
                        pb: { xs: 5, md: 7 },
                        overflow: 'visible',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}>
                        <Typography
                            variant="h3"
                            fontWeight={800}
                            mb={1.5}
                            fontFamily="Pretendard, sans-serif"
                            sx={{
                                color: '#1e293b',
                                textShadow: '0 2px 12px rgba(30, 41, 59, 0.08)',
                                fontSize: { xs: '1.85rem', sm: '2.25rem', md: '2.75rem' },
                                textAlign: 'center',
                                lineHeight: 1.15,
                                letterSpacing: '-0.02em'
                            }}
                        >
                            안녕하세요, {user?.profile?.nickname || user?.name || '학생'}님! 👋
                        </Typography>
                        <Typography
                            variant="h6"
                            color="#475569"
                            mb={4}
                            fontWeight={600}
                            fontFamily="Pretendard, sans-serif"
                            sx={{
                                textShadow: '0 1px 6px rgba(71, 85, 105, 0.06)',
                                textAlign: 'center',
                                fontSize: { xs: '1.05rem', sm: '1.15rem', md: '1.35rem' },
                                letterSpacing: '-0.015em',
                                px: { xs: 2, md: 0 },
                                lineHeight: 1.4
                            }}
                        >
                            ✨ 오늘도 TUK NAVI와 함께 학습 목표를 달성해보세요
                        </Typography>

                        {/* Stats Cards - 통일된 크기와 간격 */}
                        <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mb: 3, mt: 0, px: 0, width: '100%', overflow: 'visible' }} justifyContent="center" alignItems="stretch">
                            {statCards.map((card, index) => (
                                <Grid item xs={12} sm={6} lg={3} key={card.title}>
                                    <motion.div
                                        variants={cardHoverVariants}
                                        initial="rest"
                                        whileHover="hover"
                                        whileTap="tap"
                                        transition={{ delay: index * 0.08 }}
                                    >
                                        <Card
                                            sx={{
                                                background: card.gradient,
                                                borderRadius: 5,
                                                boxShadow: `
                                            0 4px 16px rgba(30, 80, 180, 0.08),
                                            0 2px 8px rgba(0, 181, 255, 0.06),
                                            0 0 0 1px rgba(255, 255, 255, 0.9)
                                        `,
                                                transition: 'all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                                cursor: 'pointer',
                                                border: '1px solid rgba(255, 255, 255, 0.6)',
                                                backdropFilter: 'blur(8px)',
                                                height: '100%', // 모든 카드 높이 통일
                                                display: 'flex',
                                                flexDirection: 'column',
                                                '&:hover': {
                                                    boxShadow: `
                                                0 12px 32px rgba(0, 181, 255, 0.16),
                                                0 4px 16px rgba(30, 80, 180, 0.12),
                                                0 0 0 2px rgba(0, 181, 255, 0.08)
                                            `,
                                                    background: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, ${card.color} 100%)`
                                                }
                                            }}
                                            onClick={() => navigate(card.link)}
                                            role="button"
                                            aria-label={`${card.title}: ${card.value}`}
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    navigate(card.link);
                                                }
                                            }}
                                        >
                                            <CardContent sx={{
                                                width: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                p: { xs: 4, md: 5 }, // 패딩 증가로 더 넉넉한 공간
                                                pb: { xs: 3.5, md: 4.5 },
                                                position: 'relative',
                                                zIndex: 1,
                                                minHeight: { xs: 200, md: 220 }, // 최소 높이 증가
                                                flex: 1
                                            }}>
                                                <motion.div
                                                    variants={floatingVariants}
                                                    animate="animate"
                                                    style={{ marginBottom: '1.5rem' }}
                                                >
                                                    <Avatar
                                                        sx={{
                                                            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%)',
                                                            width: { xs: 76, md: 84 }, // 아이콘 크기 증가
                                                            height: { xs: 76, md: 84 },
                                                            boxShadow: '0 12px 32px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)',
                                                            border: '2px solid rgba(255,255,255,0.4)',
                                                            backdropFilter: 'blur(12px)'
                                                        }}
                                                    >
                                                        {card.icon}
                                                    </Avatar>
                                                </motion.div>
                                                <Typography
                                                    variant="subtitle1"
                                                    fontWeight={700}
                                                    color="#334155"
                                                    mb={1.5}
                                                    fontFamily="Pretendard, sans-serif"
                                                    sx={{
                                                        textAlign: 'center',
                                                        fontSize: { xs: '1rem', md: '1.1rem' },
                                                        letterSpacing: '-0.01em'
                                                    }}
                                                >
                                                    {card.title}
                                                </Typography>
                                                <Typography
                                                    variant="h5"
                                                    fontWeight={800}
                                                    color="#0ea5e9"
                                                    mb={1.5}
                                                    sx={{
                                                        wordBreak: 'keep-all',
                                                        textAlign: 'center',
                                                        textShadow: '0 2px 12px rgba(14, 165, 233, 0.12)',
                                                        fontSize: { xs: '1.25rem', md: '1.45rem' },
                                                        letterSpacing: '-0.015em',
                                                        lineHeight: 1.2
                                                    }}
                                                    fontFamily="Pretendard, sans-serif"
                                                >
                                                    {card.value}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    color="#64748b"
                                                    fontWeight={600}
                                                    sx={{
                                                        mt: 'auto', // 하단에 고정
                                                        textAlign: 'center',
                                                        textShadow: '0 1px 6px rgba(100, 116, 139, 0.04)',
                                                        fontSize: { xs: '0.85rem', md: '0.92rem' },
                                                        letterSpacing: '-0.005em',
                                                        lineHeight: 1.3
                                                    }}
                                                    fontFamily="Pretendard, sans-serif"
                                                >
                                                    {card.desc}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </Grid>
                            ))}
                        </Grid>

                        {/* 사용자 정보 섹션 - InterestSelection 데이터 활용 */}
                        {userInfo && (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <Box sx={{ width: '100%', mb: 6 }}>
                                    <Grid container spacing={4} sx={{ mb: 4, mt: 2 }} justifyContent="center" alignItems="stretch">
                                        <Grid item xs={12}>
                                            <motion.div variants={itemVariants}>
                                                <Paper elevation={0} sx={{
                                                    borderRadius: 6,
                                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
                                                    backdropFilter: 'blur(24px)',
                                                    border: '1px solid rgba(226, 232, 240, 0.7)',
                                                    boxShadow: `
                                                        0 24px 48px -12px rgba(0, 0, 0, 0.08),
                                                        0 16px 32px -8px rgba(0, 0, 0, 0.04),
                                                        0 0 0 1px rgba(255, 255, 255, 0.08)
                                                    `,
                                                    width: '100%',
                                                    overflow: 'hidden',
                                                    position: 'relative'
                                                }}>
                                                    {/* Enhanced background decoration */}
                                                    <Box sx={{
                                                        position: 'absolute',
                                                        top: -20,
                                                        right: -20,
                                                        width: '240px',
                                                        height: '240px',
                                                        background: 'radial-gradient(circle, rgba(14, 165, 233, 0.06) 0%, rgba(14, 165, 233, 0.02) 40%, transparent 70%)',
                                                        borderRadius: '50%',
                                                        pointerEvents: 'none'
                                                    }} />
                                                    <Box sx={{
                                                        position: 'absolute',
                                                        bottom: -30,
                                                        left: -30,
                                                        width: '180px',
                                                        height: '180px',
                                                        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.04) 0%, transparent 60%)',
                                                        borderRadius: '50%',
                                                        pointerEvents: 'none'
                                                    }} />

                                                    <Box sx={{ p: { xs: 4, md: 6 }, position: 'relative', zIndex: 1 }}>
                                                        {/* Enhanced header section */}
                                                        <Box sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            mb: { xs: 4, md: 5 },
                                                            pb: 3,
                                                            borderBottom: '1px solid rgba(226, 232, 240, 0.6)'
                                                        }}>
                                                            <Box sx={{
                                                                width: { xs: 64, md: 72 },
                                                                height: { xs: 64, md: 72 },
                                                                borderRadius: 4,
                                                                background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                mr: { xs: 3, md: 4 },
                                                                boxShadow: '0 16px 40px rgba(14, 165, 233, 0.25), 0 4px 12px rgba(14, 165, 233, 0.15)',
                                                                position: 'relative',
                                                                '&::before': {
                                                                    content: '""',
                                                                    position: 'absolute',
                                                                    inset: 0,
                                                                    borderRadius: 4,
                                                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
                                                                    pointerEvents: 'none'
                                                                }
                                                            }}>
                                                                <PersonIcon sx={{ fontSize: { xs: 32, md: 36 }, color: 'white' }} />
                                                            </Box>
                                                            <Box sx={{ flex: 1 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                                                    <Typography
                                                                        variant="h4"
                                                                        fontWeight={900}
                                                                        fontFamily="Pretendard, sans-serif"
                                                                        sx={{
                                                                            background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                                                                            backgroundClip: 'text',
                                                                            WebkitBackgroundClip: 'text',
                                                                            WebkitTextFillColor: 'transparent',
                                                                            fontSize: { xs: '1.6rem', md: '2rem' },
                                                                            letterSpacing: '-0.025em'
                                                                        }}
                                                                    >
                                                                        내 학습 현황
                                                                    </Typography>
                                                                    <motion.div
                                                                        whileHover={{ scale: 1.05 }}
                                                                        whileTap={{ scale: 0.95 }}
                                                                    >
                                                                        <Box
                                                                            onClick={() => setIsOnboardingModalOpen(true)}
                                                                            sx={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                width: 36,
                                                                                height: 36,
                                                                                borderRadius: '50%',
                                                                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                                                                color: 'white',
                                                                                cursor: 'pointer',
                                                                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                                                                transition: 'all 0.2s ease',
                                                                                '&:hover': {
                                                                                    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                                                                                    boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)',
                                                                                }
                                                                            }}
                                                                        >
                                                                            <EditIcon sx={{ fontSize: 18 }} />
                                                                        </Box>
                                                                    </motion.div>
                                                                </Box>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                    <Typography
                                                                        variant="body1"
                                                                        color="text.secondary"
                                                                        sx={{
                                                                            fontSize: { xs: '1rem', md: '1.1rem' },
                                                                            fontWeight: 600,
                                                                            letterSpacing: '-0.01em'
                                                                        }}
                                                                    >
                                                                        {user?.name || '학생'}님의 상세 정보
                                                                    </Typography>
                                                                    <Chip
                                                                        icon={<TrendingUpIcon sx={{ fontSize: 16 }} />}
                                                                        label="성장 중"
                                                                        size="small"
                                                                        sx={{
                                                                            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                                                            color: 'white',
                                                                            fontWeight: 700,
                                                                            fontSize: '0.75rem',
                                                                            height: 26,
                                                                            border: 'none',
                                                                            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                                                                        }}
                                                                    />
                                                                </Box>
                                                            </Box>
                                                        </Box>

                                                        {/* Enhanced stats grid with InterestSelection data */}
                                                        <Grid container spacing={{ xs: 2.5, md: 3 }}>
                                                            {/* 첫 번째 행 - 기본 정보 */}
                                                            <Grid item xs={6} md={3}>
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 20 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: 0.1 }}
                                                                >
                                                                    <Paper elevation={0} sx={{
                                                                        textAlign: 'center',
                                                                        p: { xs: 2.5, md: 3 },
                                                                        borderRadius: 4,
                                                                        background: 'rgba(14, 165, 233, 0.06)',
                                                                        border: '1px solid rgba(14, 165, 233, 0.12)',
                                                                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                                                        cursor: 'pointer',
                                                                        '&:hover': {
                                                                            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.06) 0%, rgba(255, 255, 255, 0.8) 100%)',
                                                                            transform: 'translateY(-4px)',
                                                                            boxShadow: '0 12px 28px rgba(14, 165, 233, 0.2), 0 4px 12px rgba(14, 165, 233, 0.15)'
                                                                        }
                                                                    }}>
                                                                        <Typography
                                                                            variant="body2"
                                                                            color="text.secondary"
                                                                            sx={{
                                                                                mb: { xs: 1.5, md: 2 },
                                                                                fontWeight: 700,
                                                                                fontSize: { xs: '0.8rem', md: '0.85rem' },
                                                                                letterSpacing: '0.5px',
                                                                                textTransform: 'uppercase'
                                                                            }}
                                                                        >
                                                                            학년
                                                                        </Typography>
                                                                        <Typography
                                                                            variant="h3"
                                                                            fontWeight={900}
                                                                            sx={{
                                                                                color: '#0ea5e9',
                                                                                fontSize: { xs: '1.6rem', md: '2rem' },
                                                                                mb: { xs: 0.5, md: 1 },
                                                                                letterSpacing: '-0.02em',
                                                                                lineHeight: 1
                                                                            }}
                                                                        >
                                                                            {userInfo.grade}
                                                                        </Typography>
                                                                    </Paper>
                                                                </motion.div>
                                                            </Grid>

                                                            <Grid item xs={6} md={3}>
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 20 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: 0.2 }}
                                                                >
                                                                    <Paper elevation={0} sx={{
                                                                        textAlign: 'center',
                                                                        p: { xs: 2.5, md: 3 },
                                                                        borderRadius: 4,
                                                                        background: 'rgba(34, 197, 94, 0.06)',
                                                                        border: '1px solid rgba(34, 197, 94, 0.12)',
                                                                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                                                        cursor: 'pointer',
                                                                        '&:hover': {
                                                                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.06) 0%, rgba(255, 255, 255, 0.8) 100%)',
                                                                            transform: 'translateY(-4px)',
                                                                            boxShadow: '0 12px 28px rgba(34, 197, 94, 0.2), 0 4px 12px rgba(34, 197, 94, 0.15)'
                                                                        }
                                                                    }}>
                                                                        <Typography
                                                                            variant="body2"
                                                                            color="text.secondary"
                                                                            sx={{
                                                                                mb: { xs: 1.5, md: 2 },
                                                                                fontWeight: 700,
                                                                                fontSize: { xs: '0.8rem', md: '0.85rem' },
                                                                                letterSpacing: '0.5px',
                                                                                textTransform: 'uppercase'
                                                                            }}
                                                                        >
                                                                            이수 학점
                                                                        </Typography>
                                                                        <Typography
                                                                            variant="h3"
                                                                            fontWeight={900}
                                                                            sx={{
                                                                                color: '#22c55e',
                                                                                fontSize: { xs: '1.6rem', md: '2rem' },
                                                                                mb: { xs: 0.5, md: 1 },
                                                                                letterSpacing: '-0.02em',
                                                                                lineHeight: 1
                                                                            }}
                                                                        >
                                                                            {userInfo.credits}
                                                                        </Typography>
                                                                    </Paper>
                                                                </motion.div>
                                                            </Grid>

                                                            <Grid item xs={6} md={3}>
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 20 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: 0.3 }}
                                                                >
                                                                    <Paper elevation={0} sx={{
                                                                        textAlign: 'center',
                                                                        p: { xs: 2.5, md: 3 },
                                                                        borderRadius: 4,
                                                                        background: 'rgba(168, 85, 247, 0.06)',
                                                                        border: '1px solid rgba(168, 85, 247, 0.12)',
                                                                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                                                        cursor: 'pointer',
                                                                        '&:hover': {
                                                                            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.06) 0%, rgba(255, 255, 255, 0.8) 100%)',
                                                                            transform: 'translateY(-4px)',
                                                                            boxShadow: '0 12px 28px rgba(168, 85, 247, 0.2), 0 4px 12px rgba(168, 85, 247, 0.15)'
                                                                        }
                                                                    }}>
                                                                        <Typography
                                                                            variant="body2"
                                                                            color="text.secondary"
                                                                            sx={{
                                                                                mb: { xs: 1.5, md: 2 },
                                                                                fontWeight: 700,
                                                                                fontSize: { xs: '0.8rem', md: '0.85rem' },
                                                                                letterSpacing: '0.5px',
                                                                                textTransform: 'uppercase'
                                                                            }}
                                                                        >
                                                                            잔여 학기
                                                                        </Typography>
                                                                        <Typography
                                                                            variant="h3"
                                                                            fontWeight={900}
                                                                            sx={{
                                                                                color: '#a855f7',
                                                                                fontSize: { xs: '1.6rem', md: '2rem' },
                                                                                mb: { xs: 0.5, md: 1 },
                                                                                letterSpacing: '-0.02em',
                                                                                lineHeight: 1
                                                                            }}
                                                                        >
                                                                            {userInfo.remainingSemesters || '-'}
                                                                        </Typography>
                                                                    </Paper>
                                                                </motion.div>
                                                            </Grid>

                                                            <Grid item xs={6} md={3}>
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 20 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: 0.4 }}
                                                                >
                                                                    <Paper elevation={0} sx={{
                                                                        textAlign: 'center',
                                                                        p: { xs: 2.5, md: 3 },
                                                                        borderRadius: 4,
                                                                        background: 'rgba(245, 158, 11, 0.06)',
                                                                        border: '1px solid rgba(245, 158, 11, 0.12)',
                                                                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                                                        cursor: 'pointer',
                                                                        '&:hover': {
                                                                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.06) 0%, rgba(255, 255, 255, 0.8) 100%)',
                                                                            transform: 'translateY(-4px)',
                                                                            boxShadow: '0 12px 28px rgba(245, 158, 11, 0.2), 0 4px 12px rgba(245, 158, 11, 0.15)'
                                                                        }
                                                                    }}>
                                                                        <Typography
                                                                            variant="body2"
                                                                            color="text.secondary"
                                                                            sx={{
                                                                                mb: { xs: 1.5, md: 2 },
                                                                                fontWeight: 700,
                                                                                fontSize: { xs: '0.8rem', md: '0.85rem' },
                                                                                letterSpacing: '0.5px',
                                                                                textTransform: 'uppercase'
                                                                            }}
                                                                        >
                                                                            최대 학점
                                                                        </Typography>
                                                                        <Typography
                                                                            variant="h3"
                                                                            fontWeight={900}
                                                                            sx={{
                                                                                color: '#f59e0b',
                                                                                fontSize: { xs: '1.6rem', md: '2rem' },
                                                                                mb: { xs: 0.5, md: 1 },
                                                                                letterSpacing: '-0.02em',
                                                                                lineHeight: 1
                                                                            }}
                                                                        >
                                                                            {userInfo.maxCreditsPerTerm}
                                                                        </Typography>
                                                                    </Paper>
                                                                </motion.div>
                                                            </Grid>

                                                            {/* 두 번째 행 - 커리어 및 학과 정보 */}
                                                            <Grid item xs={12} md={6}>
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 20 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: 0.5 }}
                                                                >
                                                                    <Paper elevation={0} sx={{
                                                                        p: { xs: 3, md: 4 },
                                                                        borderRadius: 4,
                                                                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.04) 0%, rgba(99, 102, 241, 0.04) 100%)',
                                                                        border: '1px solid rgba(59, 130, 246, 0.08)',
                                                                        height: '100%',
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        justifyContent: 'center'
                                                                    }}>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                                            <WorkIcon sx={{ color: '#3b82f6', fontSize: 24, mr: 2 }} />
                                                                            <Typography
                                                                                variant="h6"
                                                                                fontWeight={800}
                                                                                color="#3b82f6"
                                                                                sx={{
                                                                                    fontSize: { xs: '1rem', md: '1.1rem' },
                                                                                    letterSpacing: '-0.01em'
                                                                                }}
                                                                            >
                                                                                💼 희망 직군
                                                                            </Typography>
                                                                        </Box>
                                                                        <Typography
                                                                            variant="h5"
                                                                            fontWeight={700}
                                                                            color="#1e293b"
                                                                            sx={{
                                                                                fontSize: { xs: '1.2rem', md: '1.4rem' },
                                                                                mb: 1
                                                                            }}
                                                                        >
                                                                            {userInfo.career}
                                                                        </Typography>
                                                                        <Typography
                                                                            variant="body2"
                                                                            color="text.secondary"
                                                                            sx={{ fontWeight: 600 }}
                                                                        >
                                                                            목표 달성을 위한 학습 경로를 제공합니다
                                                                        </Typography>
                                                                    </Paper>
                                                                </motion.div>
                                                            </Grid>

                                                            <Grid item xs={12} md={6}>
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 20 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: 0.6 }}
                                                                >
                                                                    <Paper elevation={0} sx={{
                                                                        p: { xs: 3, md: 4 },
                                                                        borderRadius: 4,
                                                                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.04) 0%, rgba(34, 197, 94, 0.04) 100%)',
                                                                        border: '1px solid rgba(16, 185, 129, 0.08)',
                                                                        height: '100%',
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        justifyContent: 'center'
                                                                    }}>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                                            <SchoolIcon sx={{ color: '#10b981', fontSize: 24, mr: 2 }} />
                                                                            <Typography
                                                                                variant="h6"
                                                                                fontWeight={800}
                                                                                color="#10b981"
                                                                                sx={{
                                                                                    fontSize: { xs: '1rem', md: '1.1rem' },
                                                                                    letterSpacing: '-0.01em'
                                                                                }}
                                                                            >
                                                                                🎓 전공 분야
                                                                            </Typography>
                                                                        </Box>
                                                                        <Typography
                                                                            variant="h5"
                                                                            fontWeight={700}
                                                                            color="#1e293b"
                                                                            sx={{
                                                                                fontSize: { xs: '1.2rem', md: '1.4rem' },
                                                                                mb: 1
                                                                            }}
                                                                        >
                                                                            {userInfo.department}
                                                                        </Typography>
                                                                        <Typography
                                                                            variant="body2"
                                                                            color="text.secondary"
                                                                            sx={{ fontWeight: 600 }}
                                                                        >
                                                                            전공 맞춤형 커리큘럼을 추천합니다
                                                                        </Typography>
                                                                    </Paper>
                                                                </motion.div>
                                                            </Grid>

                                                            {/* Enhanced interests section */}
                                                            {userInfo.interests.length > 0 && (
                                                                <Grid item xs={12}>
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: 20 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        transition={{ delay: 0.7 }}
                                                                    >
                                                                        <Paper elevation={0} sx={{
                                                                            p: { xs: 3, md: 4 },
                                                                            borderRadius: 4,
                                                                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.04) 0%, rgba(168, 85, 247, 0.04) 100%)',
                                                                            border: '1px solid rgba(99, 102, 241, 0.08)',
                                                                            mt: { xs: 2, md: 3 }
                                                                        }}>
                                                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                                                                <Typography
                                                                                    variant="h6"
                                                                                    fontWeight={800}
                                                                                    color="#4f46e5"
                                                                                    sx={{
                                                                                        fontSize: { xs: '1.1rem', md: '1.25rem' },
                                                                                        letterSpacing: '-0.01em'
                                                                                    }}
                                                                                >
                                                                                    관심 분야
                                                                                </Typography>
                                                                                <Box sx={{
                                                                                    width: 3,
                                                                                    height: 3,
                                                                                    borderRadius: '50%',
                                                                                    background: '#4f46e5',
                                                                                    mx: 2
                                                                                }} />
                                                                                <Typography
                                                                                    variant="caption"
                                                                                    color="text.secondary"
                                                                                    sx={{ fontWeight: 600 }}
                                                                                >
                                                                                    {userInfo.interests.length}개 선택됨
                                                                                </Typography>
                                                                            </Box>
                                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1.5, md: 2 } }}>
                                                                                {userInfo.interests.map((interest: string, index: number) => (
                                                                                    <motion.div
                                                                                        key={index}
                                                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                                        transition={{ delay: 0.8 + index * 0.1 }}
                                                                                    >
                                                                                        <Chip
                                                                                            label={interest}
                                                                                            sx={{
                                                                                                height: { xs: 38, md: 42 },
                                                                                                px: { xs: 1.5, md: 2 },
                                                                                                fontSize: { xs: '0.9rem', md: '1rem' },
                                                                                                fontWeight: 700,
                                                                                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                                                                                color: 'white',
                                                                                                border: 'none',
                                                                                                boxShadow: '0 6px 20px rgba(99, 102, 241, 0.25), 0 2px 8px rgba(99, 102, 241, 0.15)',
                                                                                                '&:hover': {
                                                                                                    boxShadow: '0 8px 25px rgba(99, 102, 241, 0.35), 0 4px 12px rgba(99, 102, 241, 0.2)',
                                                                                                    transform: 'translateY(-2px) scale(1.02)'
                                                                                                },
                                                                                                transition: 'all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                                                                                letterSpacing: '-0.005em'
                                                                                            }}
                                                                                        />
                                                                                    </motion.div>
                                                                                ))}
                                                                            </Box>
                                                                        </Paper>
                                                                    </motion.div>
                                                                </Grid>
                                                            )}
                                                        </Grid>
                                                    </Box>
                                                </Paper>
                                            </motion.div>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </motion.div>
                        )}

                        {/* Enhanced AI 추천 커리큘럼 섹션 */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <Box sx={{ width: '100%', mb: 4 }}>
                                <Grid container spacing={3} sx={{ mb: 4, mt: 2 }} justifyContent="center" alignItems="stretch">
                                    <Grid item xs={12}>
                                        <motion.div variants={itemVariants}>
                                            <Paper elevation={0} sx={{
                                                borderRadius: 6,
                                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
                                                backdropFilter: 'blur(24px)',
                                                border: '1px solid rgba(226, 232, 240, 0.4)',
                                                boxShadow: `
                                            0 16px 40px rgba(0, 0, 0, 0.06),
                                            0 4px 16px rgba(0, 0, 0, 0.04),
                                            0 0 0 1px rgba(255, 255, 255, 0.1)
                                        `,
                                                width: '100%',
                                                overflow: 'hidden',
                                                position: 'relative'
                                            }}>
                                                {/* Enhanced background decoration */}
                                                <Box sx={{
                                                    position: 'absolute',
                                                    top: -50,
                                                    left: -50,
                                                    width: '300px',
                                                    height: '300px',
                                                    background: 'radial-gradient(circle, rgba(14, 165, 233, 0.06) 0%, transparent 60%)',
                                                    borderRadius: '50%',
                                                    pointerEvents: 'none'
                                                }} />

                                                <Box sx={{ p: { xs: 4, md: 5 }, position: 'relative', zIndex: 1 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 4, md: 5 }, justifyContent: 'center' }}>
                                                        <Typography
                                                            variant="h4"
                                                            fontWeight={800}
                                                            fontFamily="Pretendard, sans-serif"
                                                            sx={{
                                                                background: 'linear-gradient(135deg, #1e293b 0%, #0ea5e9 100%)',
                                                                backgroundClip: 'text',
                                                                WebkitBackgroundClip: 'text',
                                                                WebkitTextFillColor: 'transparent',
                                                                textShadow: '0 2px 16px rgba(30, 41, 59, 0.08)',
                                                                fontSize: { xs: '1.6rem', md: '2rem' },
                                                                letterSpacing: '-0.02em',
                                                                textAlign: 'center',
                                                                fontWeight: 900
                                                            }}
                                                        >
                                                            AI 추천 커리큘럼
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{
                                                        display: 'grid',
                                                        gridTemplateColumns: {
                                                            xs: 'repeat(1, 1fr)',
                                                            sm: 'repeat(2, 1fr)',
                                                            md: 'repeat(3, 1fr)',
                                                            lg: 'repeat(5, 1fr)'
                                                        },
                                                        gap: { xs: 3, md: 3.5 },
                                                        width: '100%'
                                                    }}>
                                                        {randomCurriculums.map((curri, index) => (
                                                            <motion.div
                                                                key={curri}
                                                                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                transition={{
                                                                    delay: index * 0.12,
                                                                    duration: 0.6,
                                                                    ease: [0.25, 0.46, 0.45, 0.94]
                                                                }}
                                                                variants={cardHoverVariants}
                                                                whileHover="hover"
                                                                whileTap="tap"
                                                            >
                                                                <Paper elevation={0}
                                                                    sx={{
                                                                        minHeight: { xs: 180, md: 200 },
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        background: 'rgba(255, 255, 255, 0.98)',
                                                                        borderRadius: 5,
                                                                        boxShadow: `
                                                                        0 6px 24px rgba(30, 80, 180, 0.08),
                                                                        0 4px 16px rgba(0, 181, 255, 0.06),
                                                                        0 0 0 1px rgba(255, 255, 255, 0.9)
                                                                    `,
                                                                        transition: 'all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                                                        cursor: 'pointer',
                                                                        p: { xs: 3, md: 3.5 },
                                                                        backdropFilter: 'blur(12px)',
                                                                        border: '1px solid rgba(255, 255, 255, 0.7)',
                                                                        height: '100%',
                                                                        '&:hover': {
                                                                            boxShadow: `
                                                                            0 16px 40px rgba(0, 181, 255, 0.15),
                                                                            0 8px 24px rgba(30, 80, 180, 0.10),
                                                                            0 0 0 2px rgba(0, 181, 255, 0.12)
                                                                        `,
                                                                            background: 'rgba(255, 255, 255, 1.0)'
                                                                        },
                                                                        '&:focus-visible': {
                                                                            outline: '2px solid #0ea5e9',
                                                                            outlineOffset: '2px'
                                                                        }
                                                                    }}
                                                                    onClick={() => handleCurriculumCardClick(curri)}
                                                                    role="button"
                                                                    aria-label={`AI 추천 커리큘럼: ${curri} 선택하기`}
                                                                    tabIndex={0}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                                            e.preventDefault();
                                                                            handleCurriculumCardClick(curri);
                                                                        }
                                                                    }}
                                                                >
                                                                    <motion.div
                                                                        variants={floatingVariants}
                                                                        animate="animate"
                                                                        style={{ marginBottom: '1.2rem' }}
                                                                    >
                                                                        <Box sx={{
                                                                            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(59, 130, 246, 0.05) 100%)',
                                                                            borderRadius: '50%',
                                                                            p: { xs: 2, md: 2.5 },
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            border: '2px solid rgba(14, 165, 233, 0.1)',
                                                                            boxShadow: '0 8px 24px rgba(14, 165, 233, 0.15)'
                                                                        }}>
                                                                            {React.isValidElement(curriculumIcons[curri])
                                                                                ? React.cloneElement(curriculumIcons[curri], {})
                                                                                : <FaBookOpen size={28} color="#0ea5e9" aria-hidden="true" />
                                                                            }
                                                                        </Box>
                                                                    </motion.div>
                                                                    <Typography
                                                                        variant="subtitle1"
                                                                        fontWeight={800}
                                                                        color="#1e293b"
                                                                        sx={{
                                                                            fontSize: { xs: '1rem', md: '1.1rem' },
                                                                            lineHeight: 1.25,
                                                                            wordBreak: 'keep-all',
                                                                            textAlign: 'center',
                                                                            textShadow: '0 2px 8px rgba(30, 41, 59, 0.08)',
                                                                            px: { xs: 1, md: 1.5 },
                                                                            letterSpacing: '-0.01em',
                                                                            fontWeight: 800
                                                                        }}
                                                                        fontFamily="Pretendard, sans-serif"
                                                                    >
                                                                        {curri}
                                                                    </Typography>
                                                                </Paper>
                                                            </motion.div>
                                                        ))}
                                                    </Box>
                                                </Box>
                                            </Paper>
                                        </motion.div>
                                    </Grid>
                                </Grid>
                            </Box>
                        </motion.div>
                    </Box>
                </motion.div>
            </AnimatePresence>

            {/* 마스코트 배경 이미지 */}
            <Box sx={{
                position: 'absolute',
                bottom: { xs: 40, md: 80 },
                right: { xs: 16, md: 80 },
                zIndex: 0,
                opacity: 0.08,
                pointerEvents: 'none',
            }}>
                <img
                    src={mascotBg}
                    alt="TUK NAVI 마스코트"
                    style={{
                        width: 320,
                        maxWidth: '60vw',
                        height: 'auto'
                    }}
                    role="img"
                    aria-label="TUK NAVI 학습 도우미 캐릭터"
                />
            </Box>

            {/* Empty State 처리 */}
            {randomCurriculums.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <Box sx={{ width: '100%', textAlign: 'center', py: 6 }}>
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                            추천 커리큘럼이 없습니다
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            관심 분야를 설정하면 맞춤형 커리큘럼을 추천해드려요
                        </Typography>
                    </Box>
                </motion.div>
            )}

            {/* 온보딩 편집 모달 */}
            {isOnboardingModalOpen && (
                <InterestSelection onClose={() => setIsOnboardingModalOpen(false)} />
            )}
        </Box>
    );
};

export default Dashboard;
