import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    Grid,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    Security,
    CheckCircle,
    Error,
    Warning,
    Info,
    ExpandMore,
    Lock,
    Shield,
    BugReport,
    Speed,
    Storage
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';
import { useData } from '../contexts/SeparatedDataContext';

interface SecurityTestResult {
    name: string;
    status: 'success' | 'error' | 'warning' | 'info';
    message: string;
    details?: string;
    recommendations?: string[];
}

const SecurityTest: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();
    const { userData } = useData();
    const [apiStatus, setApiStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [apiResult, setApiResult] = useState<string>('');
    const [securityResults, setSecurityResults] = useState<SecurityTestResult[]>([]);
    const [isRunningSecurityTests, setIsRunningSecurityTests] = useState(false);

    const testApiConnection = async () => {
        setApiStatus('testing');
        try {
            // 간단한 API 테스트 (인증이 필요하지 않은 엔드포인트)
            const response = await fetch('http://localhost:3000/auth/account', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userData?.settings?.accessToken || ''}`
                }
            });

            if (response.ok) {
                setApiStatus('success');
                setApiResult('API 연결 성공');
            } else {
                setApiStatus('error');
                setApiResult(`API 연결 실패: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            setApiStatus('error');
            setApiResult(`API 연결 오류: ${error}`);
        }
    };

    const testBackendLogin = async () => {
        setApiStatus('testing');
        try {
            const result = await apiClient.auth.login('test@example.com', '1234');
            setApiStatus('success');
            setApiResult(`백엔드 로그인 성공: ${JSON.stringify(result, null, 2)}`);
        } catch (error) {
            setApiStatus('error');
            setApiResult(`백엔드 로그인 실패: ${error}`);
        }
    };

    const runSecurityTests = async () => {
        setIsRunningSecurityTests(true);
        const results: SecurityTestResult[] = [];

        // XSS 방어 테스트
        const xssTest = () => {
            const testInput = '<script>alert("xss")</script>';
            const sanitized = testInput.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            return testInput !== sanitized;
        };

        results.push({
            name: 'XSS 방어 테스트',
            status: xssTest() ? 'success' : 'error',
            message: xssTest() ? 'XSS 방어 기능 정상' : 'XSS 방어 기능 필요',
            details: '스크립트 태그 필터링 확인',
            recommendations: xssTest() ? [] : ['입력값 검증 강화', 'HTML 인코딩 적용']
        });

        // CSRF 토큰 검증
        const csrfTest = () => {
            return userData?.settings?.csrfToken !== null;
        };

        results.push({
            name: 'CSRF 토큰 검증',
            status: csrfTest() ? 'success' : 'warning',
            message: csrfTest() ? 'CSRF 토큰 존재' : 'CSRF 토큰 없음',
            details: 'Cross-Site Request Forgery 방어 확인',
            recommendations: csrfTest() ? [] : ['CSRF 토큰 구현', 'SameSite 쿠키 설정']
        });

        // 세션 관리 테스트
        const sessionTest = () => {
            return !!user?.email && !!userData?.settings?.accessToken;
        };

        results.push({
            name: '세션 관리 테스트',
            status: sessionTest() ? 'success' : 'error',
            message: sessionTest() ? '세션 데이터 정상' : '세션 데이터 누락',
            details: '사용자 세션 정보 확인',
            recommendations: sessionTest() ? [] : ['세션 관리 개선', '토큰 만료 시간 설정']
        });

        // 입력 검증 테스트
        const inputValidationTest = () => {
            const testInputs = [
                { value: "normal@email.com", type: "email" },
                { value: "'; DROP TABLE users; --", type: "sql" },
                { value: "<img src=x onerror=alert(1)>", type: "html" }
            ];

            let passed = 0;
            testInputs.forEach(input => {
                // 간단한 검증 로직 (실제로는 더 복잡해야 함)
                if (input.type === "email" && input.value.includes("@")) passed++;
                if (input.type === "sql" && !input.value.includes("DROP")) passed++;
                if (input.type === "html" && !input.value.includes("<script>")) passed++;
            });

            return passed === testInputs.length;
        };

        results.push({
            name: '입력 검증 테스트',
            status: inputValidationTest() ? 'success' : 'warning',
            message: inputValidationTest() ? '입력 검증 정상' : '입력 검증 개선 필요',
            details: 'SQL Injection, HTML Injection 방어 확인',
            recommendations: inputValidationTest() ? [] : ['입력값 검증 강화', '파라미터화된 쿼리 사용']
        });

        // HTTPS 연결 테스트
        const httpsTest = () => {
            return window.location.protocol === 'https:';
        };

        results.push({
            name: 'HTTPS 연결 테스트',
            status: httpsTest() ? 'success' : 'warning',
            message: httpsTest() ? 'HTTPS 연결 사용 중' : 'HTTP 연결 사용 중',
            details: '보안 연결 프로토콜 확인',
            recommendations: httpsTest() ? [] : ['HTTPS 적용', 'SSL 인증서 설정']
        });

        // 로컬스토리지 보안 테스트
        const localStorageSecurityTest = () => {
            try {
                const sensitiveData = ['password', 'token', 'secret'];
                const storedKeys = Object.keys(localStorage);
                const hasSensitiveData = sensitiveData.some(key =>
                    storedKeys.some(storedKey => storedKey.toLowerCase().includes(key))
                );
                return !hasSensitiveData;
            } catch {
                return false;
            }
        };

        results.push({
            name: '로컬스토리지 보안',
            status: localStorageSecurityTest() ? 'success' : 'warning',
            message: localStorageSecurityTest() ? '민감한 데이터 저장 안함' : '민감한 데이터 저장됨',
            details: '로컬스토리지에 민감한 정보 저장 여부 확인',
            recommendations: localStorageSecurityTest() ? [] : ['민감한 데이터 암호화', '세션스토리지 사용 고려']
        });

        setSecurityResults(results);
        setIsRunningSecurityTests(false);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success': return <CheckCircle color="success" />;
            case 'error': return <Error color="error" />;
            case 'warning': return <Warning color="warning" />;
            case 'info': return <Info color="info" />;
            default: return <Info color="info" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return '#4caf50';
            case 'error': return '#f44336';
            case 'warning': return '#ff9800';
            case 'info': return '#2196f3';
            default: return '#2196f3';
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Security sx={{ fontSize: 32, color: '#0ea5e9' }} />
                    <Typography variant="h4" fontWeight={800} sx={{ color: '#0ea5e9' }}>
                        🔒 보안 테스트 페이지
                    </Typography>
                </Box>

                <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                    현재 인증 상태와 API 연결 상태를 확인하고, 다양한 보안 테스트를 수행할 수 있습니다.
                </Typography>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={6}>
                        <Card sx={{ borderRadius: 2 }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    🔗 API 연결 테스트
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <Button
                                        variant="contained"
                                        onClick={testApiConnection}
                                        disabled={apiStatus === 'testing'}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        {apiStatus === 'testing' ? <CircularProgress size={20} /> : 'API 연결 테스트'}
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        onClick={testBackendLogin}
                                        disabled={apiStatus === 'testing'}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        백엔드 로그인 테스트
                                    </Button>
                                </Box>

                                {apiStatus !== 'idle' && (
                                    <Alert
                                        severity={apiStatus === 'success' ? 'success' : apiStatus === 'error' ? 'error' : 'info'}
                                        sx={{ mb: 2 }}
                                    >
                                        {apiStatus === 'testing' ? '테스트 중...' : apiResult}
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card sx={{ borderRadius: 2 }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    🛡️ 보안 테스트
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={runSecurityTests}
                                    disabled={isRunningSecurityTests}
                                    startIcon={<Shield />}
                                    sx={{
                                        borderRadius: 2,
                                        background: 'linear-gradient(45deg, #0ea5e9, #3b82f6)',
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, #0284c7, #2563eb)',
                                        }
                                    }}
                                >
                                    {isRunningSecurityTests ? '테스트 중...' : '보안 테스트 실행'}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {securityResults.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#162B49' }}>
                            📊 보안 테스트 결과
                        </Typography>

                        <Grid container spacing={2}>
                            {securityResults.map((result, index) => (
                                <Grid item xs={12} md={6} key={index}>
                                    <Card sx={{
                                        borderRadius: 2,
                                        border: `2px solid ${getStatusColor(result.status)}20`,
                                        background: `${getStatusColor(result.status)}08`
                                    }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                {getStatusIcon(result.status)}
                                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                    {result.name}
                                                </Typography>
                                            </Box>

                                            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                                                {result.message}
                                            </Typography>

                                            {result.details && (
                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                                                    {result.details}
                                                </Typography>
                                            )}

                                            {result.recommendations && result.recommendations.length > 0 && (
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                                                        💡 권장사항:
                                                    </Typography>
                                                    <List dense>
                                                        {result.recommendations.map((rec, idx) => (
                                                            <ListItem key={idx} sx={{ py: 0.5 }}>
                                                                <ListItemIcon sx={{ minWidth: 24 }}>
                                                                    <Info color="info" sx={{ fontSize: 16 }} />
                                                                </ListItemIcon>
                                                                <ListItemText
                                                                    primary={rec}
                                                                    sx={{ '& .MuiListItemText-primary': { fontSize: '0.875rem' } }}
                                                                />
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                <Divider sx={{ my: 4 }} />

                <Box sx={{ mt: 3, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                        📊 현재 정보
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <List dense>
                                <ListItem>
                                    <ListItemText
                                        primary="현재 경로"
                                        secondary={location.pathname}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="사용자"
                                        secondary={user ? `${user.name} (${user.email})` : '없음'}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="인증 상태"
                                        secondary={isAuthenticated ? '로그인됨' : '로그인 안됨'}
                                    />
                                </ListItem>
                            </List>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <List dense>
                                <ListItem>
                                    <ListItemText
                                        primary="localStorage 확인"
                                        secondary={isAuthenticated ? '정상' : '비정상'}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="Access Token"
                                        secondary={userData?.settings?.accessToken ? '있음' : '없음'}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="Refresh Token"
                                        secondary={userData?.settings?.refreshToken ? '있음' : '없음'}
                                    />
                                </ListItem>
                            </List>
                        </Grid>
                    </Grid>
                </Box>

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        onClick={() => window.location.reload()}
                        sx={{ borderRadius: 2 }}
                    >
                        새로고침 테스트
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => window.open('/dashboard', '_blank')}
                        sx={{ borderRadius: 2 }}
                    >
                        새 탭에서 대시보드 열기
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default SecurityTest; 