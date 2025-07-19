import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RequirementCourse } from '../data/graduationRequirements';
import { setupApiInterceptors } from '../utils/apiClient';
import { authRepository, LoginDTO, RegisterDTO } from '../repositories/AuthRepository';
import { apiService } from '../services/ApiService';

import { UserProfile } from '../types/user';

interface User {
    id: string;
    userId: string; // DB와 일치하는 userId
    name: string;
    email: string;
    profile?: UserProfile;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, studentId?: string, major?: string, grade?: string | number, phone?: string) => Promise<void>;
    logout: () => Promise<void>;

    // Course management - DataContext로 이동 예정
    completedCourses: RequirementCourse[];
    addCompletedCourse: (course: RequirementCourse) => void;
    deleteCompletedCourse: (index: number) => void;
    updateCompletedCourses: (courses: RequirementCourse[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [completedCourses, setCompletedCourses] = useState<RequirementCourse[]>([]);

    // API 인터셉터 설정
    useEffect(() => {
        setupApiInterceptors();
    }, []);

    // 사용자별 데이터 초기화
    const initializeUserDataForAuth = async (email: string, userInfo?: any) => {
        try {
            // 백엔드에서 실제 프로필 정보 조회
            const { userRepository } = await import('../repositories/UserRepository');

            try {
                console.log('📡 [AuthContext] Fetching profile from backend...');
                const profileData = await userRepository.getProfile();

                console.log('✅ [AuthContext] Profile fetched from backend:', profileData);

                // Custom event로 실제 프로필 정보 전달
                window.dispatchEvent(new CustomEvent('updateUserProfile', {
                    detail: profileData
                }));

            } catch (profileError) {
                console.error('❌ [AuthContext] Failed to fetch profile from backend:', profileError);

                // 백엔드 조회 실패 시 로그인 응답에서 받은 정보로 fallback
                if (userInfo && typeof window !== 'undefined') {
                    const fallbackProfileData = {
                        userId: userInfo.userId || '',
                        name: userInfo.name || userInfo.nickname || userInfo.username || '',
                        email: email,
                        studentId: userInfo.studentId || '',
                        major: userInfo.major || '',
                        grade: userInfo.grade || 1,
                        semester: userInfo.semester || 1,
                        phone: userInfo.phone || '',
                        nickname: userInfo.nickname || userInfo.name || '',
                        interests: userInfo.interests || [],
                        avatar: userInfo.avatar || ''
                    };

                    console.log('📝 [AuthContext] Using fallback profile data:', fallbackProfileData);

                    window.dispatchEvent(new CustomEvent('updateUserProfile', {
                        detail: fallbackProfileData
                    }));
                }
            }

            console.log(`사용자 ${email}의 데이터 초기화 완료`);
        } catch (error) {
            console.error('사용자 데이터 초기화 실패:', error);
        }
    };

    // 사용자별 데이터 정리
    const clearUserData = () => {
        try {
            // 현재 사용자의 데이터만 정리 (다른 사용자 데이터는 보존)
            if (user?.email) {
                console.log(`사용자 ${user.email}의 데이터 정리 완료`);
            }
        } catch (error) {
            console.error('사용자 데이터 정리 실패:', error);
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // 토큰 확인으로 로그인 상태 판단
                const accessToken = localStorage.getItem('accessToken');
                const userEmail = localStorage.getItem('userEmail');

                if (accessToken && userEmail) {
                    // 백엔드에서 userId를 가져오는 로직 필요 (예: 토큰 디코딩 또는 profile fetch)
                    let userId = '';
                    try {
                        const { userRepository } = await import('../repositories/UserRepository');
                        const profileData = await userRepository.getProfile();
                        userId = profileData?.userId || '';
                    } catch (e) {
                        // fallback: id를 email로 대체
                        userId = userEmail;
                    }
                    const userWithProfile = {
                        id: userId,
                        userId: userId,
                        name: '사용자',
                        email: userEmail,
                        profile: {
                            name: '사용자',
                            studentId: '',
                            major: '',
                            grade: 1,
                            semester: 1
                        }
                    };
                    setUser(userWithProfile);
                    await initializeUserDataForAuth(userEmail);
                }
            } catch (error) {
                console.error('인증 초기화 실패:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (email: string, password: string) => {
        console.log('🔐 [AuthContext] Starting login for:', email);
        setIsLoading(true);
        try {
            const credentials: LoginDTO = { email, password };
            console.log('📝 [AuthContext] Calling authRepository.login');
            const response = await authRepository.login(credentials);
            console.log('✅ [AuthContext] Login response received:', {
                hasAccessToken: !!response.accessToken,
                hasRefreshToken: !!response.refreshToken,
                userId: response.user?.userId
            });

            // 기존 토큰 완전히 제거 후 새 토큰 설정
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userEmail');

            // 이전 사용자 프로필 캐시 정리 (메모리 절약)
            apiService.clearAllProfileCache();

            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            localStorage.setItem('userEmail', email);

            const user: User = {
                id: response.user.userId || response.user.email || email,
                userId: response.user.userId || '',
                name: response.user.name || response.user.nickname || email,
                email: email,
                profile: response.user
            };
            console.log('👤 [AuthContext] Setting user:', { id: user.id, name: user.name, email: user.email });
            setUser(user);

            await initializeUserDataForAuth(email, response.user);

            // 새로운 사용자 로그인 후 혹시 모를 캐시 정리 (safety)
            apiService.clearProfileCache(email);
            console.log('🎉 [AuthContext] Login complete successfully');
        } catch (error) {
            console.error('❌ [AuthContext] Login failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string, studentId?: string, major?: string, grade?: string | number, phone?: string, interests?: string[]) => {
        console.log('🚀 [AuthContext] Starting register for:', email);
        setIsLoading(true);
        try {
            // grade가 이미 숫자인 경우와 문자열인 경우를 모두 처리
            let gradeNumber: number = 1;
            if (typeof grade === 'number') {
                gradeNumber = grade;
            } else if (typeof grade === 'string') {
                gradeNumber = Number(grade.replace('학년', '')) || 1;
            }

            const dto: RegisterDTO = {
                name,
                email,
                password,
                studentId: studentId || '',
                major: major || '',
                grade: gradeNumber,
                semester: 1,
                phone,
                interests: interests || [],
            };

            console.log('📝 [AuthContext] Calling authRepository.register');
            const response = await authRepository.register(dto);
            console.log('✅ [AuthContext] Register response received:', {
                hasAccessToken: !!response.accessToken,
                hasRefreshToken: !!response.refreshToken,
                userId: response.user?.userId
            });

            // 회원가입 완료 후 로그인 상태 초기화 (자동 로그인 방지)
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userEmail');
            setUser(null);

            console.log('✅ [AuthContext] Register completed successfully (no auto-login)');
        } catch (error) {
            console.error('❌ [AuthContext] Registration failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            if (user?.email) {
                clearUserData();
            }

            // 모든 프로필 캐시 삭제 (로그아웃 시 메모리 회수)
            apiService.clearAllProfileCache();

            // 토큰 정리
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userEmail');

            setUser(null);
            setCompletedCourses([]);
            console.log('로그아웃 완료');
        } catch (error) {
            console.error('로그아웃 실패:', error);
        }
    };

    const addCompletedCourse = (course: RequirementCourse) => {
        if (!user?.email) return;
        setCompletedCourses(prev => [...prev, course]);
    };

    const deleteCompletedCourse = (index: number) => {
        if (!user?.email) return;
        setCompletedCourses(prev => prev.filter((_, i) => i !== index));
    };

    const updateCompletedCourses = (courses: RequirementCourse[]) => {
        if (!user?.email) return;
        setCompletedCourses(courses);
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        completedCourses,
        addCompletedCourse,
        deleteCompletedCourse,
        updateCompletedCourses,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 