import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserData, UserProfile, GraduationInfo, Curriculum, Schedule, Note, ChatMessage, Onboarding, UserSettings, Subject, NotificationItem, UserStatistics, TimetableSlot } from '../types/user';

// 기본 사용자 데이터 생성 함수 (로컬 구현)
const getDefaultUserData = (): UserData => {
    return {
        profile: {
            name: '',
            email: '',
            studentId: '',
            major: '',
            grade: 1,
            semester: 1,
            phone: '',
            nickname: '',
            interests: [],
            avatar: ''
        },
        graduationInfo: {
            totalCredits: 0,
            majorRequired: 0,
            majorElective: 0,
            generalRequired: 0,
            generalElective: 0,
            totalRequired: 130,
            progress: 0,
            remainingCredits: 130
        },
        curriculum: {
            type: '',
            subjects: [],
            completedSubjects: [],
            currentSemester: 1,
            appliedDate: '',
            track: ''
        },
        schedule: {
            currentSemester: '',
            timetable: [],
            customEvents: []
        },
        notes: [],
        messages: [],
        onboarding: {
            isCompleted: false,
            currentStep: 0,
            completedSteps: [],
            setupDate: new Date().toISOString(),
            interests: []
        },
        settings: {
            theme: 'light',
            notifications: true,
            autoSave: true,
            language: 'ko',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            accessibility: {
                highContrast: false,
                reduceMotion: false,
                fontSize: 'medium'
            }
        },
        courses: [],
        completedCourses: [],
        timetableCourses: [],
        graduationRequirements: [],
        favorites: [],
        recentSearches: [],
        notifications: [],
        statistics: {
            totalLoginCount: 0,
            lastLoginDate: new Date().toISOString(),
            totalStudyTime: 0,
            completedCoursesCount: 0,
            notesCount: 0,
            messagesCount: 0,
            favoriteCoursesCount: 0
        }
    };
};

// 사용자 데이터 관련 로컬 함수들
const getUserData = (): UserData => {
    try {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) return getDefaultUserData();

        const userData = localStorage.getItem(`user_${currentUser}`);
        if (!userData) return getDefaultUserData();

        return JSON.parse(userData);
    } catch (error) {
        console.error('사용자 데이터 로드 실패:', error);
        return getDefaultUserData();
    }
};

const updateUserField = (field: string, value: any): void => {
    try {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) return;

        const userData = getUserData();
        const updatedData = { ...userData, [field]: value };
        localStorage.setItem(`user_${currentUser}`, JSON.stringify(updatedData));
    } catch (error) {
        console.error('사용자 데이터 업데이트 실패:', error);
    }
};

const updateLoginStatistics = (): void => {
    try {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) return;

        const userData = getUserData();
        const updatedStats = {
            ...userData.statistics,
            totalLoginCount: userData.statistics.totalLoginCount + 1,
            lastLoginDate: new Date().toISOString()
        };
        updateUserField('statistics', updatedStats);
    } catch (error) {
        console.error('로그인 통계 업데이트 실패:', error);
    }
};

// DataProvider 인터페이스 정의
interface IDataProvider {
    initializeData: () => any;
    getCourses: () => Promise<Subject[]>;
    addCourse: (course: Subject) => Promise<void>;
    updateCourse: (course: Subject) => Promise<void>;
    removeCourse: (courseId: string) => Promise<void>;
    getCompletedCourses: () => Promise<Subject[]>;
    addCompletedCourse: (course: Subject) => Promise<void>;
    updateCompletedCourse: (course: Subject) => Promise<void>;
    removeCompletedCourse: (courseId: string) => Promise<void>;
    getTimetableCourses: () => Promise<Subject[]>;
    addTimetableCourse: (course: Subject) => Promise<void>;
    updateTimetableCourse: (course: Subject) => Promise<void>;
    removeTimetableCourse: (courseId: string) => Promise<void>;
    getGraduationRequirements: () => Promise<Subject[]>;
    addGraduationRequirement: (course: Subject) => Promise<void>;
    updateGraduationRequirement: (course: Subject) => Promise<void>;
    removeGraduationRequirement: (courseId: string) => Promise<void>;
}

// 통합된 DataContext 타입 정의
interface DataContextType {
    // 기본 데이터
    userData: UserData | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: string | null;

    // 데이터 새로고침
    refreshData: () => void;

    // 프로필 관리
    profile: UserProfile;
    updateProfile: (profile: Partial<UserProfile>) => void;

    // 졸업 정보 관리
    graduationInfo: GraduationInfo;
    updateGraduationInfo: (info: Partial<GraduationInfo>) => void;

    // 커리큘럼 관리
    curriculum: Curriculum;
    updateCurriculum: (curriculum: Partial<Curriculum>) => void;

    // 시간표 관리
    schedule: Schedule;
    updateSchedule: (schedule: Partial<Schedule>) => void;

    // 메모 관리
    notes: Note[];
    addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateNote: (id: number, note: Partial<Note>) => void;
    deleteNote: (id: number) => void;

    // 채팅 메시지 관리
    messages: ChatMessage[];
    addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
    clearMessages: () => void;

    // 온보딩 관리
    onboarding: Onboarding;
    updateOnboarding: (onboarding: Partial<Onboarding>) => void;

    // 설정 관리
    settings: UserSettings;
    updateSettings: (settings: Partial<UserSettings>) => void;

    // 과목 관리 (기존 호환성)
    courses: Subject[];
    completedCourses: Subject[];
    timetableCourses: Subject[];
    graduationRequirements: Subject[];

    // 과목 관련 메서드들 (기존 호환성)
    addCourse: (course: Subject) => Promise<void>;
    updateCourse: (course: Subject) => Promise<void>;
    removeCourse: (courseId: string) => Promise<void>;
    addCompletedCourse: (course: Subject) => Promise<void>;
    updateCompletedCourse: (course: Subject) => Promise<void>;
    removeCompletedCourse: (courseId: string) => Promise<void>;
    addTimetableCourse: (course: Subject) => Promise<void>;
    updateTimetableCourse: (course: Subject) => Promise<void>;
    removeTimetableCourse: (courseId: string) => Promise<void>;

    // 새로운 기능들
    favorites: string[];
    addToFavorites: (courseId: string) => void;
    removeFromFavorites: (courseId: string) => void;
    isFavorite: (courseId: string) => boolean;

    recentSearches: string[];
    addRecentSearch: (searchTerm: string) => void;
    clearRecentSearches: () => void;

    notifications: NotificationItem[];
    addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => void;
    markNotificationAsRead: (notificationId: string) => void;
    clearNotifications: () => void;

    statistics: UserStatistics;
    updateStatistics: (updates: Partial<UserStatistics>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
    children: ReactNode;
    provider?: IDataProvider;
    currentUserEmail?: string; // AuthContext에서 전달받을 사용자 이메일
}

export const DataProviderComponent: React.FC<DataProviderProps> = ({
    children,
    currentUserEmail
}) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    let timer: ReturnType<typeof setTimeout>; 

    /* -------------------------------------------------------------------
        currentUserEmail이 바뀔 때마다 사용자별 데이터 재로딩
    ------------------------------------------------------------------- */
    useEffect(() => {
        const loadUserData = async () => {
            if (!currentUserEmail) {
                setUserData(null);
                setIsLoading(false);
                return;
            }

            try {
                // 로딩 상태를 더 부드럽게 처리
                timer = setTimeout(() => setIsLoading(true), 100);

                console.log(`사용자 ${currentUserEmail}의 데이터 로드 시작`);

                const data = getUserData();
                setUserData(data);

                // 로그인 통계 업데이트
                updateLoginStatistics();

                console.log(`사용자 ${currentUserEmail}의 데이터 로드 완료`);
            } catch (error) {
                console.error('사용자 데이터 로드 실패:', error);
            } finally {
                if (timer) clearTimeout(timer);
                setIsLoading(false);
            }
        };

        loadUserData();

    }, [currentUserEmail]);

    // 통합 데이터 메서드들
    const refreshData = useCallback(() => {
        try {
            const data = getUserData();
            setUserData(data);
            setLastUpdated(new Date().toISOString());
            setError(null);
        } catch (error) {
            console.error('데이터 새로고침 실패:', error);
            setError('데이터 로드에 실패했습니다.');
        }
    }, []);

    // 프로필 관리
    const updateProfile = useCallback((profile: Partial<UserProfile>) => {
        if (!userData) return;
        const updatedData = { ...userData, profile: { ...userData.profile, ...profile } };
        setUserData(updatedData);
        updateUserField('profile', updatedData.profile);
    }, [userData]);

    // 졸업 정보 관리
    const updateGraduationInfo = useCallback((info: Partial<GraduationInfo>) => {
        if (!userData) return;
        const updatedData = { ...userData, graduationInfo: { ...userData.graduationInfo, ...info } };
        setUserData(updatedData);
        updateUserField('graduationInfo', updatedData.graduationInfo);
    }, [userData]);

    // 커리큘럼 관리
    const updateCurriculum = useCallback((curriculum: Partial<Curriculum>) => {
        if (!userData) return;
        const updatedData = { ...userData, curriculum: { ...userData.curriculum, ...curriculum } };
        setUserData(updatedData);
        updateUserField('curriculum', updatedData.curriculum);
    }, [userData]);

    // 시간표 관리
    const updateSchedule = useCallback((schedule: Partial<Schedule>) => {
        if (!userData) return;
        const updatedData = { ...userData, schedule: { ...userData.schedule, ...schedule } };
        setUserData(updatedData);
        updateUserField('schedule', updatedData.schedule);
    }, [userData]);

    // 메모 관리
    const addNote = useCallback((note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (!userData) return;
        const newNote: Note = {
            ...note,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const updatedNotes = [...userData.notes, newNote];
        const updatedData = { ...userData, notes: updatedNotes };
        setUserData(updatedData);
        updateUserField('notes', updatedNotes);

        // 통계 업데이트
        const updatedStats = { ...userData.statistics, notesCount: updatedNotes.length };
        updateUserField('statistics', updatedStats);
    }, [userData]);

    const updateNote = useCallback((id: number, note: Partial<Note>) => {
        if (!userData) return;
        const updatedNotes = userData.notes.map(n =>
            n.id === id ? { ...n, ...note, updatedAt: new Date().toISOString() } : n
        );
        const updatedData = { ...userData, notes: updatedNotes };
        setUserData(updatedData);
        updateUserField('notes', updatedNotes);
    }, [userData]);

    const deleteNote = useCallback((id: number) => {
        if (!userData) return;
        const updatedNotes = userData.notes.filter(n => n.id !== id);
        const updatedData = { ...userData, notes: updatedNotes };
        setUserData(updatedData);
        updateUserField('notes', updatedNotes);

        // 통계 업데이트
        const updatedStats = { ...userData.statistics, notesCount: updatedNotes.length };
        updateUserField('statistics', updatedStats);
    }, [userData]);

    // 채팅 메시지 관리
    const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
        if (!userData) return;
        const newMessage: ChatMessage = {
            ...message,
            id: Date.now().toString(),
            timestamp: new Date().toISOString()
        };
        const updatedMessages = [...userData.messages, newMessage];
        const updatedData = { ...userData, messages: updatedMessages };
        setUserData(updatedData);
        updateUserField('messages', updatedMessages);

        // 통계 업데이트
        const updatedStats = { ...userData.statistics, messagesCount: updatedMessages.length };
        updateUserField('statistics', updatedStats);
    }, [userData]);

    const clearMessages = useCallback(() => {
        if (!userData) return;
        const updatedData = { ...userData, messages: [] };
        setUserData(updatedData);
        updateUserField('messages', []);

        // 통계 업데이트
        const updatedStats = { ...userData.statistics, messagesCount: 0 };
        updateUserField('statistics', updatedStats);
    }, [userData]);

    // 온보딩 관리
    const updateOnboarding = useCallback((onboarding: Partial<Onboarding>) => {
        console.log('[DataContext] updateOnboarding 호출:', onboarding);
        console.log('[DataContext] 현재 userData:', userData);

        if (!userData) {
            console.warn('[DataContext] userData가 없어서 온보딩 업데이트 실패');
            return;
        }

        const updatedData = { ...userData, onboarding: { ...userData.onboarding, ...onboarding } };
        console.log('[DataContext] 업데이트된 데이터:', updatedData);

        setUserData(updatedData);
        updateUserField('onboarding', updatedData.onboarding);
        console.log('[DataContext] 온보딩 데이터 저장 완료');
    }, [userData]);

    // 설정 관리
    const updateSettings = useCallback((settings: Partial<UserSettings>) => {
        if (!userData) return;
        const updatedData = { ...userData, settings: { ...userData.settings, ...settings } };
        setUserData(updatedData);
        updateUserField('settings', updatedData.settings);
    }, [userData]);

    // 즐겨찾기 관리
    const handleAddToFavorites = useCallback((courseId: string) => {
        if (!userData) return;
        // 실제 즐겨찾기 로직은 로컬 스토리지에 저장
        const updatedFavorites = [...userData.favorites, courseId];
        const updatedData = { ...userData, favorites: updatedFavorites };
        setUserData(updatedData);
        updateUserField('favorites', updatedFavorites);
    }, [userData]);

    const handleRemoveFromFavorites = useCallback((courseId: string) => {
        if (!userData) return;
        // 실제 즐겨찾기 로직은 로컬 스토리지에서 제거
        const updatedFavorites = userData.favorites.filter(id => id !== courseId);
        const updatedData = { ...userData, favorites: updatedFavorites };
        setUserData(updatedData);
        updateUserField('favorites', updatedFavorites);
    }, [userData]);

    const isFavorite = useCallback((courseId: string) => {
        return userData?.favorites.includes(courseId) || false;
    }, [userData]);

    // 최근 검색어 관리
    const handleAddRecentSearch = useCallback((searchTerm: string) => {
        if (!userData) return;
        // 실제 최근 검색어 로직은 로컬 스토리지에 저장
        const filtered = userData.recentSearches.filter(term => term !== searchTerm);
        const updatedSearches = [searchTerm, ...filtered].slice(0, 10);
        const updatedData = { ...userData, recentSearches: updatedSearches };
        setUserData(updatedData);
        updateUserField('recentSearches', updatedSearches);
    }, [userData]);

    const clearRecentSearches = useCallback(() => {
        if (!userData) return;
        // 실제 최근 검색어 로직은 로컬 스토리지에서 제거
        const updatedData = { ...userData, recentSearches: [] };
        setUserData(updatedData);
        updateUserField('recentSearches', []);
    }, [userData]);

    // 알림 관리
    const handleAddNotification = useCallback((notification: Omit<NotificationItem, 'id' | 'timestamp'>) => {
        if (!userData) return;
        // 실제 알림 로직은 로컬 스토리지에 저장
        const newNotification: NotificationItem = {
            ...notification,
            id: Date.now().toString(),
            timestamp: new Date().toISOString()
        };
        const updatedNotifications = [newNotification, ...userData.notifications].slice(0, 50);
        const updatedData = { ...userData, notifications: updatedNotifications };
        setUserData(updatedData);
        updateUserField('notifications', updatedNotifications);
    }, [userData]);

    const handleMarkNotificationAsRead = useCallback((notificationId: string) => {
        if (!userData) return;
        // 실제 알림 읽음 처리는 로컬 스토리지에서 수행
        const updatedNotifications = userData.notifications.map(n =>
            n.id === notificationId ? { ...n, isRead: true } : n
        );
        const updatedData = { ...userData, notifications: updatedNotifications };
        setUserData(updatedData);
        updateUserField('notifications', updatedNotifications);
    }, [userData]);

    const clearNotifications = useCallback(() => {
        if (!userData) return;
        // 실제 알림 로직은 로컬 스토리지에서 제거
        const updatedData = { ...userData, notifications: [] };
        setUserData(updatedData);
        updateUserField('notifications', []);
    }, [userData]);

    // 통계 관리
    const updateStatistics = useCallback((updates: Partial<UserStatistics>) => {
        if (!userData) return;
        // 실제 통계 업데이트는 로컬 스토리지에서 수행
        const updatedStats = { ...userData.statistics, ...updates };
        const updatedData = { ...userData, statistics: updatedStats };
        setUserData(updatedData);
        updateUserField('statistics', updatedStats);
    }, [userData]);

    // 기존 과목 관리 메서드들 (호환성 유지)
    const refreshCourses = async () => {
        if (!userData) return;
        const updatedData = { ...userData };
        setUserData(updatedData);
    };

    const addCourse = async (course: Subject) => {
        if (!userData) return;
        const updatedCourses = [...userData.courses, course];
        const updatedData = { ...userData, courses: updatedCourses };
        setUserData(updatedData);
        updateUserField('courses', updatedCourses);
    };

    const updateCourse = async (course: Subject) => {
        if (!userData) return;
        const updatedCourses = userData.courses.map(c => c.id === course.id ? course : c);
        const updatedData = { ...userData, courses: updatedCourses };
        setUserData(updatedData);
        updateUserField('courses', updatedCourses);
    };

    const removeCourse = async (courseId: string) => {
        if (!userData) return;
        const updatedCourses = userData.courses.filter(c => c.id !== courseId);
        const updatedData = { ...userData, courses: updatedCourses };
        setUserData(updatedData);
        updateUserField('courses', updatedCourses);
    };

    const refreshCompletedCourses = async () => {
        if (!userData) return;
        const updatedData = { ...userData };
        setUserData(updatedData);
    };

    const addCompletedCourse = async (course: Subject) => {
        if (!userData) return;
        const updatedCourses = [...userData.completedCourses, course];
        const updatedData = { ...userData, completedCourses: updatedCourses };
        setUserData(updatedData);
        updateUserField('completedCourses', updatedCourses);

        // 통계 업데이트
        const updatedStats = { ...userData.statistics, completedCoursesCount: updatedCourses.length };
        updateUserField('statistics', updatedStats);
    };

    const updateCompletedCourse = async (course: Subject) => {
        if (!userData) return;
        const updatedCourses = userData.completedCourses.map(c => c.id === course.id ? course : c);
        const updatedData = { ...userData, completedCourses: updatedCourses };
        setUserData(updatedData);
        updateUserField('completedCourses', updatedCourses);
    };

    const removeCompletedCourse = async (courseId: string) => {
        if (!userData) return;
        const updatedCourses = userData.completedCourses.filter(c => c.id !== courseId);
        const updatedData = { ...userData, completedCourses: updatedCourses };
        setUserData(updatedData);
        updateUserField('completedCourses', updatedCourses);

        // 통계 업데이트
        const updatedStats = { ...userData.statistics, completedCoursesCount: updatedCourses.length };
        updateUserField('statistics', updatedStats);
    };

    const refreshTimetableCourses = async () => {
        if (!userData) return;
        const updatedData = { ...userData };
        setUserData(updatedData);
    };

    const addTimetableCourse = async (course: Subject) => {
        if (!userData) return;
        const updatedCourses = [...userData.timetableCourses, course];
        const updatedData = { ...userData, timetableCourses: updatedCourses };
        setUserData(updatedData);
        updateUserField('timetableCourses', updatedCourses);
    };

    const updateTimetableCourse = async (course: Subject) => {
        if (!userData) return;
        const updatedCourses = userData.timetableCourses.map(c => c.id === course.id ? course : c);
        const updatedData = { ...userData, timetableCourses: updatedCourses };
        setUserData(updatedData);
        updateUserField('timetableCourses', updatedCourses);
    };

    const removeTimetableCourse = async (courseId: string) => {
        if (!userData) return;
        const updatedCourses = userData.timetableCourses.filter(c => c.id !== courseId);
        const updatedData = { ...userData, timetableCourses: updatedCourses };
        setUserData(updatedData);
        updateUserField('timetableCourses', updatedCourses);
    };

    const refreshGraduationRequirements = async () => {
        if (!userData) return;
        const updatedData = { ...userData };
        setUserData(updatedData);
    };

    const getCurriculums = async (): Promise<Subject[]> => {
        return userData?.courses || [];
    };

    const addCurriculum = async (curriculum: Subject): Promise<void> => {
        await addCourse(curriculum);
    };

    const getSchedule = async (semester: string): Promise<Subject[]> => {
        return userData?.timetableCourses || [];
    };

    const saveSchedule = async (semester: string, courses: Subject[]): Promise<void> => {
        if (!userData) return;
        const updatedData = { ...userData, timetableCourses: courses };
        setUserData(updatedData);
        updateUserField('timetableCourses', courses);
    };

    const applyCurriculum = async (curriculum: Subject): Promise<void> => {
        await addCourse(curriculum);
    };

    const contextValue: DataContextType = {
        // 기본 데이터
        userData,
        isLoading,
        error,
        lastUpdated,

        // 데이터 새로고침
        refreshData,

        // 프로필 관리
        profile: userData?.profile || {
            name: '',
            email: '',
            studentId: '',
            major: '',
            grade: 1,
            semester: 1,
            phone: '',
            nickname: '',
            interests: [],
            avatar: ''
        },
        updateProfile,

        // 졸업 정보 관리
        graduationInfo: userData?.graduationInfo || {
            totalCredits: 0,
            majorRequired: 0,
            majorElective: 0,
            generalRequired: 0,
            generalElective: 0,
            totalRequired: 130,
            progress: 0,
            remainingCredits: 130
        },
        updateGraduationInfo,

        // 커리큘럼 관리
        curriculum: userData?.curriculum || {
            type: '',
            subjects: [],
            completedSubjects: [],
            currentSemester: 1,
            appliedDate: '',
            track: ''
        },
        updateCurriculum,

        // 시간표 관리
        schedule: userData?.schedule || {
            currentSemester: '',
            timetable: [],
            customEvents: []
        },
        updateSchedule,

        // 메모 관리
        notes: userData?.notes || [],
        addNote,
        updateNote,
        deleteNote,

        // 채팅 메시지 관리
        messages: userData?.messages || [],
        addMessage,
        clearMessages,

        // 온보딩 관리
        onboarding: userData?.onboarding || {
            isCompleted: false,
            currentStep: 0,
            completedSteps: [],
            setupDate: new Date().toISOString(),
            interests: []
        },
        updateOnboarding,

        // 설정 관리
        settings: userData?.settings || {
            theme: 'light',
            notifications: true,
            autoSave: true,
            language: 'ko',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            accessibility: {
                highContrast: false,
                reduceMotion: false,
                fontSize: 'medium'
            }
        },
        updateSettings,

        // 과목 관리 (기존 호환성)
        courses: userData?.courses || [],
        completedCourses: userData?.completedCourses || [],
        timetableCourses: userData?.timetableCourses || [],
        graduationRequirements: userData?.graduationRequirements || [],

        // 과목 관련 메서드들 (기존 호환성)
        addCourse,
        updateCourse,
        removeCourse,
        addCompletedCourse,
        updateCompletedCourse,
        removeCompletedCourse,
        addTimetableCourse,
        updateTimetableCourse,
        removeTimetableCourse,

        // 새로운 기능들
        favorites: userData?.favorites || [],
        addToFavorites: handleAddToFavorites,
        removeFromFavorites: handleRemoveFromFavorites,
        isFavorite,

        recentSearches: userData?.recentSearches || [],
        addRecentSearch: handleAddRecentSearch,
        clearRecentSearches,

        notifications: userData?.notifications || [],
        addNotification: handleAddNotification,
        markNotificationAsRead: handleMarkNotificationAsRead,
        clearNotifications,

        statistics: userData?.statistics || {
            totalLoginCount: 0,
            lastLoginDate: new Date().toISOString(),
            totalStudyTime: 0,
            completedCoursesCount: 0,
            notesCount: 0,
            messagesCount: 0,
            favoriteCoursesCount: 0
        },
        updateStatistics
    };

    return (
        <DataContext.Provider value={contextValue}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

export const useCurriculum = () => {
    const { curriculum, updateCurriculum } = useData();
    return { curriculum, updateCurriculum };
};

export const useSchedule = (semester: string) => {
    const { schedule, updateSchedule, isLoading } = useData();

    const loadSchedule = async () => {
        // 현재는 로컬 데이터만 사용
        return schedule.timetable;
    };

    const saveSchedule = async (newCourses: TimetableSlot[]) => {
        const updatedSchedule = {
            ...schedule,
            currentSemester: semester,
            timetable: newCourses
        };
        updateSchedule(updatedSchedule);
    };

    // courses와 isLoading 반환 추가
    return {
        schedule,
        courses: schedule.timetable || [],
        isLoading,
        loadSchedule,
        saveSchedule
    };
}; 