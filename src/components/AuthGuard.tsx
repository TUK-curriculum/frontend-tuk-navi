import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AuthGuardProps {
    children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [showLoading, setShowLoading] = useState(false);

    // 보호된 경로들
    const protectedPaths = [
        '/dashboard',
        '/curriculum',
        '/schedule',
        '/chatbot',
        '/profile',
        '/graduation',
        '/users',
        '/course',
        '/security-test',
        '/testpage',
        '/profile-setup'
    ];

    // 현재 경로가 보호된 경로인지 확인
    const isProtectedPath = protectedPaths.some(path =>
        location.pathname.startsWith(path)
    );

    // 지연된 로딩 스피너
    useEffect(() => {
        if (isLoading) {
            const timer = setTimeout(() => setShowLoading(true), 300);
            return () => clearTimeout(timer);
        } else {
            setShowLoading(false);
        }
    }, [isLoading]);

    useEffect(() => {
        // 로딩 중이 아니고, 인증되지 않았으며, 보호된 경로에 있다면
        if (!isLoading && !isAuthenticated && isProtectedPath) {
            console.log('AuthGuard: 인증되지 않은 사용자가 보호된 경로에 접근 시도');
            navigate('/login', {
                state: { from: location },
                replace: true
            });
        }
    }, [isAuthenticated, isLoading, location, navigate, isProtectedPath]);

    // 디버깅을 위한 로그
    useEffect(() => {
        console.log('AuthGuard 상태:', {
            isAuthenticated,
            isLoading,
            currentPath: location.pathname,
            isProtectedPath
        });
    }, [isAuthenticated, isLoading, location.pathname, isProtectedPath]);

    // 로딩 중이면 로딩 화면 표시
    if (isLoading && showLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                transition: 'all 0.3s ease-in-out'
            }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    border: '4px solid #e2e8f0',
                    borderTop: '4px solid #0ea5e9',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
                <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        );
    }

    return <>{children}</>;
};

export default AuthGuard; 