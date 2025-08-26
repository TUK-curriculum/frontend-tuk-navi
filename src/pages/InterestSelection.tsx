/** @jsxImportSource @emotion/react */
import React, {
    useState,
    useEffect,
    useCallback,
    useRef,
    useMemo,
    memo,
} from 'react';
import {
    Box,
    Paper,
    Typography,
    Stepper,
    Step,
    StepLabel,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Autocomplete,
    Alert,
    LinearProgress,
    Chip,
    useTheme,
    useMediaQuery,
    IconButton,
    Fade,
} from '@mui/material';
import {
    Close as CloseIcon,
    NavigateNext as NextIcon,
    NavigateBefore as BackIcon,
    CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { css } from '@emotion/react';
import { m, LazyMotion, domAnimation, AnimatePresence, useMotionValue } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/SeparatedDataContext';

// 상수들을 컴포넌트 외부로 이동하여 리렌더링 시 재생성 방지
const STORAGE_KEY = 'TUK_ONBOARDING_V2';
const STEPS = ['기본정보', '커리어 목표', '학업 계획', '시간표 제약', '완료'];

const DEPARTMENTS = [
    '컴퓨터공학과',
    '소프트웨어공학과',
    '인공지능학과',
    '전자공학과',
    '기계공학과',
    '산업경영공학과',
    '기타',
] as const;

const YEARS = ['1학년', '2학년', '3학년', '4학년', '5학년 이상'] as const;

const CAREERS = [
    '프론트엔드 개발자',
    '백엔드 개발자',
    '풀스택 개발자',
    '데이터 엔지니어',
    'AI/ML 엔지니어',
    '모바일 앱 개발자',
    'DevOps 엔지니어',
    '게임 개발자',
    '블록체인 개발자',
] as const;

const INDUSTRIES = [
    '네이버',
    '카카오',
    '라인',
    '쿠팡',
    '배달의민족',
    '토스',
    '핀테크',
    '게임사',
    '스타트업',
    '대기업',
    '외국계기업',
] as const;

// 스타일 객체들을 컴포넌트 외부로 이동하여 재생성 방지
const backdropCss = css`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1300;
`;

const paperCss = css`
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-height: 90vh;
  overflow-y: auto;
`;

const CHIP_SX = {
    minWidth: 78,
    height: 40,
    fontWeight: 600,
    fontSize: 14,
    borderRadius: 2,
    px: 2,
    py: 1,
    boxShadow: 'none',
    border: '1.5px solid',
    borderColor: 'grey.300',
    bgcolor: 'background.paper',
    color: 'text.primary',
    transition: 'all 0.2s',
    '&.MuiChip-clickable': { cursor: 'pointer' },
    '&.MuiChip-filledPrimary': { bgcolor: 'primary.main', color: 'primary.contrastText', borderColor: 'primary.main', boxShadow: 2 },
    '&.MuiChip-outlinedPrimary': { bgcolor: 'background.paper', color: 'primary.main', borderColor: 'primary.main' },
    '&:hover': { boxShadow: 3, borderColor: 'primary.light' },
};

const days = ['월', '화', '수', '목', '금'];
const periods = Array.from({ length: 10 }, (_, i) => `${i + 1}교시`);

interface DayPeriodSelectorProps {
    avoidSlots: string[];
    onChange: (slots: string[]) => void;
}
const DayPeriodSelector = memo(function DayPeriodSelector({
    avoidSlots,
    onChange,
}: DayPeriodSelectorProps) {
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
    const chipRef = useRef<HTMLDivElement>(null);

    const handleDayClick = useCallback((day: string) => {
        if (selectedDay === day) {
            setSelectedDay(null);
            setSelectedPeriods([]);
            onChange(avoidSlots.filter((slot: string) => !slot.startsWith(day)));
            return;
        }
        const existing = avoidSlots
            .filter((s: string) => s.startsWith(day))
            .map((s: string) => s.replace(`${day} `, ''));
        setSelectedDay(day);
        setSelectedPeriods(existing);
    }, [selectedDay, avoidSlots, onChange]);

    // 전체 선택
    const handleSelectAll = useCallback(() => {
        if (!selectedDay) return;
        const allPeriods = periods;
        setSelectedPeriods(allPeriods);
        const filtered = avoidSlots.filter((s: string) => !s.startsWith(selectedDay));
        onChange([...filtered, ...allPeriods.map((p) => `${selectedDay} ${p}`)]);
    }, [selectedDay, avoidSlots, onChange]);

    // 초기화
    const handleClear = useCallback(() => {
        if (!selectedDay) return;
        setSelectedPeriods([]);
        onChange(avoidSlots.filter((s: string) => !s.startsWith(selectedDay)));
    }, [selectedDay, avoidSlots, onChange]);

    const handlePeriodToggle = useCallback((period: string) => {
        if (!selectedDay) return;
        let next: string[];
        if (selectedPeriods.includes(period)) {
            next = selectedPeriods.filter((p) => p !== period);
        } else {
            next = selectedPeriods.concat(period);
        }
        setSelectedPeriods(next);
        const filtered = avoidSlots.filter((s: string) => !s.startsWith(selectedDay));
        onChange([...filtered, ...next.map((p) => `${selectedDay} ${p}`)]);
    }, [selectedDay, selectedPeriods, avoidSlots, onChange]);

    useEffect(() => {
        if (selectedDay) {
            chipRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [selectedDay]);

    const summary = useMemo(() => {
        return days
            .map((day) => {
                const slots = avoidSlots
                    .filter((s: string) => s.startsWith(day))
                    .map((s: string) => s.replace(`${day} `, ''));
                if (!slots.length) return null;
                const sorted = slots.sort((a: string, b: string) => parseInt(a) - parseInt(b));
                return `${day} ${sorted.join(',')}`;
            })
            .filter(Boolean)
            .join(' / ');
    }, [avoidSlots]);

    return (
        <Box sx={{ bgcolor: 'grey.50', borderRadius: 2, p: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>피해야 할 요일·시간대</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                제약 조건이 많아질수록 AI 시간표 추천이 어려워질 수 있습니다.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
                {days.map((day) => (
                    <Chip
                        key={day}
                        label={day}
                        clickable
                        color={selectedDay === day ? 'primary' : 'default'}
                        variant={selectedDay === day ? 'filled' : 'outlined'}
                        sx={CHIP_SX}
                        onClick={() => handleDayClick(day)}
                        aria-pressed={selectedDay === day}
                        role="button"
                    />
                ))}
            </Box>
            {/* 전체/초기화 버튼 */}
            {selectedDay && (
                <Box>
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(4,1fr)' },
                        gap: 1.5,
                        mb: 2,
                    }} ref={chipRef}>
                        {periods.map((p) => (
                            <Chip
                                key={p}
                                label={p}
                                clickable
                                color={selectedPeriods.includes(p) ? 'primary' : 'default'}
                                variant={selectedPeriods.includes(p) ? 'filled' : 'outlined'}
                                sx={CHIP_SX}
                                onClick={() => handlePeriodToggle(p)}
                                aria-pressed={selectedPeriods.includes(p)}
                                role="button"
                            />
                        ))}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 0 }}>
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={handleSelectAll}
                            sx={{ minWidth: 48, px: 1.5, py: 0.5, fontSize: 13, borderRadius: 2, height: 32 }}
                        >
                            전체 선택
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            onClick={handleClear}
                            sx={{ minWidth: 48, px: 1.5, py: 0.5, fontSize: 13, borderRadius: 2, height: 32, borderColor: 'orange.main', color: 'orange.main' }}
                        >
                            초기화
                        </Button>
                    </Box>
                </Box>
            )}
            <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1, minHeight: 40 }}>
                <Typography variant="body2" color="primary.main">
                    {summary || '선택된 요일·시간대가 없습니다.'}
                </Typography>
            </Box>
        </Box>
    );
});

// UserInfo interface 복원
interface UserInfo {
    name: string;
    studentId: string;
    email: string;
    department: string;
    year: string;
    completedCredits: number | '';
    career: string;
    industry: string;
    remainingSemesters: number | '';
    maxCreditsPerTerm: number | '';
    minPeriod: number | '';
    maxPeriod: number | '';
    avoidSlots: string[];
    calendarSync: boolean;
    interests: string[];
}

interface InterestSelectionProps {
    open?: boolean;
    onClose?: () => void;
    onComplete?: (userInfo: UserInfo) => void;
}

const getInitialInfo = (): UserInfo => ({
    name: '',
    studentId: '',
    email: '',
    department: '',
    year: '',
    completedCredits: '',
    career: '',
    industry: '',
    remainingSemesters: '',
    maxCreditsPerTerm: '',
    minPeriod: '',
    maxPeriod: '',
    avoidSlots: [],
    calendarSync: false,
    interests: [],
});

export default function InterestSelection({
    open = true,
    onClose,
    onComplete,
}: InterestSelectionProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const [step, setStep] = useState(0);
    const [info, setInfo] = useState<UserInfo>(getInitialInfo);
    const [errors, setErrors] = useState<Partial<Record<keyof UserInfo, string>>>({});
    const direction = useRef(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isProfileLoaded, setIsProfileLoaded] = useState(false);
    const { user } = useAuth();
    const { userData, updateOnboarding } = useData();

    // 자주 계산되는 값들을 메모화
    const memoizedDepartments = useMemo(() => DEPARTMENTS, []);
    const memoizedYears = useMemo(() => YEARS, []);
    const memoizedCareers = useMemo(() => CAREERS, []);
    const memoizedIndustries = useMemo(() => INDUSTRIES, []);

    useEffect(() => {
        if (open && user?.email) {
            // 초기화하지 않고 에러만 클리어
            setErrors({});
        }
    }, [open, user?.email]);

    useEffect(() => {
        if (userData?.onboarding) {
            setInfo({ ...getInitialInfo(), ...userData.onboarding });
        }
    }, [userData?.onboarding]);

    // 회원가입 시 입력한 기본 정보 자동 설정 (백엔드에서 조회)
    useEffect(() => {
        const loadUserProfile = async () => {
            if (!user?.email || isProfileLoaded) return;

            try {
                // 백엔드에서 실제 프로필 정보 조회
                const { apiService } = await import('../services/ApiService');
                const profile = await apiService.getProfile();

                console.log('[InterestSelection] Profile loaded from backend:', profile);
                console.log('[InterestSelection] Current user data:', user);
                console.log('[InterestSelection] User profile details:', user?.profile);

                // Register.tsx에서 사용하는 grade 값은 "4학년" 형태이므로 숫자를 문자열로 변환
                const gradeText = profile.grade ? `${profile.grade}학년` : '';

                const mappedData = {
                    name: profile.name || user.name || '',
                    email: profile.email || user.email || '',
                    studentId: profile.studentId || (user.profile as any)?.studentId || '',
                    department: profile.major || (user.profile as any)?.major || '',
                    year: gradeText || ((user.profile as any)?.grade ? `${(user.profile as any).grade}학년` : ''),
                };

                console.log('[InterestSelection] Backend profile studentId:', profile.studentId);
                console.log('[InterestSelection] Backend profile grade:', profile.grade);
                console.log('[InterestSelection] User profile studentId:', (user.profile as any)?.studentId);
                console.log('[InterestSelection] User profile grade:', (user.profile as any)?.grade);
                console.log('[InterestSelection] Final mapped data:', mappedData);
                console.log('[InterestSelection] Previous info state:', info);

                setInfo(prev => {
                    const newInfo = {
                        ...prev,
                        ...mappedData
                    };
                    console.log('[InterestSelection] Updated info state:', newInfo);
                    return newInfo;
                });

                setIsProfileLoaded(true);
            } catch (error) {
                console.warn('[InterestSelection] Failed to load profile from backend, using user data:', error);

                // 백엔드 실패 시 AuthContext의 user 정보 또는 테스트 데이터 사용
                const fallbackData = {
                    name: user.name || '박진한',
                    email: user.email || 'test@example.com',
                    studentId: (user.profile as any)?.studentId || '2021123456',
                    department: (user.profile as any)?.major || '컴퓨터공학과',
                    year: (user.profile as any)?.grade ? `${(user.profile as any).grade}학년` : '3학년',
                };

                console.log('[InterestSelection] Using fallback data:', fallbackData);

                setInfo(prev => ({
                    ...prev,
                    ...fallbackData
                }));

                setIsProfileLoaded(true);
            }
        };

        loadUserProfile();
    }, [user, isProfileLoaded]);

    const handleChange = useCallback(<K extends keyof UserInfo>(key: K, value: UserInfo[K]) => {
        setInfo((prev) => {
            const next = { ...prev, [key]: value };
            // interests만 Onboarding에 반영
            if (key === 'interests') {
                updateOnboarding({ interests: value as any });
            }
            return next;
        });
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    }, [updateOnboarding]); // errors 의존성 제거로 리렌더링 최적화

    // 폼 검증 로직을 메모화
    const validateStep = useCallback((i: number) => {
        const newErr: Partial<Record<keyof UserInfo, string>> = {};
        if (i === 0) {
            // 이름, 학번, 이메일, 학과, 학년은 회원가입 시 이미 검증되었으므로 검증 제외
            if (typeof info.completedCredits === 'number' && (info.completedCredits < 0 || info.completedCredits > 200))
                newErr.completedCredits = '0-200 사이여야 합니다.';
        }
        if (i === 1 && !info.career.trim()) newErr.career = '희망 직군을 선택해주세요.';
        if (i === 2) {
            if (typeof info.remainingSemesters === 'number' && (info.remainingSemesters < 1 || info.remainingSemesters > 10))
                newErr.remainingSemesters = '1-10 사이여야 합니다.';
            if (typeof info.maxCreditsPerTerm === 'number' && (info.maxCreditsPerTerm < 1 || info.maxCreditsPerTerm > 30))
                newErr.maxCreditsPerTerm = '1-30 사이여야 합니다.';
        }
        if (i === 3) {
            if (typeof info.minPeriod === 'number' && (info.minPeriod < 1 || info.minPeriod > 10))
                newErr.minPeriod = '1-10 사이여야 합니다.';
            if (typeof info.maxPeriod === 'number' && (info.maxPeriod < (typeof info.minPeriod === 'number' ? info.minPeriod : 1) || info.maxPeriod > 10))
                newErr.maxPeriod = '최소 교시보다 크거나 같아야 하며 10 이하입니다.';
        }
        setErrors(newErr);
        return !Object.keys(newErr).length;
    }, [info]);

    const handleNext = useCallback(async () => {
        if (!validateStep(step)) return;
        setIsLoading(true);
        direction.current = 1;
        try {
            if (step === STEPS.length - 1) {
                // 백엔드에 온보딩 완료 상태 저장
                try {
                    const { apiService } = await import('../services/ApiService');
                    await apiService.completeOnboarding(info);
                    console.log('[InterestSelection] Onboarding completed in backend');
                } catch (error) {
                    console.warn('[InterestSelection] Failed to complete onboarding in backend:', error);
                }

                // 로컬 상태도 업데이트 (백업용)
                updateOnboarding({ isCompleted: true, interests: info.interests });
                onComplete?.(info);
                onClose?.();
            } else {
                setTimeout(() => setStep((p) => p + 1), 200);
            }
        } finally {
            setIsLoading(false);
        }
    }, [step, validateStep, info, onClose, onComplete, updateOnboarding]);

    const handleBack = useCallback(() => {
        direction.current = -1;
        setStep((p) => Math.max(p - 1, 0));
    }, []);

    const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);

    const xMotion = useMotionValue(0);

    if (!open) return null;
    return (
        <Box css={backdropCss}>
            <Paper
                css={paperCss}
                sx={{
                    width: isMobile ? '95%' : isTablet ? '80%' : 520,
                    bgcolor: 'background.paper',
                }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="onboarding-title"
            >
                <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'flex', justifyContent: 'space-between' }}>
                    <Typography id="onboarding-title" variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        내 정보 입력
                    </Typography>
                    <IconButton color="inherit" onClick={onClose} aria-label="닫기" size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Box sx={{ px: 3, pt: 2 }}>
                    <LinearProgress variant="determinate" value={progress} sx={{
                        height: 6, borderRadius: 3, bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': { borderRadius: 3, background: 'linear-gradient(45deg,#2196F3 30%,#21CBF3 90%)' },
                    }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                        {step + 1} / {STEPS.length} 단계
                    </Typography>
                </Box>

                <Box sx={{ p: 3 }}>
                    <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }}>
                        {STEPS.map((label, i) => (
                            <Step key={label}>
                                <StepLabel StepIconComponent={({ active, completed }) => (
                                    <Box sx={{
                                        width: 24, height: 24, borderRadius: '50%',
                                        bgcolor: completed ? 'success.main' : active ? 'primary.main' : 'grey.300',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontSize: 12, fontWeight: 'bold',
                                    }}>
                                        {completed ? <CheckIcon sx={{ fontSize: 16 }} /> : i + 1}
                                    </Box>
                                )}>
                                    {label}
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    <LazyMotion features={domAnimation}>
                        <AnimatePresence mode="wait" custom={direction.current}>
                            <m.div
                                key={step}
                                custom={direction.current}
                                initial={{ x: direction.current > 0 ? 50 : -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: direction.current < 0 ? 50 : -50, opacity: 0 }}
                                transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                            >
                                <Box sx={{ minHeight: 300 }}>
                                    {step === 0 && (
                                        <Box sx={{ display: 'grid', gap: 2.5 }}>

                                            <TextField
                                                label="이름"
                                                fullWidth
                                                value={info.name}
                                                onChange={(e) => handleChange('name', e.target.value)}
                                                error={!!errors.name}
                                                helperText={errors.name || '회원가입 시 입력한 정보입니다'}
                                                disabled={true}
                                                sx={{
                                                    mb: 2,
                                                    '& .MuiInputBase-input.Mui-disabled': {
                                                        WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                                                    }
                                                }}
                                            />
                                            <TextField
                                                label="학번"
                                                fullWidth
                                                value={info.studentId}
                                                onChange={(e) => handleChange('studentId', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                error={!!errors.studentId}
                                                helperText={errors.studentId || '회원가입 시 입력한 정보입니다'}
                                                disabled={true}
                                                sx={{
                                                    mb: 2,
                                                    '& .MuiInputBase-input.Mui-disabled': {
                                                        WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                                                    }
                                                }}
                                            />
                                            <TextField
                                                label="이메일"
                                                fullWidth
                                                type="email"
                                                value={info.email}
                                                onChange={(e) => handleChange('email', e.target.value)}
                                                error={!!errors.email}
                                                helperText={errors.email || '회원가입 시 입력한 정보입니다'}
                                                disabled={true}
                                                sx={{
                                                    mb: 2,
                                                    '& .MuiInputBase-input.Mui-disabled': {
                                                        WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                                                    }
                                                }}
                                            />
                                            <FormControl fullWidth error={!!errors.department}>
                                                <InputLabel>학과</InputLabel>
                                                <Select
                                                    value={info.department}
                                                    label="학과"
                                                    onChange={(e) => handleChange('department', e.target.value)}
                                                    disabled={true}
                                                    sx={{
                                                        '& .MuiInputBase-input.Mui-disabled': {
                                                            WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                                                        }
                                                    }}
                                                >
                                                    {memoizedDepartments.map((dept) => (
                                                        <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                                                    ))}
                                                </Select>
                                                <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, ml: 2 }}>
                                                    회원가입 시 입력한 정보입니다
                                                </Typography>
                                            </FormControl>
                                            <FormControl fullWidth error={!!errors.year}>
                                                <InputLabel>학년</InputLabel>
                                                <Select
                                                    value={info.year}
                                                    label="학년"
                                                    onChange={(e) => handleChange('year', e.target.value)}
                                                    disabled={true}
                                                    sx={{
                                                        '& .MuiInputBase-input.Mui-disabled': {
                                                            WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                                                        }
                                                    }}
                                                >
                                                    {memoizedYears.map((yr) => (
                                                        <MenuItem key={yr} value={yr}>{yr}</MenuItem>
                                                    ))}
                                                </Select>
                                                <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, ml: 2 }}>
                                                    회원가입 시 입력한 정보입니다
                                                </Typography>
                                            </FormControl>
                                            <TextField
                                                label="현재 취득 학점"
                                                fullWidth
                                                type="text"
                                                inputMode="numeric"
                                                value={info.completedCredits === '' ? '' : String(info.completedCredits)}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    if (/^\d*$/.test(v)) {
                                                        handleChange('completedCredits', v === '' ? '' : Number(v));
                                                    }
                                                }}
                                                error={!!errors.completedCredits}
                                                helperText={errors.completedCredits}
                                                inputProps={{ min: 0, max: 200 }}
                                            />
                                        </Box>
                                    )}

                                    {step === 1 && (
                                        <Box sx={{ display: 'grid', gap: 2.5 }}>
                                            <Autocomplete
                                                options={memoizedCareers}
                                                freeSolo
                                                value={info.career}
                                                onChange={(_, v) => handleChange('career', v || '')}
                                                onBlur={() => {
                                                    if (!info.career.trim())
                                                        setErrors((p) => ({ ...p, career: '희망 직군을 선택해주세요.' }));
                                                }}
                                                PopperProps={{
                                                    placement: 'bottom-start',
                                                    modifiers: [
                                                        {
                                                            name: 'flip',
                                                            enabled: true,
                                                            options: {
                                                                altBoundary: true,
                                                                rootBoundary: 'document',
                                                                padding: 8
                                                            }
                                                        }
                                                    ]
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="희망 직군"
                                                        fullWidth
                                                        error={!!errors.career}
                                                        helperText={errors.career || '목표하는 직업을 선택하거나 입력해주세요'}
                                                    />
                                                )}
                                            />
                                            <Autocomplete
                                                options={memoizedIndustries}
                                                freeSolo
                                                value={info.industry}
                                                onChange={(_, v) => handleChange('industry', v || '')}
                                                PopperProps={{
                                                    placement: 'bottom-start',
                                                    modifiers: [
                                                        {
                                                            name: 'flip',
                                                            enabled: true,
                                                            options: {
                                                                altBoundary: true,
                                                                rootBoundary: 'document',
                                                                padding: 8
                                                            }
                                                        }
                                                    ]
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="목표 기업/산업 (선택사항)"
                                                        fullWidth
                                                        helperText="관심 있는 기업이나 산업 분야를 선택해주세요"
                                                    />
                                                )}
                                            />
                                            <Alert severity="info" sx={{ mt: 2 }}>
                                                선택한 직군과 산업에 맞춘 학습 계획을 제공합니다.
                                            </Alert>
                                        </Box>
                                    )}

                                    {step === 2 && (
                                        <Box sx={{ display: 'grid', gap: 2.5 }}>
                                            <TextField
                                                label="잔여 등록 학기 수"
                                                fullWidth
                                                type="text"
                                                inputMode="numeric"
                                                value={info.remainingSemesters === '' ? '' : String(info.remainingSemesters)}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    if (/^\d*$/.test(v)) {
                                                        handleChange('remainingSemesters', v === '' ? '' : Number(v));
                                                    }
                                                }}
                                                error={!!errors.remainingSemesters}
                                                helperText={errors.remainingSemesters || '졸업까지 남은 학기 수 (1-10)'}
                                                inputProps={{ min: 1, max: 10 }}
                                            />
                                            <TextField
                                                label="학기당 최대 수강 학점"
                                                fullWidth
                                                type="text"
                                                inputMode="numeric"
                                                value={info.maxCreditsPerTerm === '' ? '' : String(info.maxCreditsPerTerm)}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    if (/^\d*$/.test(v)) {
                                                        handleChange('maxCreditsPerTerm', v === '' ? '' : Number(v));
                                                    }
                                                }}
                                                error={!!errors.maxCreditsPerTerm}
                                                helperText={errors.maxCreditsPerTerm || '한 학기에 수강할 수 있는 최대 학점 (1-30)'}
                                                inputProps={{ min: 1, max: 30 }}
                                            />
                                            <Alert severity="warning" sx={{ mt: 2 }}>
                                                일반적으로 한 학기에 15-21학점을 수강합니다. 상황에 맞게 조정하세요.
                                            </Alert>
                                        </Box>
                                    )}

                                    {step === 3 && (
                                        <Box sx={{ display: 'grid', gap: 2.5 }}>
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <TextField
                                                    label="하루 최소 교시"
                                                    fullWidth
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={info.minPeriod === '' ? '' : String(info.minPeriod)}
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        if (/^\d*$/.test(v)) handleChange('minPeriod', v === '' ? '' : Number(v));
                                                    }}
                                                    error={!!errors.minPeriod}
                                                    helperText={errors.minPeriod}
                                                    inputProps={{ min: 1, max: 10 }}
                                                    sx={{ flex: 1 }}
                                                />
                                                <TextField
                                                    label="하루 최대 교시"
                                                    fullWidth
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={info.maxPeriod === '' ? '' : String(info.maxPeriod)}
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        if (/^\d*$/.test(v)) handleChange('maxPeriod', v === '' ? '' : Number(v));
                                                    }}
                                                    error={!!errors.maxPeriod}
                                                    helperText={errors.maxPeriod}
                                                    inputProps={{ min: info.minPeriod || 1, max: 10 }}
                                                    sx={{ flex: 1 }}
                                                />
                                            </Box>
                                            <DayPeriodSelector
                                                avoidSlots={info.avoidSlots}
                                                onChange={(slots) => handleChange('avoidSlots', slots)}
                                            />
                                            <Alert severity="info" sx={{ mt: 2 }}>
                                                시간표 제약을 설정하면 더 정확한 추천을 받을 수 있습니다.
                                            </Alert>
                                        </Box>
                                    )}

                                    {step === 4 && (
                                        <Box sx={{ textAlign: 'center', py: 4 }}>
                                            <m.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                            >
                                                <CheckIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                                            </m.div>
                                            <Typography variant="h5" gutterBottom>
                                                정보 입력이 완료되었습니다!
                                            </Typography>
                                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                                입력하신 정보를 바탕으로 맞춤형 학습 계획을 준비합니다.
                                            </Typography>
                                            <Box sx={{ bgcolor: 'grey.50', borderRadius: 2, p: 2, textAlign: 'left' }}>
                                                <Typography variant="subtitle2" gutterBottom>입력 정보 요약:</Typography>
                                                <Typography variant="body2">
                                                    • 이름: {info.name} ({info.department} {info.year})
                                                </Typography>
                                                <Typography variant="body2">• 희망 직군: {info.career}</Typography>
                                                <Typography variant="body2">• 잔여 학기: {info.remainingSemesters}학기</Typography>
                                                <Typography variant="body2">• 최대 학점: {info.maxCreditsPerTerm}학점</Typography>
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            </m.div>
                        </AnimatePresence>
                    </LazyMotion>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Button
                            variant="outlined"
                            startIcon={<BackIcon />}
                            onClick={handleBack}
                            disabled={step === 0 || isLoading}
                            sx={{ minWidth: 100 }}
                        >
                            이전
                        </Button>
                        <Fade in={isLoading}>
                            <Typography variant="body2" color="text.secondary">
                                {step === STEPS.length - 1 ? '저장 중…' : '처리 중…'}
                            </Typography>
                        </Fade>
                        <Button
                            variant="contained"
                            endIcon={step === STEPS.length - 1 ? <CheckIcon /> : <NextIcon />}
                            onClick={handleNext}
                            disabled={isLoading}
                            sx={{
                                minWidth: 120,
                                py: 1.5,
                                fontWeight: 600,
                                background:
                                    step === STEPS.length - 1
                                        ? 'linear-gradient(45deg,#4CAF50 30%,#8BC34A 90%)'
                                        : 'linear-gradient(45deg,#2196F3 30%,#21CBF3 90%)',
                                '&:hover': {
                                    background:
                                        step === STEPS.length - 1
                                            ? 'linear-gradient(45deg,#45a049 30%,#7cb342 90%)'
                                            : 'linear-gradient(45deg,#1976D2 30%,#1E88E5 90%)',
                                },
                            }}
                        >
                            {step === STEPS.length - 1 ? '저장 및 시작' : '다음'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}
