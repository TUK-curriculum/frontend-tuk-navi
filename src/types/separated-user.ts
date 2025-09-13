// src/types/separated-user.ts
// 1대1 데이터 분리 구조를 위한 타입 정의

// 기본 사용자 엔티티 (인증 정보만 포함)
export interface User {
    id: number;
    email: string;
    name: string;
    createdAt: string;
    lastLoginAt?: string;
}

// 사용자 프로필 (User와 1:1)
export interface UserProfile {
    userId: number;
    name?: string;
    studentId: number | undefined;
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
    userId: number; // User.id 참조
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
    userId: number; // User.id 참조
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
    id: number;
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
    userId: number; // User.id 참조
    currentSemester: string;
    timetable: TimetableSlot[];
    customEvents: CustomEvent[];
    updatedAt: string;
}

export interface TimetableSlot {
    courseName: string;
    id: number;
    subjectId: number;
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
    id: number;
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
    userId: number; // User.id 참조
    isCompleted: boolean;
    currentStep: number;
    completedSteps: string[];
    setupDate?: string;
    interests: string[];
    updatedAt: string;
}

// 사용자 설정 (User와 1:1)
export interface UserSettings {
    userId: number; // User.id 참조
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
    userId: number; // User.id 참조
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
    id: number;
    userId?: number | undefined;
    title: string;
    content: string;
    category?: string | undefined;
    tags?: string[];
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    isPinned?: boolean;
    isArchived?: boolean;
    order?: number;
}

// 채팅 메시지 (User와 1:N)
export interface ChatMessage {
    id: number;
    userId: number; // User.id 참조
    content: string;
    sender: 'user' | 'assistant';
    timestamp: string;
    type?: 'text' | 'image' | 'file';
    metadata?: {
        courseId?: number;
        graduationInfo?: boolean;
        curriculumSuggestion?: boolean;
    };
}

// 알림 (User와 1:N)
export interface NotificationItem {
    id: number;
    userId: number; // User.id 참조
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
    userProfile: (userId: number) => `user_${userId}_profile`,
    graduationInfo: (userId: number) => `user_${userId}_graduation`,
    curriculum: (userId: number) => `user_${userId}_curriculum`,
    schedule: (userId: number) => `user_${userId}_schedule`,
    onboarding: (userId: number) => `user_${userId}_onboarding`,
    settings: (userId: number) => `user_${userId}_settings`,
    statistics: (userId: number) => `user_${userId}_statistics`,

    // 1:N 관계 엔티티들
    notes: (userId: number) => `user_${userId}_notes`,
    messages: (userId: number) => `user_${userId}_messages`,
    notifications: (userId: number) => `user_${userId}_notifications`,

    // 기존 호환성을 위한 배열 데이터
    courses: (userId: number) => `user_${userId}_courses`,
    completedCourses: (userId: number) => `user_${userId}_completedCourses`,
    timetableCourses: (userId: number) => `user_${userId}_timetableCourses`,
    graduationRequirements: (userId: number) => `user_${userId}_graduationRequirements`,
    favorites: (userId: number) => `user_${userId}_favorites`,
    recentSearches: (userId: number) => `user_${userId}_recentSearches`,
};

// 기본값 생성 함수들
export const createDefaultUserProfile = (userId: number): UserProfile => ({
    userId,
    studentId: Date.now(),
    major: '',
    grade: 1,
    semester: 1,
    phone: '',
    nickname: '',
    interests: [],
    avatar: '',
    updatedAt: new Date().toISOString()
});

export const createDefaultGraduationInfo = (userId: number): GraduationInfo => ({
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

export const createDefaultCurriculum = (userId: number): Curriculum => ({
    userId,
    type: '',
    subjects: [],
    completedSubjects: [],
    currentSemester: 1,
    appliedDate: '',
    track: '',
    updatedAt: new Date().toISOString()
});

export const createDefaultSchedule = (userId: number): Schedule => ({
    userId,
    currentSemester: '',
    timetable: [],
    customEvents: [],
    updatedAt: new Date().toISOString()
});

export const createDefaultOnboarding = (userId: number): Onboarding => ({
    userId,
    isCompleted: false,
    currentStep: 0,
    completedSteps: [],
    setupDate: new Date().toISOString(),
    interests: [],
    updatedAt: new Date().toISOString()
});

export const createDefaultSettings = (userId: number): UserSettings => ({
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

export const createDefaultStatistics = (userId: number): UserStatistics => ({
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

export interface Course {
    id: number;
    name: string;
    code: string;
    instructor: string;
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
    startPeriod: number;
    endPeriod: number;
    startTime: string;
    endTime: string;
    room: string;
}
