import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    TextField,
    InputAdornment,
    IconButton,
    Link,
    Alert,
    Snackbar,
    MenuItem,
    Chip,
    Button,
    Checkbox,
    FormControlLabel,
    Card,
    Divider,
    Stepper,
    Step,
    StepLabel,
    LinearProgress,
    Tooltip,
    Paper,
    Grid,
    FormControl,
    FormLabel,
    FormGroup,
    FormHelperText,
    CircularProgress,
    Zoom,
    Slide,
    Fade
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Email,
    Lock,
    Person,
    Phone,
    School,
    CheckCircle,
    Info,
    Warning,
    Security,
    Verified,
    PhoneEnabled,
    AccountCircle,
    AdminPanelSettings,
    CheckCircle as CheckCircleIcon,
    ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import PhoneInput from 'react-phone-number-input/input';
import { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

// Components
import GlassCard from '../components/common/GlassCard';
import GradientButton from '../components/common/GradientButton';
import Mascot from '../components/common/Mascot';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/common/NotificationSystem';

// 폼 검증 스키마
// 전화번호 정규식 (010-1234-5678)
const phoneRegex = /^010-\d{4}-\d{4}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const basicInfoSchema = z.object({
    name: z.string()
        .min(2, '이름은 최소 2자 이상이어야 합니다')
        .max(50, '이름은 50자를 초과할 수 없습니다')
        .regex(/^[가-힣a-zA-Z\s]+$/, '이름은 한글, 영문, 공백만 포함할 수 있습니다'),
    email: z.string()
        .email('올바른 이메일 형식이 아닙니다')
        .min(1, '이메일은 필수 항목입니다'),
    password: z.string()
        .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
        .regex(passwordRegex, '비밀번호는 대소문자, 숫자, 특수문자를 모두 포함해야 합니다'),
    confirmPassword: z.string().min(1, '비밀번호 확인은 필수 항목입니다'),
    phone: z.string()
        .min(1, '전화번호는 필수 항목입니다')
        .regex(phoneRegex, '올바른 전화번호 형식이 아닙니다 (010-1234-5678)'),
    phoneVerified: z.boolean().refine((val) => val === true, '전화번호 인증을 완료해주세요'),
    terms1: z.boolean().refine((val) => val === true, '서비스 이용약관에 동의해야 합니다'),
    terms2: z.boolean().refine((val) => val === true, '개인정보 처리방침에 동의해야 합니다'),
    terms3: z.boolean().optional()
}).refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword']
});

const academicInfoSchema = z.object({
    nickname: z.string()
        .min(2, '닉네임은 최소 2자 이상이어야 합니다')
        .max(20, '닉네임은 20자를 초과할 수 없습니다')
        .regex(/^[가-힣a-zA-Z0-9_]+$/, '닉네임은 한글, 영문, 숫자, 언더스코어만 포함할 수 있습니다'),
    studentId: z.string()
        .regex(/^\d{8,10}$/, '학번은 8-10자리 숫자여야 합니다'),
    major: z.string()
        .min(2, '전공은 최소 2자 이상이어야 합니다')
        .max(50, '전공은 50자를 초과할 수 없습니다'),
    grade: z.string().min(1, '학년을 선택해주세요'),
    interests: z.array(z.string()).min(1, '최소 1개 이상의 관심분야를 선택해주세요'),
    enrollmentYear: z.string()
        .regex(/^\d{4}$/, '입학년도는 4자리 숫자여야 합니다')
        .refine((val) => {
            const year = parseInt(val);
            const currentYear = new Date().getFullYear();
            return year >= 1950 && year <= currentYear;
        }, '올바른 입학년도를 입력해주세요'),
    graduationYear: z.string()
        .regex(/^\d{4}$/, '졸업예정년도는 4자리 숫자여야 합니다')
        .refine((val) => {
            const year = parseInt(val);
            const currentYear = new Date().getFullYear();
            return year >= currentYear && year <= currentYear + 10;
        }, '올바른 졸업예정년도를 입력해주세요')
});

type BasicInfoForm = z.infer<typeof basicInfoSchema>;
type AcademicInfoForm = z.infer<typeof academicInfoSchema>;

// 비밀번호 강도 측정 함수
const calculatePasswordStrength = (password: string): { score: number; feedback: string; color: string } => {
    if (!password) return { score: 0, feedback: '', color: '#e0e0e0' };

    let score = 0;
    const feedback: string[] = [];

    // 길이 검사
    if (password.length >= 8) score += 20;
    else feedback.push('8자 이상');

    // 소문자 검사
    if (/[a-z]/.test(password)) score += 20;
    else feedback.push('소문자');

    // 대문자 검사
    if (/[A-Z]/.test(password)) score += 20;
    else feedback.push('대문자');

    // 숫자 검사
    if (/\d/.test(password)) score += 20;
    else feedback.push('숫자');

    // 특수문자 검사
    if (/[@$!%*?&]/.test(password)) score += 20;
    else feedback.push('특수문자');

    let strength = '';
    let color = '';

    if (score < 40) {
        strength = '매우 약함';
        color = '#f44336';
    } else if (score < 60) {
        strength = '약함';
        color = '#ff9800';
    } else if (score < 80) {
        strength = '보통';
        color = '#ffeb3b';
    } else if (score < 100) {
        strength = '강함';
        color = '#4caf50';
    } else {
        strength = '매우 강함';
        color = '#2e7d32';
    }

    return {
        score,
        feedback: feedback.length > 0 ? `필요: ${feedback.join(', ')}` : strength,
        color
    };
};

// 비밀번호 강도 표시 컴포넌트
const PasswordStrengthMeter: React.FC<{ password: string }> = ({ password }) => {
    const strength = calculatePasswordStrength(password);

    return (
        <Box sx={{ mt: 1 }}>
            <LinearProgress
                variant="determinate"
                value={strength.score}
                sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#f0f0f0',
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: strength.color,
                        borderRadius: 3,
                        transition: 'all 0.3s ease'
                    }
                }}
            />
            <Typography
                variant="caption"
                sx={{
                    color: strength.color,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    mt: 0.5,
                    display: 'block'
                }}
            >
                {strength.feedback}
            </Typography>
        </Box>
    );
};

// 전화번호 검증 컴포넌트
const PhoneVerification: React.FC<{
    phone: string;
    onVerified: (verified: boolean) => void;
    verified: boolean;
}> = ({ phone, onVerified, verified }) => {
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [showVerificationInput, setShowVerificationInput] = useState(false);
    const [timer, setTimer] = useState(0);

    const handleSendCode = useCallback(async () => {
        if (!phone || !isValidPhoneNumber(phone)) {
            alert('올바른 전화번호를 입력해주세요');
            return;
        }

        setIsVerifying(true);
        try {
            // 실제 API 호출 시뮬레이션
            await new Promise(resolve => setTimeout(resolve, 1000));
            setShowVerificationInput(true);
            setTimer(300); // 5분 타이머

            // 타이머 시작
            const interval = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (error) {
            console.error('인증코드 전송 실패:', error);
        } finally {
            setIsVerifying(false);
        }
    }, [phone]);

    const handleVerifyCode = useCallback(async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            alert('6자리 인증코드를 입력해주세요');
            return;
        }

        setIsVerifying(true);
        try {
            // 실제 API 호출 시뮬레이션
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 시뮬레이션: 123456이면 성공
            if (verificationCode === '123456') {
                onVerified(true);
                setShowVerificationInput(false);
                setTimer(0);
            } else {
                alert('인증코드가 올바르지 않습니다');
            }
        } catch (error) {
            console.error('인증 실패:', error);
        } finally {
            setIsVerifying(false);
        }
    }, [verificationCode, onVerified]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button
                    variant={verified ? 'contained' : 'outlined'}
                    color={verified ? 'success' : 'primary'}
                    onClick={handleSendCode}
                    disabled={isVerifying || verified || timer > 0}
                    startIcon={verified ? <CheckCircle /> : <PhoneEnabled />}
                    sx={{ minWidth: 120, fontWeight: 700 }}
                >
                    {isVerifying ? (
                        <CircularProgress size={16} />
                    ) : verified ? (
                        '인증완료'
                    ) : timer > 0 ? (
                        formatTime(timer)
                    ) : (
                        '인증하기'
                    )}
                </Button>
            </Box>

            <AnimatePresence>
                {showVerificationInput && !verified && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Paper elevation={1} sx={{ p: 2, mb: 2, backgroundColor: '#f8f9fa' }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                {phone}로 전송된 6자리 인증코드를 입력해주세요
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <TextField
                                    size="small"
                                    placeholder="인증코드 6자리"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    inputProps={{
                                        maxLength: 6,
                                        style: { textAlign: 'center', letterSpacing: '0.5em' }
                                    }}
                                    sx={{ width: 150 }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleVerifyCode}
                                    disabled={isVerifying || verificationCode.length !== 6}
                                    sx={{ minWidth: 80 }}
                                >
                                    {isVerifying ? <CircularProgress size={16} /> : '확인'}
                                </Button>
                            </Box>
                            {timer > 0 && (
                                <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
                                    남은 시간: {formatTime(timer)}
                                </Typography>
                            )}
                        </Paper>
                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    );
};

// 전화번호 하이픈 자동 포맷 함수
function formatPhoneNumber(value: string) {
    // 숫자만 남기기
    const onlyNums = value.replace(/[^0-9]/g, '');
    if (onlyNums.length < 4) return onlyNums;
    if (onlyNums.length < 8) return onlyNums.replace(/(\d{3})(\d{1,4})/, '$1-$2');
    return onlyNums.replace(/(\d{3})(\d{4})(\d{1,4})/, '$1-$2-$3');
}

const Register: React.FC = () => {
    const navigate = useNavigate();
    const { register: authRegister } = useAuth();
    const { showNotification } = useNotification();

    // 폼 상태
    const [step, setStep] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(false);

    // 관심분야 목록
    const interestsList = [
        'AI/머신러닝', '데이터분석', '정보보안', '웹개발', '모바일앱개발',
        '게임개발', '클라우드컴퓨팅', '블록체인', 'IoT', '로봇공학',
        '사이버보안', '네트워크', '데이터베이스', 'UI/UX디자인', '프로젝트관리'
    ];

    const grades = ['1학년', '2학년', '3학년', '4학년', '5학년 이상'];

    // 학년 선택 도움말 메시지
    const getGradeHelpText = (grade: string) => {
        return '';
    };

    const steps = ['기본정보', '학사정보', '완료'];

    // 기본정보 폼
    const basicInfoForm = useForm<BasicInfoForm>({
        resolver: zodResolver(basicInfoSchema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: '',
            phoneVerified: false,
            terms1: false,
            terms2: false,
            terms3: false,
        }
    });

    // 학사정보 폼
    const academicInfoForm = useForm<AcademicInfoForm>({
        resolver: zodResolver(academicInfoSchema),
        mode: 'onChange',
    });

    // 디버깅용 useEffect
    useEffect(() => {
        console.log('Form valid:', basicInfoForm.formState.isValid);
        console.log('Form errors:', basicInfoForm.formState.errors);
        console.log('Phone verified:', phoneVerified);
        console.log('Form values:', basicInfoForm.getValues());
    }, [basicInfoForm.formState.isValid, basicInfoForm.formState.errors, phoneVerified]);

    const handleNext = () => {
        console.log('=== 다음 단계 클릭 ===');
        console.log('Current step:', step);
        console.log('Form valid:', basicInfoForm.formState.isValid);
        console.log('Form errors:', basicInfoForm.formState.errors);
        console.log('Form values:', basicInfoForm.getValues());
        if (step === 0) {
            basicInfoForm.handleSubmit(
                (data) => {
                    setStep(1);
                },
                (errors) => {
                    console.error('Form validation errors:', errors);
                    let errorMsg = '입력 정보를 확인해주세요.';
                    if (errors.phoneVerified) {
                        errorMsg = '전화번호 인증을 완료해주세요.';
                    } else if (errors.terms1 || errors.terms2) {
                        errorMsg = '필수 약관에 동의해주세요.';
                    }
                    showNotification({
                        type: 'error',
                        message: errorMsg
                    });
                }
            )();
        } else if (step === 1) {
            academicInfoForm.handleSubmit(() => {
                setStep(2);
            })();
        }
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleRegister: SubmitHandler<BasicInfoForm> = async (basicData) => {
        const academicData = academicInfoForm.getValues();

        setIsLoading(true);
        try {
            // 기본정보 검증
            const basicResult = await basicInfoSchema.safeParseAsync(basicData);
            if (!basicResult.success) {
                throw new Error('기본정보 검증 실패');
            }

            // 학사정보 검증
            const academicResult = await academicInfoSchema.safeParseAsync(academicData);
            if (!academicResult.success) {
                throw new Error('학사정보 검증 실패');
            }

            // 전화번호 검증 확인
            if (!phoneVerified) {
                throw new Error('전화번호 인증이 완료되지 않았습니다');
            }

            // 회원가입 API 호출 (AuthContext에서 학년 변환 처리)
            await authRegister(
                basicData.name,
                basicData.email,
                basicData.password,
                academicData.studentId,
                academicData.major,
                academicData.grade,
                basicData.phone,
                academicData.interests,
                Number(academicData.enrollmentYear),
                Number(academicData.graduationYear)
            );

            // 프로필 정보는 AuthContext에서 자동으로 초기화됨
            // useData를 통해 관리되므로 별도 저장 불필요

            showNotification({
                type: 'success',
                message: '회원가입 성공'
            });

            // 폼 초기화
            basicInfoForm.reset();
            academicInfoForm.reset();
            setPhoneVerified(false);
            setStep(0);

            // 로그인 페이지로 이동
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error: any) {
            console.error('회원가입 실패:', error);

            // 백엔드에서 구조화된 에러 응답 처리
            let message = '회원가입에 실패했습니다. 다시 시도해주세요.';
            const severity: 'error' | 'warning' | 'info' | 'success' = 'error';

            if (error?.response?.data) {
                const errorData = error.response.data;

                // 백엔드에서 제공하는 구조화된 에러 처리
                if (errorData.success === false) {
                    message = errorData.error || message;

                    // 에러 타입별로 다른 처리
                    switch (errorData.errorType) {
                        case 'email_duplicate':
                            message = '이미 존재하는 이메일입니다.';
                            break;
                        case 'password_invalid':
                            message = '비밀번호는 6자 이상이어야 합니다.';
                            break;
                        case 'email_invalid':
                            message = '올바른 이메일 형식을 입력해주세요.';
                            break;
                        case 'required_field':
                            message = '필수 정보를 모두 입력해주세요.';
                            break;
                        default:
                            message = errorData.error || message;
                    }
                }
            } else {
                // 기존 에러 처리 로직 (fallback)
                if (error?.message) {
                    if (error.message.includes('이미 사용 중인 학번')) {
                        message = '이미 사용 중인 학번입니다.';
                    } else if (error.message.includes('이미 존재하는 이메일')) {
                        message = '이미 존재하는 이메일입니다.';
                    } else if (error.message.includes('already exist') || error.message.includes('User already exists') || error.message.includes('이미 등록')) {
                        message = '이미 등록된 정보입니다.';
                    } else if (error.message.includes('Validation error')) {
                        message = '입력 정보에 오류가 있습니다.';
                    } else if (error.message.includes('Network Error') || error.message.includes('fetch')) {
                        message = '네트워크 오류가 발생했습니다.';
                    } else {
                        message = error.message;
                    }
                }
            }

            showNotification({
                type: severity,
                message
            });
        } finally {
            setIsLoading(false);
        }
    };

    const watchPassword = basicInfoForm.watch('password');
    const watchConfirmPassword = basicInfoForm.watch('confirmPassword');

    const [phoneRequested, setPhoneRequested] = useState(false);
    const [authCode, setAuthCode] = useState('');
    const [authCodeInput, setAuthCodeInput] = useState('');
    const [timer, setTimer] = useState(180); // 3분

    // 타이머 효과
    React.useEffect(() => {
        if (phoneRequested && !phoneVerified && timer > 0) {
            const t = setTimeout(() => setTimer(timer - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [phoneRequested, phoneVerified, timer]);

    function formatTimer(sec: number) {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    // 전화번호 인증 완료 핸들러
    const handlePhoneVerified = (verified: boolean) => {
        setPhoneVerified(verified);
        basicInfoForm.setValue('phoneVerified', verified, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true
        });
    };

    // 전공 리스트 예시
    const majorList = [
        '컴퓨터공학과', '소프트웨어학과', '전자공학과', '기계공학과', '산업경영공학과',
        '화학공학과', '신소재공학과', '건축공학과', '디자인학과', '경영학과', '기타'
    ];

    return (
        <Box
            sx={{
                width: '100vw',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #e0f2ff 0%, #f3e8ff 100%)',
                py: 4
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                style={{ width: '100%', maxWidth: 800 }}
            >
                <GlassCard sx={{
                    p: { xs: 3, md: 6 },
                    borderRadius: 7,
                    boxShadow: '0 8px 32px rgba(14,87,233,0.10)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'visible',
                }}>
                    <Mascot size={100} animate style={{ marginBottom: 16 }} />

                    <Typography
                        variant="h4"
                        fontWeight={800}
                        sx={{
                            color: '#162B49',
                            mb: 1,
                            fontFamily: 'Pretendard, sans-serif',
                            textAlign: 'center',
                            letterSpacing: '-0.02em',
                            textShadow: '0 2px 12px #0ea5e955',
                        }}
                    >
                        회원가입
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            color: '#0D57A7',
                            mb: 3,
                            fontFamily: 'Pretendard, sans-serif',
                            textAlign: 'center',
                            fontWeight: 600,
                            letterSpacing: '-0.01em',
                            textShadow: '0 1px 8px #3C63AE33',
                        }}
                    >
                        TUK NAVI와 함께 스마트한 대학생활을 시작하세요!
                    </Typography>

                    {/* 스테퍼 */}
                    <Box sx={{ width: '100%', mb: 4 }}>
                        <Stepper activeStep={step} sx={{ mb: 2 }}>
                            {steps.map((label, index) => (
                                <Step key={label} completed={index < step}>
                                    <StepLabel
                                        sx={{
                                            '& .MuiStepLabel-label': {
                                                fontWeight: 600,
                                                color: index <= step ? '#0ea5e9' : '#9ca3af'
                                            }
                                        }}
                                    >
                                        {label}
                                    </StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Box>

                    <Box sx={{ width: '100%', maxWidth: 700 }}>
                        <AnimatePresence mode="wait">
                            {step === 0 && (
                                <motion.div
                                    key="step0"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card sx={{ p: 4, borderRadius: 4, boxShadow: 3 }}>
                                        <Typography variant="h5" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AccountCircle color="primary" /> 기본 정보
                                        </Typography>
                                        <Divider sx={{ mb: 3 }} />

                                        <Grid container spacing={3}>
                                            <Grid item xs={12} sm={6}>
                                                <Controller
                                                    name="name"
                                                    control={basicInfoForm.control}
                                                    render={({ field, fieldState }) => (
                                                        <TextField
                                                            {...field}
                                                            fullWidth
                                                            label="이름"
                                                            error={!!fieldState.error}
                                                            helperText={fieldState.error?.message}
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <InputAdornment position="start">
                                                                        <Person sx={{ color: '#0ea5e9' }} />
                                                                    </InputAdornment>
                                                                )
                                                            }}
                                                            sx={{ mb: 2 }}
                                                        />
                                                    )}
                                                />
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <Controller
                                                    name="email"
                                                    control={basicInfoForm.control}
                                                    render={({ field, fieldState }) => (
                                                        <TextField
                                                            {...field}
                                                            fullWidth
                                                            label="이메일"
                                                            type="email"
                                                            error={!!fieldState.error}
                                                            helperText={fieldState.error?.message}
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <InputAdornment position="start">
                                                                        <Email sx={{ color: '#0ea5e9' }} />
                                                                    </InputAdornment>
                                                                )
                                                            }}
                                                            sx={{ mb: 2 }}
                                                        />
                                                    )}
                                                />
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <Controller
                                                    name="password"
                                                    control={basicInfoForm.control}
                                                    render={({ field, fieldState }) => (
                                                        <Box>
                                                            <TextField
                                                                {...field}
                                                                fullWidth
                                                                label="비밀번호"
                                                                type={showPassword ? 'text' : 'password'}
                                                                error={!!fieldState.error}
                                                                helperText={fieldState.error?.message}
                                                                InputProps={{
                                                                    startAdornment: (
                                                                        <InputAdornment position="start">
                                                                            <Lock sx={{ color: '#0ea5e9' }} />
                                                                        </InputAdornment>
                                                                    ),
                                                                    endAdornment: (
                                                                        <InputAdornment position="end">
                                                                            <IconButton
                                                                                onClick={() => setShowPassword(!showPassword)}
                                                                                edge="end"
                                                                            >
                                                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                                                            </IconButton>
                                                                        </InputAdornment>
                                                                    )
                                                                }}
                                                                sx={{ mb: 1 }}
                                                            />
                                                            <PasswordStrengthMeter password={watchPassword} />
                                                        </Box>
                                                    )}
                                                />
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <Controller
                                                    name="confirmPassword"
                                                    control={basicInfoForm.control}
                                                    render={({ field, fieldState }) => (
                                                        <Box>
                                                            <TextField
                                                                {...field}
                                                                fullWidth
                                                                label="비밀번호 확인"
                                                                type={showConfirmPassword ? 'text' : 'password'}
                                                                error={!!fieldState.error}
                                                                helperText={fieldState.error?.message}
                                                                InputProps={{
                                                                    startAdornment: (
                                                                        <InputAdornment position="start">
                                                                            <Lock sx={{ color: '#0ea5e9' }} />
                                                                        </InputAdornment>
                                                                    ),
                                                                    endAdornment: (
                                                                        <InputAdornment position="end">
                                                                            <IconButton
                                                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                                edge="end"
                                                                            >
                                                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                                            </IconButton>
                                                                        </InputAdornment>
                                                                    )
                                                                }}
                                                                sx={{ mb: 2 }}
                                                            />
                                                        </Box>
                                                    )}
                                                />
                                            </Grid>

                                            {/* 전화번호 인증 UI - 한 줄 정렬 */}
                                            <Grid item xs={12}>
                                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                                                    <Controller
                                                        name="phone"
                                                        control={basicInfoForm.control}
                                                        render={({ field, fieldState }) => (
                                                            <TextField
                                                                {...field}
                                                                fullWidth
                                                                label="전화번호"
                                                                value={field.value}
                                                                onChange={(e) => {
                                                                    const formatted = formatPhoneNumber(e.target.value);
                                                                    field.onChange(formatted);
                                                                }}
                                                                required
                                                                placeholder="010-1234-5678"
                                                                inputProps={{ maxLength: 13 }}
                                                                disabled={phoneVerified}
                                                                sx={{ flex: 2, minWidth: 180 }}
                                                                InputProps={{
                                                                    startAdornment: (
                                                                        <InputAdornment position="start">
                                                                            <Phone sx={{ color: '#0ea5e9' }} />
                                                                        </InputAdornment>
                                                                    )
                                                                }}
                                                                error={!!fieldState.error}
                                                                helperText={fieldState.error?.message}
                                                            />
                                                        )}
                                                    />
                                                    {!phoneRequested && !phoneVerified && (
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            disabled={((basicInfoForm.getValues('phone') ?? '').length) < 12}
                                                            onClick={() => {
                                                                setPhoneRequested(true);
                                                                setAuthCode('123456'); // 개발자 모드: 고정 코드
                                                                setTimer(180);
                                                            }}
                                                            sx={{ flex: 1, minWidth: 110, fontWeight: 700, height: 56, whiteSpace: 'nowrap' }}
                                                        >
                                                            인증요청
                                                        </Button>
                                                    )}
                                                    {phoneRequested && !phoneVerified && (
                                                        <>
                                                            <TextField
                                                                label="인증번호"
                                                                value={authCodeInput}
                                                                onChange={e => setAuthCodeInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                                                placeholder="6자리"
                                                                inputProps={{ maxLength: 6 }}
                                                                sx={{ width: 140, minWidth: 100, flex: '0 0 140px' }}
                                                            />
                                                            <Button
                                                                variant="outlined"
                                                                color="primary"
                                                                onClick={() => {
                                                                    // 개발자 모드: 인증번호 입력값과 상관없이 바로 인증 완료
                                                                    handlePhoneVerified(true);
                                                                }}
                                                                disabled={false}
                                                                sx={{ flex: '0 0 64px', minWidth: 64, height: 56, whiteSpace: 'nowrap' }}
                                                            >
                                                                확인
                                                            </Button>
                                                            <Typography variant="body2" sx={{ color: timer > 0 ? 'text.secondary' : 'error.main', minWidth: 70, textAlign: 'center', flex: '0 0 70px' }}>
                                                                {timer > 0 ? `남은 시간: ${formatTimer(timer)}` : '시간초과'}
                                                            </Typography>
                                                        </>
                                                    )}
                                                    {phoneVerified && (
                                                        <Button
                                                            variant="contained"
                                                            color="success"
                                                            sx={{ flex: 1, minWidth: 110, fontWeight: 700, height: 56, whiteSpace: 'nowrap' }}
                                                            startIcon={<CheckCircleIcon />}
                                                            disabled
                                                        >
                                                            인증완료
                                                        </Button>
                                                    )}
                                                </Box>
                                                {phoneRequested && !phoneVerified && timer > 0 && (authCodeInput ?? '').length === 6 && authCodeInput !== authCode && (
                                                    <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                                                        인증번호가 일치하지 않습니다.
                                                    </Typography>
                                                )}
                                                {phoneVerified && (
                                                    <Typography variant="body2" color="success.main" sx={{ ml: 1, fontWeight: 600 }}>
                                                        인증이 완료되었습니다.
                                                    </Typography>
                                                )}
                                            </Grid>
                                        </Grid>

                                        <Divider sx={{ my: 3 }} />

                                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AdminPanelSettings color="primary" /> 약관 동의
                                        </Typography>

                                        <FormControl component="fieldset" sx={{ mb: 3 }}>
                                            <FormGroup>
                                                <Controller
                                                    name="terms1"
                                                    control={basicInfoForm.control}
                                                    render={({ field, fieldState }) => (
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    {...field}
                                                                    checked={field.value}
                                                                    color="primary"
                                                                />
                                                            }
                                                            label={
                                                                <Typography variant="body2">
                                                                    (필수) <Link href="/terms/service" target="_blank" rel="noopener noreferrer">서비스 이용약관</Link>에 동의합니다
                                                                </Typography>
                                                            }
                                                        />
                                                    )}
                                                />

                                                <Controller
                                                    name="terms2"
                                                    control={basicInfoForm.control}
                                                    render={({ field, fieldState }) => (
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    {...field}
                                                                    checked={field.value}
                                                                    color="primary"
                                                                />
                                                            }
                                                            label={
                                                                <Typography variant="body2">
                                                                    (필수) <Link href="/terms/privacy" target="_blank" rel="noopener noreferrer">개인정보 처리방침</Link>에 동의합니다
                                                                </Typography>
                                                            }
                                                        />
                                                    )}
                                                />

                                                <Controller
                                                    name="terms3"
                                                    control={basicInfoForm.control}
                                                    render={({ field, fieldState }) => (
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    {...field}
                                                                    checked={field.value}
                                                                    color="primary"
                                                                />
                                                            }
                                                            label={
                                                                <Typography variant="body2">
                                                                    (선택) <Link href="/terms/marketing" target="_blank" rel="noopener noreferrer">마케팅 정보 수신</Link>에 동의합니다
                                                                </Typography>
                                                            }
                                                        />
                                                    )}
                                                />
                                            </FormGroup>
                                            {(basicInfoForm.formState.errors.terms1 || basicInfoForm.formState.errors.terms2) && (
                                                <FormHelperText error>
                                                    {basicInfoForm.formState.errors.terms1?.message || basicInfoForm.formState.errors.terms2?.message}
                                                </FormHelperText>
                                            )}
                                        </FormControl>

                                        <Button
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            onClick={handleNext}
                                            disabled={!basicInfoForm.formState.isValid || isLoading}
                                            sx={{
                                                mt: 3,
                                                fontWeight: 700,
                                                fontSize: 18,
                                                borderRadius: 3,
                                                py: 1.5,
                                                background: 'linear-gradient(45deg, #0ea5e9, #3b82f6)',
                                                '&:hover': {
                                                    background: 'linear-gradient(45deg, #0284c7, #2563eb)',
                                                }
                                            }}
                                        >
                                            다음 단계
                                        </Button>
                                    </Card>
                                </motion.div>
                            )}

                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card sx={{ p: 4, borderRadius: 4, boxShadow: 3 }}>
                                        <Typography variant="h5" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <School color="primary" /> 학사 정보
                                        </Typography>
                                        <Divider sx={{ mb: 3 }} />

                                        <Grid container spacing={3}>
                                            <Grid item xs={12} sm={6}>
                                                <Controller
                                                    name="nickname"
                                                    control={academicInfoForm.control}
                                                    render={({ field, fieldState }) => (
                                                        <TextField
                                                            {...field}
                                                            fullWidth
                                                            label="닉네임"
                                                            error={!!fieldState.error}
                                                            helperText={fieldState.error?.message}
                                                            sx={{ mb: 2 }}
                                                        />
                                                    )}
                                                />
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <Controller
                                                    name="studentId"
                                                    control={academicInfoForm.control}
                                                    render={({ field, fieldState }) => (
                                                        <TextField
                                                            {...field}
                                                            fullWidth
                                                            label="학번"
                                                            error={!!fieldState.error}
                                                            helperText={fieldState.error?.message}
                                                            sx={{ mb: 2 }}
                                                        />
                                                    )}
                                                />
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <Controller
                                                    name="major"
                                                    control={academicInfoForm.control}
                                                    render={({ field, fieldState }) => (
                                                        <TextField
                                                            {...field}
                                                            select
                                                            fullWidth
                                                            label="전공"
                                                            error={!!fieldState.error}
                                                            helperText={fieldState.error?.message}
                                                            sx={{ mb: 2 }}
                                                        >
                                                            {majorList.map((major) => (
                                                                <MenuItem key={major} value={major}>
                                                                    {major}
                                                                </MenuItem>
                                                            ))}
                                                        </TextField>
                                                    )}
                                                />
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <Controller
                                                    name="grade"
                                                    control={academicInfoForm.control}
                                                    render={({ field, fieldState }) => (
                                                        <Box>
                                                            <TextField
                                                                {...field}
                                                                select
                                                                fullWidth
                                                                label="학년"
                                                                error={!!fieldState.error}
                                                                helperText={fieldState.error?.message || getGradeHelpText(field.value)}
                                                                sx={{ mb: 2 }}
                                                            >
                                                                {grades.map((grade) => (
                                                                    <MenuItem key={grade} value={grade}>
                                                                        {grade}
                                                                    </MenuItem>
                                                                ))}
                                                            </TextField>
                                                            {getGradeHelpText(field.value) && (
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        color: 'info.main',
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: 500,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 0.5,
                                                                        mt: -1.5,
                                                                        mb: 1
                                                                    }}
                                                                >
                                                                    <Info sx={{ fontSize: 16 }} />
                                                                    {getGradeHelpText(field.value)}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    )}
                                                />
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <Controller
                                                    name="enrollmentYear"
                                                    control={academicInfoForm.control}
                                                    render={({ field, fieldState }) => (
                                                        <TextField
                                                            {...field}
                                                            fullWidth
                                                            label="입학년도"
                                                            type="number"
                                                            error={!!fieldState.error}
                                                            helperText={fieldState.error?.message}
                                                            sx={{ mb: 2 }}
                                                        />
                                                    )}
                                                />
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <Controller
                                                    name="graduationYear"
                                                    control={academicInfoForm.control}
                                                    render={({ field, fieldState }) => (
                                                        <TextField
                                                            {...field}
                                                            fullWidth
                                                            label="졸업예정년도"
                                                            type="number"
                                                            error={!!fieldState.error}
                                                            helperText={fieldState.error?.message}
                                                            sx={{ mb: 2 }}
                                                        />
                                                    )}
                                                />
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Controller
                                                    name="interests"
                                                    control={academicInfoForm.control}
                                                    render={({ field, fieldState }) => (
                                                        <Box>
                                                            <Typography
                                                                variant="subtitle1"
                                                                fontWeight={600}
                                                                gutterBottom
                                                                sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1,
                                                                    mb: 2
                                                                }}
                                                            >
                                                                <School sx={{ color: '#0ea5e9' }} />
                                                                관심 분야 선택
                                                                <Chip
                                                                    label={`${(field.value ?? []).length}개 선택`}
                                                                    size="small"
                                                                    color={(field.value ?? []).length > 0 ? 'primary' : 'default'}
                                                                    sx={{ ml: 1 }}
                                                                />
                                                            </Typography>

                                                            <Paper
                                                                variant="outlined"
                                                                sx={{
                                                                    p: 3,
                                                                    mb: 1,
                                                                    borderRadius: 3,
                                                                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                                                    border: fieldState.error ? '2px solid #f44336' : '1px solid #e2e8f0',
                                                                    '&:hover': {
                                                                        border: fieldState.error ? '2px solid #f44336' : '1px solid #0ea5e9',
                                                                    },
                                                                    transition: 'all 0.2s ease'
                                                                }}
                                                            >
                                                                <Typography
                                                                    variant="body2"
                                                                    color="text.secondary"
                                                                    sx={{ mb: 2, fontWeight: 500 }}
                                                                >
                                                                    관심 있는 분야를 선택해주세요 (최소 1개 이상)
                                                                </Typography>

                                                                <Box sx={{
                                                                    display: 'grid',
                                                                    gridTemplateColumns: {
                                                                        xs: 'repeat(2, 1fr)',
                                                                        sm: 'repeat(3, 1fr)',
                                                                        md: 'repeat(4, 1fr)'
                                                                    },
                                                                    gap: 1.5,
                                                                    alignItems: 'center'
                                                                }}>
                                                                    {interestsList.map((interest) => (
                                                                        <Chip
                                                                            key={interest}
                                                                            label={interest}
                                                                            color={(field.value ?? []).includes(interest) ? 'primary' : 'default'}
                                                                            onClick={() => {
                                                                                const newInterests = (field.value ?? []).includes(interest)
                                                                                    ? (field.value ?? []).filter(i => i !== interest)
                                                                                    : [...(field.value ?? []), interest];
                                                                                field.onChange(newInterests);
                                                                            }}
                                                                            variant={(field.value ?? []).includes(interest) ? 'filled' : 'outlined'}
                                                                            sx={{
                                                                                cursor: 'pointer',
                                                                                height: 40,
                                                                                fontSize: '0.875rem',
                                                                                fontWeight: 600,
                                                                                borderRadius: 2,
                                                                                transition: 'all 0.2s ease',
                                                                                '&:hover': {
                                                                                    transform: 'translateY(-1px)',
                                                                                    boxShadow: '0 4px 12px rgba(14, 165, 233, 0.15)'
                                                                                },
                                                                                '&.MuiChip-filled': {
                                                                                    background: 'linear-gradient(45deg, #0ea5e9, #3b82f6)',
                                                                                    color: 'white',
                                                                                    '&:hover': {
                                                                                        background: 'linear-gradient(45deg, #0284c7, #2563eb)',
                                                                                    }
                                                                                },
                                                                                '&.MuiChip-outlined': {
                                                                                    borderColor: '#e2e8f0',
                                                                                    backgroundColor: 'white',
                                                                                    '&:hover': {
                                                                                        borderColor: '#0ea5e9',
                                                                                        backgroundColor: '#f0f9ff'
                                                                                    }
                                                                                }
                                                                            }}
                                                                        />
                                                                    ))}
                                                                </Box>
                                                            </Paper>

                                                            {fieldState.error && (
                                                                <FormHelperText error sx={{ ml: 2, fontSize: '0.875rem' }}>
                                                                    {fieldState.error.message}
                                                                </FormHelperText>
                                                            )}

                                                            {(field.value ?? []).length > 0 && (
                                                                <Box sx={{ mt: 2 }}>
                                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                                        선택된 관심분야:
                                                                    </Typography>
                                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                        {(field.value ?? []).map((interest) => (
                                                                            <Chip
                                                                                key={interest}
                                                                                label={interest}
                                                                                size="small"
                                                                                color="primary"
                                                                                variant="filled"
                                                                                sx={{
                                                                                    fontSize: '0.75rem',
                                                                                    height: 28,
                                                                                    background: 'linear-gradient(45deg, #0ea5e9, #3b82f6)',
                                                                                }}
                                                                            />
                                                                        ))}
                                                                    </Box>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    )}
                                                />
                                            </Grid>
                                        </Grid>

                                        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                                            <Button
                                                variant="outlined"
                                                size="large"
                                                onClick={handleBack}
                                                startIcon={<ArrowBack />}
                                                sx={{
                                                    fontWeight: 700,
                                                    fontSize: 16,
                                                    borderRadius: 2,
                                                    px: 4,
                                                    minWidth: 120,
                                                    height: 56,
                                                    color: '#0ea5e9',
                                                    borderColor: '#0ea5e9',
                                                    background: '#fff',
                                                    boxShadow: '0 2px 8px rgba(14,165,233,0.08)',
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        background: '#e0f2fe',
                                                        borderColor: '#0284c7',
                                                        color: '#0284c7',
                                                        boxShadow: '0 4px 16px rgba(14,165,233,0.15)'
                                                    }
                                                }}
                                            >
                                                이전
                                            </Button>
                                            <GradientButton
                                                fullWidth
                                                onClick={basicInfoForm.handleSubmit(handleRegister)}
                                                disabled={isLoading || !academicInfoForm.formState.isValid}
                                                sx={{
                                                    height: 56,
                                                    borderRadius: 2,
                                                    fontWeight: 700,
                                                    fontSize: 18,
                                                    textTransform: 'none',
                                                    background: 'linear-gradient(90deg, #0ea5e9 0%, #3b82f6 100%)',
                                                    boxShadow: '0 4px 20px rgba(14,165,233,0.18)',
                                                    flex: 1,
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        background: 'linear-gradient(90deg, #0284c7 0%, #2563eb 100%)',
                                                        boxShadow: '0 6px 24px rgba(14,165,233,0.22)',
                                                    },
                                                    '&:disabled': {
                                                        background: 'linear-gradient(90deg, #94a3b8 0%, #64748b 100%)',
                                                        boxShadow: 'none',
                                                    },
                                                }}
                                            >
                                                {isLoading ? (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <CircularProgress size={20} color="inherit" />
                                                        가입 중...
                                                    </Box>
                                                ) : (
                                                    '회원가입 완료'
                                                )}
                                            </GradientButton>
                                        </Box>
                                    </Card>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <Card sx={{ p: 4, borderRadius: 4, boxShadow: 3, textAlign: 'center' }}>
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                        >
                                            <CheckCircle sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
                                        </motion.div>

                                        <Typography variant="h4" fontWeight={700} color="#4caf50" gutterBottom>
                                            회원가입 완료!
                                        </Typography>

                                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                            TUK NAVI의 회원이 되신 것을 환영합니다.<br />
                                            곧 로그인 페이지로 이동합니다.
                                        </Typography>

                                        <LinearProgress
                                            variant="determinate"
                                            value={100}
                                            sx={{
                                                height: 8,
                                                borderRadius: 4,
                                                backgroundColor: '#e8f5e8',
                                                '& .MuiLinearProgress-bar': {
                                                    backgroundColor: '#4caf50',
                                                    borderRadius: 4,
                                                }
                                            }}
                                        />
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Box>

                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                        <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                            이미 계정이 있으신가요?
                        </Typography>
                        <Link
                            component="button"
                            variant="body2"
                            onClick={() => navigate('/login')}
                            sx={{
                                color: '#0ea5e9',
                                textDecoration: 'none',
                                fontWeight: 600,
                                '&:hover': {
                                    textDecoration: 'underline',
                                },
                            }}
                        >
                            로그인
                        </Link>
                    </Box>
                </GlassCard>
            </motion.div>

            {/* Snackbar 제거 */}
        </Box>
    );
};

export default Register; 
