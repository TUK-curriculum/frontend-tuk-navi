import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    background: 'linear-gradient(135deg, #e0f2ff 0%, #f3e8ff 100%)',
                }}
            >
                <CircularProgress size={60} sx={{ color: '#0ea5e9' }} />
            </Box>
        );
    }

    if (!isAuthenticated) {
        // 로그인 후 원래 가려던 페이지로 리다이렉트하기 위해 현재 경로를 저장
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute; 