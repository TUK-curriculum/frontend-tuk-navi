import { getUserInfo } from './userStorage';

// 인증 상태 확인
export const checkAuthStatus = (): boolean => {
    console.warn('checkAuthStatus는 더 이상 사용되지 않습니다. useAuth를 사용하세요.');
    return false;
};

// 세션 확인 (임시 구현)
export const checkSession = (userEmail: string): boolean => {
    console.warn('checkSession는 더 이상 사용되지 않습니다. useAuth를 사용하세요.');
    // 임시로 항상 true 반환 (실제로는 JWT/쿠키 검증 필요)
    return true;
};

// 보호된 경로인지 확인
export const isProtectedPath = (pathname: string): boolean => {
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

    return protectedPaths.some(path => pathname.startsWith(path));
};

// 로그아웃 처리
export const performLogout = (): void => {
    console.warn('performLogout는 더 이상 사용되지 않습니다. useAuth를 사용하세요.');
};

// 사용자 정보 가져오기
export const getCurrentUser = () => {
    console.warn('getCurrentUser는 더 이상 사용되지 않습니다. useAuth를 사용하세요.');
    return null;
}; 