// src/types/user.ts
// 사용자별 데이터 관리를 위한 통합 타입 시스템

export interface UserProfile {
    name: number;
    email: string;
    studentId: string;
    major: string;
    grade: number;
    semester: number;
    phone?: string;
    nickname?: string;
    interests?: string[];
    avatar?: string;
}

export interface GraduationInfo {
    totalCredits: number;
    majorRequired: number;
    majorElective: number;
    generalRequired: number;
    generalElective: number;
    totalRequired: number;
    progress: number;
    remainingCredits: number;
    // 확장 필드
    extra?: Record<string, boolean>;
    diagnosis?: any;
}

export interface Curriculum {
    type: string;
    subjects: Subject[];
    completedSubjects: string[];
    currentSemester: number;
    appliedDate?: string;
    track?: string;
}

export interface Subject {
    id: number
    name: string;
    code: string;
    credits: number;
    type: '전공필수' | '전공선택' | '교양필수' | '교양선택' | '계열기초';
    semester: number;
    grade?: string;
    completedAt?: string;
    isCompleted?: boolean;
}

export interface TimetableSlot {
    id: number;
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
    id: number;
    title: string;
    description?: string;
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
    startPeriod: number;
    endPeriod: number;
    color: string;
    isRecurring: boolean;
}

export interface Schedule {
    currentSemester: string;
    timetable: TimetableSlot[];
    customEvents: CustomEvent[];
}

export interface Note {
    id: number;
    title: string;
    content: string;
    category: string | undefined;
    tags?: string[];
    createdAt: string | undefined;
    updatedAt: string | undefined;
    isPinned?: boolean;
    isArchived?: boolean;
    order?: number;
}

export interface ChatMessage {
    id: number;
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

export interface Onboarding {
    isCompleted: boolean;
    currentStep: number;
    completedSteps: string[];
    setupDate?: string;
    interests: string[];
}

export interface UserSettings {
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
}

// 통합 사용자 데이터 인터페이스 - 모든 기능을 포함
export interface UserData {
    // 기본 프로필 정보
    profile: UserProfile;

    // 졸업 관리
    graduationInfo: GraduationInfo;

    // 커리큘럼 관리
    curriculum: Curriculum;

    // 시간표 관리
    schedule: Schedule;

    // 메모장 기능
    notes: Note[];

    // 채팅/챗봇 메시지
    messages: ChatMessage[];

    // 온보딩/설정
    onboarding: Onboarding;
    settings: UserSettings;

    // 과목 관리 (기존 호환성)
    completedCourses: Subject[];
    timetableCourses: Subject[];
    graduationRequirements: Subject[];
    courses: Subject[];

    // 추가 기능들
    favorites: string[]; // 즐겨찾기 과목 ID들
    recentSearches: string[]; // 최근 검색어
    notifications: NotificationItem[]; // 알림 내역
    statistics: UserStatistics; // 사용자 통계
}

// 알림 아이템 타입
export interface NotificationItem {
    id: number
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    timestamp: string;
    isRead: boolean;
    actionUrl?: string;
}

// 사용자 통계 타입
export interface UserStatistics {
    totalLoginCount: number;
    lastLoginDate: string;
    totalStudyTime: number; // 분 단위
    completedCoursesCount: number;
    notesCount: number;
    messagesCount: number;
    favoriteCoursesCount: number;
}

// 로컬스토리지 키 구조
export interface LocalStorageData {
    currentUser: string;
    [key: `user_${string}`]: UserData;
}

// API 응답 타입들
export interface LoginResponse {
    success: boolean;
    user?: UserProfile;
    token?: string;
    error?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// 상태 관리 타입들
export interface AuthState {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface DataState {
    userData: UserData | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: string | null;
}

// 액션 타입들
export type AuthAction =
    | { type: 'LOGIN_START' }
    | { type: 'LOGIN_SUCCESS'; payload: UserProfile }
    | { type: 'LOGIN_FAILURE'; payload: string }
    | { type: 'LOGOUT' }
    | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> };

export type DataAction =
    | { type: 'LOAD_DATA_START' }
    | { type: 'LOAD_DATA_SUCCESS'; payload: UserData }
    | { type: 'LOAD_DATA_FAILURE'; payload: string }
    | { type: 'UPDATE_GRADUATION_INFO'; payload: Partial<GraduationInfo> }
    | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
    | { type: 'UPDATE_CURRICULUM'; payload: Partial<Curriculum> }
    | { type: 'UPDATE_SCHEDULE'; payload: Partial<Schedule> }
    | { type: 'ADD_NOTE'; payload: Note }
    | { type: 'UPDATE_NOTE'; payload: { id: number; note: Partial<Note> } }
    | { type: 'DELETE_NOTE'; payload: string }
    | { type: 'ADD_MESSAGE'; payload: ChatMessage }
    | { type: 'CLEAR_MESSAGES' }
    | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> }
    | { type: 'ADD_FAVORITE'; payload: string }
    | { type: 'REMOVE_FAVORITE'; payload: string }
    | { type: 'ADD_RECENT_SEARCH'; payload: string }
    | { type: 'ADD_NOTIFICATION'; payload: NotificationItem }
    | { type: 'MARK_NOTIFICATION_READ'; payload: string }
    | { type: 'UPDATE_STATISTICS'; payload: Partial<UserStatistics> }; 