// src/types/separated-user.ts
// 1대1 데이터 분리 구조를 위한 타입 정의

// 기본 사용자 엔티티 (인증 정보만 포함)
export interface User {
    id: string; // 사용자 고유 ID (email 사용)
    email: string;
    name: string;
    createdAt: string;
    lastLoginAt?: string;
}

// 사용자 프로필 (User와 1:1)
export interface UserProfile {
    userId: string; // User.id 참조
    studentId: string;
    major: string;
    grade: number;
    semester: number;
    phone?: string;
    nickname?: string;
    interests?: string[];
    avatar?: string;
    updatedAt: string;
}

// 졸업 정보 (User와 1:1)
export interface GraduationInfo {
    userId: string; // User.id 참조
    totalCredits: number;
    majorRequired: number;
    majorElective: number;
    generalRequired: number;
    generalElective: number;
    totalRequired: number;
    progress: number;
    remainingCredits: number;
    extra?: Record<string, boolean>;
    diagnosis?: any;
    updatedAt: string;
}

// 커리큘럼 (User와 1:1)
export interface Curriculum {
    userId: string; // User.id 참조
    type: string;
    subjects: Subject[];
    completedSubjects: string[];
    currentSemester: number;
    appliedDate?: string;
    track?: string;
    updatedAt: string;
}

// 과목 정의
export interface Subject {
    id: string;
    name: string;
    code: string;
    credits: number;
    type: '전공필수' | '전공선택' | '교양필수' | '교양선택' | '계열기초';
    semester: number;
    grade?: string;
    completedAt?: string;
    isCompleted?: boolean;
}

// 시간표 정보 (User와 1:1)
export interface Schedule {
    userId: string; // User.id 참조
    currentSemester: string;
    timetable: TimetableSlot[];
    customEvents: CustomEvent[];
    updatedAt: string;
}

export interface TimetableSlot {
    id: string;
    subjectId: string;
    subjectName: string;
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
    startPeriod: number;
    endPeriod: number;
    startTime: string;
    endTime: string;
    room: string;
    instructor: string;
    color?: string;
}

export interface CustomEvent {
    id: string;
    title: string;
    description?: string;
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
    startPeriod: number;
    endPeriod: number;
    color: string;
    isRecurring: boolean;
}

// 온보딩 정보 (User와 1:1)
export interface Onboarding {
    userId: string; // User.id 참조
    isCompleted: boolean;
    currentStep: number;
    completedSteps: string[];
    setupDate?: string;
    interests: string[];
    updatedAt: string;
}

// 사용자 설정 (User와 1:1)
export interface UserSettings {
    userId: string; // User.id 참조
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    autoSave: boolean;
    language: 'ko' | 'en';
    timezone: string;
    accessibility: {
        highContrast: boolean;
        reduceMotion: boolean;
        fontSize: 'small' | 'medium' | 'large';
    };
    pinnedSemester?: string;
    accessToken?: string;
    refreshToken?: string;
    csrfToken?: string;
    updatedAt: string;
}

// 사용자 통계 (User와 1:1)
export interface UserStatistics {
    userId: string; // User.id 참조
    totalLoginCount: number;
    lastLoginDate: string;
    totalStudyTime: number; // 분 단위
    completedCoursesCount: number;
    notesCount: number;
    messagesCount: number;
    favoriteCoursesCount: number;
    updatedAt: string;
}

// 메모 (User와 1:N)
export interface Note {
    id: string;
    userId: string; // User.id 참조
    title: string;
    content: string;
    category: string;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
    isPinned?: boolean;
}

// 채팅 메시지 (User와 1:N)
export interface ChatMessage {
    id: string;
    userId: string; // User.id 참조
    content: string;
    sender: 'user' | 'assistant';
    timestamp: string;
    type?: 'text' | 'image' | 'file';
    metadata?: {
        courseId?: string;
        graduationInfo?: boolean;
        curriculumSuggestion?: boolean;
    };
}

// 알림 (User와 1:N)
export interface NotificationItem {
    id: string;
    userId: string; // User.id 참조
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    timestamp: string;
    isRead: boolean;
    actionUrl?: string;
}

// localStorage 키 생성 함수들
export const StorageKeys = {
    // 현재 사용자
    currentUser: () => 'currentUser',

    // 1:1 관계 엔티티들
    userProfile: (userId: string) => `user_${userId}_profile`,
    graduationInfo: (userId: string) => `user_${userId}_graduation`,
    curriculum: (userId: string) => `user_${userId}_curriculum`,
    schedule: (userId: string) => `user_${userId}_schedule`,
    onboarding: (userId: string) => `user_${userId}_onboarding`,
    settings: (userId: string) => `user_${userId}_settings`,
    statistics: (userId: string) => `user_${userId}_statistics`,

    // 1:N 관계 엔티티들
    notes: (userId: string) => `user_${userId}_notes`,
    messages: (userId: string) => `user_${userId}_messages`,
    notifications: (userId: string) => `user_${userId}_notifications`,

    // 기존 호환성을 위한 배열 데이터
    courses: (userId: string) => `user_${userId}_courses`,
    completedCourses: (userId: string) => `user_${userId}_completedCourses`,
    timetableCourses: (userId: string) => `user_${userId}_timetableCourses`,
    graduationRequirements: (userId: string) => `user_${userId}_graduationRequirements`,
    favorites: (userId: string) => `user_${userId}_favorites`,
    recentSearches: (userId: string) => `user_${userId}_recentSearches`,
};

// 기본값 생성 함수들
export const createDefaultUserProfile = (userId: string): UserProfile => ({
    userId,
    studentId: '',
    major: '',
    grade: 1,
    semester: 1,
    phone: '',
    nickname: '',
    interests: [],
    avatar: '',
    updatedAt: new Date().toISOString()
});

export const createDefaultGraduationInfo = (userId: string): GraduationInfo => ({
    userId,
    totalCredits: 0,
    majorRequired: 0,
    majorElective: 0,
    generalRequired: 0,
    generalElective: 0,
    totalRequired: 130,
    progress: 0,
    remainingCredits: 130,
    extra: {},
    diagnosis: {},
    updatedAt: new Date().toISOString()
});

export const createDefaultCurriculum = (userId: string): Curriculum => ({
    userId,
    type: '',
    subjects: [],
    completedSubjects: [],
    currentSemester: 1,
    appliedDate: '',
    track: '',
    updatedAt: new Date().toISOString()
});

export const createDefaultSchedule = (userId: string): Schedule => ({
    userId,
    currentSemester: '',
    timetable: [],
    customEvents: [],
    updatedAt: new Date().toISOString()
});

export const createDefaultOnboarding = (userId: string): Onboarding => ({
    userId,
    isCompleted: false,
    currentStep: 0,
    completedSteps: [],
    setupDate: new Date().toISOString(),
    interests: [],
    updatedAt: new Date().toISOString()
});

export const createDefaultSettings = (userId: string): UserSettings => ({
    userId,
    theme: 'light',
    notifications: true,
    autoSave: true,
    language: 'ko',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    accessibility: {
        highContrast: false,
        reduceMotion: false,
        fontSize: 'medium'
    },
    updatedAt: new Date().toISOString()
});

export const createDefaultStatistics = (userId: string): UserStatistics => ({
    userId,
    totalLoginCount: 0,
    lastLoginDate: new Date().toISOString(),
    totalStudyTime: 0,
    completedCoursesCount: 0,
    notesCount: 0,
    messagesCount: 0,
    favoriteCoursesCount: 0,
    updatedAt: new Date().toISOString()
}); 