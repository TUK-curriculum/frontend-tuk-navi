import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    InputAdornment,
    IconButton,
    Link,
    Alert,
    Snackbar,
    Button
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlassCard from '../components/common/GlassCard';
import GradientButton from '../components/common/GradientButton';
import Mascot from '../components/common/Mascot';
import { useAuth } from '../contexts/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/AuthService';
import { apiClient } from '../utils/apiClient';

// 공통 버튼 스타일 정의
const commonButtonStyles = {
    height: 48,
    borderRadius: 3,
    fontWeight: 600,
    fontSize: '16px',
    textTransform: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
    '&:active': {
        transform: 'translateY(0)',
    },
};

// 향상된 Google 로그인 버튼 스타일
const googleButtonStyles = {
    ...commonButtonStyles,
    backgroundColor: '#ffffff',
    color: '#3c4043',
    border: '1px solid #dadce0',
    '&:hover': {
        ...commonButtonStyles['&:hover'],
        backgroundColor: '#f8f9fa',
        borderColor: '#c8cbd0',
    },
    '&:active': {
        ...commonButtonStyles['&:active'],
        backgroundColor: '#f1f3f4',
    },
    '&:disabled': {
        backgroundColor: '#f8f9fa',
        color: '#9aa0a6',
        borderColor: '#e8eaed',
    },
};

const Login: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'warning' | 'info'
    });

    const navigate = useNavigate();
    const location = useLocation();
    const { login: contextLogin, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const loginMutation = useMutation({
        mutationFn: (credentials: Parameters<typeof authService.login>[0]) => authService.login(credentials),
        onSuccess: (data) => {
            contextLogin(email, password);
            setSnackbar({
                open: true,
                message: '로그인에 성공했습니다!',
                severity: 'success'
            });
            const from = (location.state as any)?.from?.pathname || '/dashboard';
            navigate(from);
        },
        onError: (err: any) => {
            let message = err?.response?.data?.message || err.message || '로그인에 실패했습니다.';
            if (message.includes('Invalid credentials') || message.includes('password')) {
                message = '이메일 또는 비밀번호가 올바르지 않습니다.';
            } else if (message.includes('User not found')) {
                message = '등록되지 않은 이메일입니다. 회원가입을 먼저 진행해주세요.';
            } else if (message.includes('Network Error')) {
                message = '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
            }
            setSnackbar({
                open: true,
                message,
                severity: 'error'
            });
        },
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanEmail = email.trim().toLowerCase();
        const cleanPassword = password.trim();
        if (!cleanEmail || !cleanPassword) {
            setSnackbar({
                open: true,
                message: '이메일과 비밀번호를 모두 입력해주세요.',
                severity: 'warning'
            });
            return;
        }
        loginMutation.mutate({ email: cleanEmail, password: cleanPassword });
    };

    const handleGoogleLogin = async () => {
        try {
            setSnackbar({
                open: true,
                message: 'Google 로그인을 진행 중입니다...',
                severity: 'info'
            });

            const data = await apiClient.auth.googleLogin();
            
            contextLogin(data.user.email, '');
            
            setSnackbar({
                open: true,
                message: 'Google 로그인에 성공했습니다!',
                severity: 'success'
            });
            
            const from = (location.state as any)?.from?.pathname || '/dashboard';
            navigate(from);
            
        } catch (error: any) {
            let message = error?.message || 'Google 로그인에 실패했습니다.';
            
            if (message.includes('SDK가 로드되지 않았습니다')) {
                message = 'Google 로그인 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.';
            } else if (message.includes('팝업이 차단')) {
                message = '팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.';
            } else if (message.includes('로그인이 취소')) {
                message = 'Google 로그인이 취소되었습니다.';
            }
            
            setSnackbar({
                open: true,
                message,
                severity: 'error'
            });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box
            sx={{
                width: '100vw',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #e0f2ff 0%, #f3e8ff 100%)',
                padding: { xs: 2, sm: 3 },
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                style={{ width: '100%', maxWidth: 440 }}
            >
                <GlassCard sx={{
                    p: { xs: 4, md: 6 },
                    borderRadius: 4,
                    boxShadow: '0 20px 40px rgba(14, 87, 233, 0.12)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'visible',
                    backdropFilter: 'blur(20px)',
                    background: 'rgba(255, 255, 255, 0.95)',
                }}>
                    <Mascot size={120} animate style={{ marginBottom: 16 }} />
                    <Typography
                        variant="h4"
                        fontWeight={800}
                        sx={{
                            color: '#162B49',
                            mb: 1,
                            fontFamily: 'Pretendard, sans-serif',
                            textAlign: 'center',
                            letterSpacing: '-0.02em',
                            fontSize: { xs: '1.5rem', sm: '2rem' },
                        }}
                    >
                        로그인
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: '#0D57A7',
                            mb: 4,
                            fontFamily: 'Pretendard, sans-serif',
                            textAlign: 'center',
                            fontWeight: 600,
                            letterSpacing: '-0.01em',
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                        }}
                    >
                        TUK NAVI에 오신 것을 환영합니다!
                    </Typography>

                    <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="이메일"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoComplete="username"
                            sx={{
                                mb: 2.5,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 1)',
                                    },
                                    '&.Mui-focused': {
                                        backgroundColor: 'rgba(255, 255, 255, 1)',
                                        '& fieldset': {
                                            borderColor: '#0ea5e9',
                                            borderWidth: 2,
                                        },
                                    },
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#0ea5e9',
                                },
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Email sx={{ color: '#0ea5e9' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            variant="outlined"
                            label="비밀번호"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 1)',
                                    },
                                    '&.Mui-focused': {
                                        backgroundColor: 'rgba(255, 255, 255, 1)',
                                        '& fieldset': {
                                            borderColor: '#0ea5e9',
                                            borderWidth: 2,
                                        },
                                    },
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#0ea5e9',
                                },
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock sx={{ color: '#0ea5e9' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="비밀번호 표시/숨기기"
                                            onClick={() => setShowPassword(v => !v)}
                                            edge="end"
                                            size="small"
                                            sx={{
                                                color: '#64748b',
                                                '&:hover': {
                                                    color: '#0ea5e9',
                                                },
                                            }}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <GradientButton
                            type="submit"
                            fullWidth
                            disabled={loginMutation.isLoading}
                            sx={{
                                ...commonButtonStyles,
                                mb: 2,
                                background: 'linear-gradient(45deg, #0ea5e9 0%, #3b82f6 100%)',
                                color: 'white',
                                '&:hover': {
                                    ...commonButtonStyles['&:hover'],
                                    background: 'linear-gradient(45deg, #0284c7 0%, #2563eb 100%)',
                                },
                                '&:active': {
                                    ...commonButtonStyles['&:active'],
                                    background: 'linear-gradient(45deg, #0369a1 0%, #1d4ed8 100%)',
                                },
                                '&:disabled': {
                                    background: 'linear-gradient(45deg, #94a3b8 0%, #64748b 100%)',
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    boxShadow: 'none',
                                    transform: 'none',
                                },
                            }}
                        >
                            {loginMutation.isLoading ? '로그인 중...' : '로그인'}
                        </GradientButton>

                        <Button
                            fullWidth
                            onClick={handleGoogleLogin}
                            sx={{
                                ...googleButtonStyles,
                                mb: 3,
                                position: 'relative',
                                justifyContent: 'flex-start',
                                paddingLeft: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 24,
                                    height: 24,
                                    mr: 1.5,
                                    flexShrink: 0,
                                }}
                            >
                                <img
                                    src="/images/google_icon_login.svg"
                                    alt="Google"
                                    style={{ width: 20, height: 20 }}
                                />
                            </Box>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    fontWeight: 600,
                                    fontSize: '16px',
                                    color: '#3c4043',
                                }}
                            >
                                Google 계정으로 로그인
                            </Box>
                        </Button>

                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <Typography variant="body2" sx={{ color: '#64748b', mb: 1.5 }}>
                                계정이 없으신가요?
                            </Typography>
                            <Link
                                component="button"
                                variant="body2"
                                onClick={() => navigate('/register')}
                                sx={{
                                    color: '#0ea5e9',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    fontSize: '16px',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        textDecoration: 'underline',
                                        color: '#0284c7',
                                    },
                                }}
                            >
                                회원가입
                            </Link>
                        </Box>
                    </Box>
                </GlassCard>
            </motion.div>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{
                        width: '100%',
                        borderRadius: 2,
                        fontWeight: 600,
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Login;
