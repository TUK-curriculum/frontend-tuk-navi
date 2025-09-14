// src/pages/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithSocial } = useAuth(); // login 함수만 사용

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const userInfo = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      navigate('/login?error=' + error);
      return;
    }

    if (accessToken && refreshToken && userInfo) {
      try {
        const user = JSON.parse(decodeURIComponent(userInfo));
        
        loginWithSocial(user, accessToken, refreshToken);

        if (!user.major || !user.studentId || user.grade === null) {
          navigate('/setup/academic');
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login?error=callback_failed');
      }
    }
  }, [searchParams, navigate, loginWithSocial]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        gap: 2,
      }}
    >
      <CircularProgress size={60} thickness={4} />
      <Typography variant="h6" color="textSecondary">
        로그인 처리 중...
      </Typography>
      <Typography variant="body2" color="textSecondary">
        잠시만 기다려주세요.
      </Typography>
    </Box>
  );
};

export default AuthCallback;