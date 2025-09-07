// src/contexts/SeparatedDataContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Course, DayKey, CourseType } from '../types/course';
import { useAuth } from '../contexts/AuthContext';
import { BackendNote } from '../services/ApiService';
import {
    UserProfile,
    GraduationInfo,
    Curriculum,
    Schedule,
    Onboarding,
    UserSettings,
    UserStatistics,
    Note,
    ChatMessage,
    NotificationItem,
    Subject
} from '../types/separated-user';

import {
    getCurrentUserId,
    getUserProfile,
    updateUserProfile,
    getGraduationInfo,
    updateGraduationInfo,
    getCurriculum,
    updateCurriculum,
    getSchedule,
    updateSchedule,
    getOnboarding,
    updateOnboarding,
    getUserSettings,
    updateUserSettings,
    getUserStatistics,
    updateUserStatistics,
    getNotes,
    addNote as addNoteToStorage,
    updateNote as updateNoteInStorage,
    deleteNote as deleteNoteFromStorage,
    getMessages,
    addMessage as addMessageToStorage,
    clearMessages as clearMessagesFromStorage,
    getNotifications,
    addNotification as addNotificationToStorage,
    markNotificationAsRead as markNotificationAsReadInStorage,
    clearNotifications as clearNotificationsFromStorage,
    getCourses,
    saveCourses,
    getCompletedCourses,
    saveCompletedCourses,
    getTimetableCourses,
    saveTimetableCourses,
    getGraduationRequirements,
    saveGraduationRequirements,
    getFavorites,
    addToFavorites as addToFavoritesInStorage,
    removeFromFavorites as removeFromFavoritesInStorage,
    getRecentSearches,
    addRecentSearch as addRecentSearchToStorage,
    saveRecentSearches,
    checkAndMigrateLegacyUserData,
    updateLoginStatistics
} from '../utils/separatedDataManager';

const convertBackendNoteToNote = (backendNote: BackendNote, fallbackUserId: string): Note => ({
    ...backendNote,
    userId: backendNote.userId || fallbackUserId
});

let timer: ReturnType<typeof setTimeout>; 


// ==== 타입 정의 ====
interface SeparatedDataContextType {
    userData: any;
    isLoading: boolean;
    error: string | null;
    lastUpdated: string | null;
    refreshData: () => void;
    profile: UserProfile;
    updateProfile: (profile: Partial<UserProfile>) => void;
    updateUserData: (data: any) => void;
    updateUserField: (field: string, value: any) => void;
    graduationInfo: GraduationInfo;
    updateGraduationInfo: (info: Partial<GraduationInfo>) => void;
    curriculum: Curriculum;
    updateCurriculum: (curriculum: Partial<Curriculum>) => void;
    getCurriculums: () => Promise<Course[]>;
    addCurriculum: (curriculum: Course) => Promise<void>;
    applyCurriculum: (curriculum: Course) => Promise<void>;
    schedule: Schedule;
    updateSchedule: (schedule: Partial<Schedule>) => void;
    notes: Note[];
    addNote: (note: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<Note | null>;
    updateNote: (id: string, note: Partial<Note>) => Promise<Note | null>;
    deleteNote: (id: string) => Promise<boolean>;
    messages: ChatMessage[];
    addMessage: (message: Omit<ChatMessage, 'id' | 'userId' | 'timestamp'>) => void;
    clearMessages: () => void;
    onboarding: Onboarding;
    updateOnboarding: (onboarding: Partial<Onboarding>) => void;
    settings: UserSettings;
    updateSettings: (settings: Partial<UserSettings>) => void;
    courses: Subject[];
    completedCourses: Subject[];
    timetableCourses: Subject[];
    graduationRequirements: Subject[];
    addCourse: (course: Subject) => Promise<void>;
    updateCourse: (course: Subject) => Promise<void>;
    removeCourse: (courseId: string) => Promise<void>;
    addCompletedCourse: (course: Subject) => Promise<void>;
    updateCompletedCourse: (course: Subject) => Promise<void>;
    removeCompletedCourse: (courseId: string) => Promise<void>;
    addTimetableCourse: (course: Subject) => Promise<void>;
    updateTimetableCourse: (course: Subject) => Promise<void>;
    removeTimetableCourse: (courseId: string) => Promise<void>;
    favorites: string[];
    addToFavorites: (courseId: string) => void;
    removeFromFavorites: (courseId: string) => void;
    isFavorite: (courseId: string) => boolean;
    recentSearches: string[];
    addRecentSearch: (searchTerm: string) => void;
    clearRecentSearches: () => void;
    notifications: NotificationItem[];
    addNotification: (notification: Omit<NotificationItem, 'id' | 'userId' | 'timestamp'>) => void;
    markNotificationAsRead: (notificationId: string) => void;
    clearNotifications: () => void;
    statistics: UserStatistics;
    updateStatistics: (updates: Partial<UserStatistics>) => void;
}

// === Context 생성 ===
const SeparatedDataContext = createContext<SeparatedDataContextType | undefined>(undefined);

interface SeparatedDataProviderProps {
    children: ReactNode;
    currentUserEmail?: string;
}

export const SeparatedDataProvider: React.FC<SeparatedDataProviderProps> = ({
    children,
    currentUserEmail
}) => {
    const { user } = useAuth();
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    // 분리된 데이터 상태들
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [graduationInfo, setGraduationInfo] = useState<GraduationInfo | null>(null);
    const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
    const [schedule, setSchedule] = useState<Schedule | null>(null);
    const [onboarding, setOnboarding] = useState<Onboarding | null>(null);
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [statistics, setStatistics] = useState<UserStatistics | null>(null);
    // 1. notes 상태 및 CRUD를 API 기반으로만 관리
    const [notes, setNotes] = useState<Note[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [courses, setCourses] = useState<Subject[]>([]);
    const [completedCourses, setCompletedCourses] = useState<Subject[]>([]);
    const [timetableCourses, setTimetableCourses] = useState<Subject[]>([]);
    const [graduationRequirements, setGraduationRequirements] = useState<Subject[]>([]);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    // 2. notes 불러오기 (항상 백엔드)
    useEffect(() => {
        // user가 null이거나, userId/email이 준비 안 됐으면 notes를 비움
        if (!user || (!currentUserId && !user.email)) {
            setNotes([]);
            return;
        }
        const fetchNotes = async () => {
            try {
                const { apiService } = await import('../services/ApiService');
                const notesFromApi = await apiService.getNotes();
                const convertedNotes = notesFromApi.map(note => 
                    convertBackendNoteToNote(note, currentUserId || user?.email || '')
                );
                setNotes(convertedNotes);
            } catch (error) {
                setNotes([]);
            }
        };
        fetchNotes();
    }, [user, currentUserId, user?.email]);

    // 3. notes 추가
    const addNote = useCallback(async (note: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Note | null> => {
        if (!currentUserId && !user?.email) return null;
        try {
            const { apiService } = await import('../services/ApiService');
            // 모든 속성 지원: title, content, category, tags, pinned, archived, order 등
            const newNote = await apiService.addNote(note);
            if (newNote && newNote.id) {
                // 반드시 백엔드에서 getNotes()로 동기화
                const notesFromApi = await apiService.getNotes();
                const convertedNotes = notesFromApi.map(note => 
                    convertBackendNoteToNote(note, currentUserId || user?.email || '')
                );
                setNotes(convertedNotes);
                console.log('[addNote] notes after add:', notesFromApi.map(n => ({ id: n.id, title: n.title })));
                
                
                const convertedNewNote = convertBackendNoteToNote(newNote, currentUserId || user?.email || '');
                return convertedNewNote;
            }
            // 실패 시 notes를 갱신하지 않음
            console.warn('[addNote] Failed to add note or missing id:', newNote);
            return null;
        } catch (error) {
            console.error('[addNote] Error:', error);
            return null;
        }
    }, [currentUserId, user]);

    // 4. notes 수정
    const updateNote = useCallback(async (id: string, updates: Partial<Note>): Promise<Note | null> => {
        if (!currentUserId && !user?.email) return null;
        try {
            const { apiService } = await import('../services/ApiService');
            // 모든 속성 지원: title, content, category, tags, pinned, archived, order 등
            const payload = {
                ...updates,
                pinned: updates.isPinned,
                archived: updates.isArchived,
                order: updates.order,
            };
            const updatedNote = await apiService.updateNote(id, payload);
            if (updatedNote) {
                // 최신 notes 동기화
                const notesFromApi = await apiService.getNotes();
                const convertedNotes = notesFromApi.map(note => 
                    convertBackendNoteToNote(note, currentUserId || user?.email || '')
                );
                setNotes(convertedNotes);
                console.log('[updateNote] notes after update:', notesFromApi.map(n => ({ id: n.id, title: n.title })));

                const convertedUpdatedNote = convertBackendNoteToNote(updatedNote, currentUserId || user?.email || '');
                return convertedUpdatedNote;
            }
            return null;
        } catch (error) {
            console.error('[updateNote] Error:', error);
            return null;
        }
    }, [currentUserId, user]);

    // 5. notes 삭제
    const deleteNote = useCallback(async (id: string): Promise<boolean> => {
        if (!currentUserId && !user?.email) return false;
        try {
            const { apiService } = await import('../services/ApiService');
            const success = await apiService.deleteNote(id);
            if (success) {
                // 최신 notes 동기화
                const notesFromApi = await apiService.getNotes();
                const convertedNotes = notesFromApi.map(note => 
                    convertBackendNoteToNote(note, currentUserId || user?.email || '')
                );
                setNotes(convertedNotes);
                console.log('[deleteNote] notes after delete:', notesFromApi.map(n => ({ id: n.id, title: n.title })));
            }
            return success;
        } catch (error) {
            console.error('[deleteNote] Error:', error);
            return false;
        }
    }, [currentUserId, user]);

    // 사용자 변경 시 데이터 로드
    useEffect(() => {
        const loadUserData = async () => {
            if (!currentUserEmail) {
                setCurrentUserId(null);
                setIsLoading(false);
                return;
            }

            try {
                timer = setTimeout(() => setIsLoading(true), 100);

                console.log(`사용자 ${currentUserEmail}의 분리된 데이터 로드 시작`);

                // 기존 데이터 마이그레이션 확인 및 실행
                checkAndMigrateLegacyUserData(currentUserEmail);

                setCurrentUserId(currentUserEmail);

                // 백엔드 API로부터 데이터 로드
                const { apiService } = await import('../services/ApiService');

                let userProfile, userNotes, userNotifications, userTimetable, userRecords;

                try {
                    // 병렬로 백엔드 데이터 조회
                    const [profileResult, notesResult, notificationsResult, timetableResult, recordsResult] = await Promise.allSettled([
                        apiService.getProfile(),
                        apiService.getNotes(),
                        apiService.getNotifications(),
                        apiService.getCurrentTimetable(),
                        apiService.getRecords()
                    ]);

                    userProfile = profileResult.status === 'fulfilled' ? profileResult.value : getUserProfile(currentUserEmail);
                    userNotes = notesResult.status === 'fulfilled' ? notesResult.value : getNotes(currentUserEmail);
                    userNotifications = notificationsResult.status === 'fulfilled' ? notificationsResult.value : getNotifications(currentUserEmail);
                    userTimetable = timetableResult.status === 'fulfilled' ? timetableResult.value : null;
                    userRecords = recordsResult.status === 'fulfilled' ? recordsResult.value : [];

                    console.log('[SeparatedDataContext] Backend data loaded successfully');
                } catch (backendError) {
                    console.warn('[SeparatedDataContext] Backend data loading failed, falling back to localStorage:', backendError);

                    // 백엔드 실패 시 localStorage fallback
                    userProfile = getUserProfile(currentUserEmail);
                    userNotes = getNotes(currentUserEmail);
                    userNotifications = getNotifications(currentUserEmail);
                }

                // 나머지는 localStorage에서 로드 (점진적 이관)
                const userGraduationInfo = getGraduationInfo(currentUserEmail);
                const userCurriculum = getCurriculum(currentUserEmail);
                const userSchedule = getSchedule(currentUserEmail);
                const userOnboarding = getOnboarding(currentUserEmail);
                const userSettings = getUserSettings(currentUserEmail);
                const userStatistics = getUserStatistics(currentUserEmail);
                const userMessages = getMessages(currentUserEmail);
                const userCourses = getCourses(currentUserEmail);
                const userCompletedCourses = getCompletedCourses(currentUserEmail);
                const userTimetableCourses = getTimetableCourses(currentUserEmail);
                const userGraduationRequirements = getGraduationRequirements(currentUserEmail);
                const userFavorites = getFavorites(currentUserEmail);
                const userRecentSearches = getRecentSearches(currentUserEmail);

                // 상태 업데이트
                setProfile(userProfile as UserProfile | null);
                setGraduationInfo(userGraduationInfo);
                setCurriculum(userCurriculum);
                setSchedule(userSchedule);
                setOnboarding(userOnboarding);
                setSettings(userSettings);
                setStatistics(userStatistics);
                setNotes(userNotes as Note[]);
                setMessages(userMessages);
                setNotifications(userNotifications as NotificationItem[]);
                setCourses(userCourses);
                setCompletedCourses(userCompletedCourses);
                setTimetableCourses(userTimetableCourses);
                setGraduationRequirements(userGraduationRequirements);
                setFavorites(userFavorites);
                setRecentSearches(userRecentSearches);

                // 로그인 통계 업데이트
                updateLoginStatistics(currentUserEmail);

                console.log(`사용자 ${currentUserEmail}의 분리된 데이터 로드 완료`);
                setError(null);

            } catch (error) {
                console.error('분리된 데이터 로드 실패:', error);
                setError('데이터 로드에 실패했습니다.');
            } finally {
                if (timer) clearTimeout(timer);
                setIsLoading(false);
            }
        };

        loadUserData();

        // AuthContext에서 프로필 업데이트 이벤트 리스너
        const handleProfileUpdate = (event: CustomEvent) => {
            if (currentUserEmail && currentUserId) {
                console.log('[SeparatedDataContext] Received profile update event:', event.detail);
                // 직접 updateUserProfile 함수 호출
                const updated = updateUserProfile(currentUserId, event.detail);
                setProfile(updated);
            }
        };

        window.addEventListener('updateUserProfile', handleProfileUpdate as EventListener);

        return () => {
            window.removeEventListener('updateUserProfile', handleProfileUpdate as EventListener);
        };
    }, [currentUserEmail, currentUserId]);

    // 데이터 새로고침
    const refreshData = useCallback(() => {
        if (!currentUserId) return;

        try {
            const userProfile = getUserProfile(currentUserId);
            const userGraduationInfo = getGraduationInfo(currentUserId);
            const userCurriculum = getCurriculum(currentUserId);
            const userSchedule = getSchedule(currentUserId);
            const userOnboarding = getOnboarding(currentUserId);
            const userSettings = getUserSettings(currentUserId);
            const userStatistics = getUserStatistics(currentUserId);
            const userNotes = getNotes(currentUserId);
            const userMessages = getMessages(currentUserId);
            const userNotifications = getNotifications(currentUserId);
            const userCourses = getCourses(currentUserId);
            const userCompletedCourses = getCompletedCourses(currentUserId);
            const userTimetableCourses = getTimetableCourses(currentUserId);
            const userGraduationRequirements = getGraduationRequirements(currentUserId);
            const userFavorites = getFavorites(currentUserId);
            const userRecentSearches = getRecentSearches(currentUserId);

            setProfile(userProfile);
            setGraduationInfo(userGraduationInfo);
            setCurriculum(userCurriculum);
            setSchedule(userSchedule);
            setOnboarding(userOnboarding);
            setSettings(userSettings);
            setStatistics(userStatistics);
            setNotes(userNotes);
            setMessages(userMessages);
            setNotifications(userNotifications);
            setCourses(userCourses);
            setCompletedCourses(userCompletedCourses);
            setTimetableCourses(userTimetableCourses);
            setGraduationRequirements(userGraduationRequirements);
            setFavorites(userFavorites);
            setRecentSearches(userRecentSearches);

            setLastUpdated(new Date().toISOString());
            setError(null);
        } catch (error) {
            console.error('데이터 새로고침 실패:', error);
            setError('데이터 새로고침에 실패했습니다.');
        }
    }, [currentUserId]);

    // 프로필 관리
    const handleUpdateProfile = useCallback(async (updates: Partial<UserProfile>) => {
        if (!currentUserId) return;

        try {
            const updated = updateUserProfile(currentUserId, updates);
            setProfile(updated);

            if (updates.name || updates.phone || updates.major) {
                const { userRepository } = await import('../repositories/UserRepository');

                const backendUpdates: any = {};
                if (updates.name) backendUpdates.username = updates.name;
                if (updates.phone) backendUpdates.phone = updates.phone;
                if (updates.major) backendUpdates.major = updates.major;

                try {
                    await userRepository.updateProfile(backendUpdates);
                    console.log('[SeparatedDataContext] Profile synced to backend');
                } catch (error) {
                    console.warn('[SeparatedDataContext] Failed to sync profile to backend:', error);
                    // 백엔드 업데이트 실패해도 로컬 상태는 유지
                }
            }
        } catch (error) {
            console.error('[SeparatedDataContext] Failed to update profile:', error);
        }
    }, [currentUserId]);

    // 졸업 정보 관리
    const handleUpdateGraduationInfo = useCallback((updates: Partial<GraduationInfo>) => {
        if (!currentUserId) return;
        const updated = updateGraduationInfo(currentUserId, updates);
        setGraduationInfo(updated);
    }, [currentUserId]);

    // 커리큘럼 관리
    const handleUpdateCurriculum = useCallback((updates: Partial<Curriculum>) => {
        if (!currentUserId) return;
        const updated = updateCurriculum(currentUserId, updates);
        setCurriculum(updated);
    }, [currentUserId]);


    const defaultSchedule: Schedule = schedule || {
        userId: currentUserId || '',
        currentSemester: '',
        timetable: [],
        customEvents: [],
        updatedAt: new Date().toISOString()
    };


    const updateUserField = (field: string, value: any) => {
        if (!currentUserEmail) return;

        switch (field) {
            case 'profile':
                if (profile) {
                    handleUpdateProfile({ ...profile, ...value });
                }
                break;
            case 'graduationInfo':
                if (graduationInfo) {
                    handleUpdateGraduationInfo({ ...graduationInfo, ...value });
                }
                break;
            case 'curriculum':
                if (curriculum) {
                    handleUpdateCurriculum({ ...curriculum, ...value });
                }
                break;
            case 'schedule':
                if (schedule) {
                    handleUpdateSchedule({ ...schedule, ...value });
                }
                break;
            case 'onboarding':
                if (onboarding) {
                    handleUpdateOnboarding({ ...onboarding, ...value });
                }
                break;
            case 'settings':
                if (settings) {
                    handleUpdateSettings({ ...settings, ...value });
                }
                break;
            case 'statistics':
                if (statistics) {
                    handleUpdateStatistics({ ...statistics, ...value });
                }
                break;
            default:
                console.warn(`Unknown field: ${field}`);
        }
    };

    // 시간표 관리
    const handleUpdateSchedule = useCallback(async (scheduleUpdate: Partial<Schedule>) => {
        console.log('[handleUpdateSchedule] 호출됨!');
        console.log('[handleUpdateSchedule] 입력 데이터:', scheduleUpdate);
        
        const updatedSchedule = { 
            userId: user?.email || '',
            currentSemester: scheduleUpdate.currentSemester || '',
            timetable: scheduleUpdate.timetable || [],
            customEvents: scheduleUpdate.customEvents || [],
            updatedAt: new Date().toISOString()
        };
        
        console.log('[handleUpdateSchedule] 최종 schedule:', updatedSchedule);
        console.log('[handleUpdateSchedule] timetable 개수:', updatedSchedule.timetable?.length);
        
        setSchedule(updatedSchedule);
        console.log('[handleUpdateSchedule] 완료! 백엔드 API만 사용합니다.');
    }, [user?.email]);

    // 온보딩 관리
    const handleUpdateOnboarding = useCallback((updates: Partial<Onboarding>) => {
        if (!currentUserId) return;
        const updated = updateOnboarding(currentUserId, updates);
        setOnboarding(updated);
    }, [currentUserId]);

    // 설정 관리
    const handleUpdateSettings = useCallback((updates: Partial<UserSettings>) => {
        if (!currentUserId) return;
        const updated = updateUserSettings(currentUserId, updates);
        setSettings(updated);
    }, [currentUserId]);

    // 통계 관리
    const handleUpdateStatistics = useCallback((updates: Partial<UserStatistics>) => {
        if (!currentUserId) return;
        const updated = updateUserStatistics(currentUserId, updates);
        setStatistics(updated);
    }, [currentUserId]);

    // 메시지 관리
    const handleAddMessage = useCallback((message: Omit<ChatMessage, 'id' | 'userId' | 'timestamp'>) => {
        if (!currentUserId) return;
        const newMessage = addMessageToStorage(currentUserId, message);
        setMessages(prev => [...prev, newMessage]);
        // 통계 업데이트
        setStatistics(prev => {
            if (!prev) return prev;
            const updatedStats = updateUserStatistics(currentUserId, { messagesCount: messages.length + 1 });
            return updatedStats;
        });
    }, [currentUserId, messages.length]);

    const handleClearMessages = useCallback(() => {
        if (!currentUserId) return;
        clearMessagesFromStorage(currentUserId);
        setMessages([]);
        // 통계 업데이트
        setStatistics(prev => {
            if (!prev) return prev;
            const updatedStats = updateUserStatistics(currentUserId, { messagesCount: 0 });
            return updatedStats;
        });
    }, [currentUserId]);

    // 알림 관리
    const handleAddNotification = useCallback((notification: Omit<NotificationItem, 'id' | 'userId' | 'timestamp'>) => {
        if (!currentUserId) return;
        const newNotification = addNotificationToStorage(currentUserId, notification);
        setNotifications(prev => [newNotification, ...prev].slice(0, 50));
    }, [currentUserId]);

    const handleMarkNotificationAsRead = useCallback((notificationId: string) => {
        if (!currentUserId) return;
        const success = markNotificationAsReadInStorage(currentUserId, notificationId);
        if (success) {
            setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
        }
    }, [currentUserId]);

    const handleClearNotifications = useCallback(() => {
        if (!currentUserId) return;
        clearNotificationsFromStorage(currentUserId);
        setNotifications([]);
    }, [currentUserId]);

    // 즐겨찾기 관리
    const handleAddToFavorites = useCallback((courseId: string) => {
        if (!currentUserId) return;
        addToFavoritesInStorage(currentUserId, courseId);
        setFavorites(prev => [...prev, courseId]);
        // 통계 업데이트
        setStatistics(prev => {
            if (!prev) return prev;
            const updatedStats = updateUserStatistics(currentUserId, { favoriteCoursesCount: favorites.length + 1 });
            return updatedStats;
        });
    }, [currentUserId, favorites.length]);

    const handleRemoveFromFavorites = useCallback((courseId: string) => {
        if (!currentUserId) return;
        removeFromFavoritesInStorage(currentUserId, courseId);
        setFavorites(prev => prev.filter(id => id !== courseId));
        // 통계 업데이트
        setStatistics(prev => {
            if (!prev) return prev;
            const updatedStats = updateUserStatistics(currentUserId, { favoriteCoursesCount: favorites.length - 1 });
            return updatedStats;
        });
    }, [currentUserId, favorites.length]);

    const isFavorite = useCallback((courseId: string) => {
        return favorites.includes(courseId);
    }, [favorites]);

    // 최근 검색어 관리
    const handleAddRecentSearch = useCallback((searchTerm: string) => {
        if (!currentUserId) return;
        addRecentSearchToStorage(currentUserId, searchTerm);
        const filtered = recentSearches.filter(term => term !== searchTerm);
        const updated = [searchTerm, ...filtered].slice(0, 10);
        setRecentSearches(updated);
    }, [currentUserId, recentSearches]);

    const handleClearRecentSearches = useCallback(() => {
        if (!currentUserId) return;
        saveRecentSearches(currentUserId, []);
        setRecentSearches([]);
    }, [currentUserId]);

    // 과목 관리 (기존 호환성)
    const handleAddCourse = useCallback(async (course: Subject) => {
        if (!currentUserId) return;
        const updated = [...courses, course];
        saveCourses(currentUserId, updated);
        setCourses(updated);
    }, [currentUserId, courses]);

    const handleUpdateCourse = useCallback(async (course: Subject) => {
        if (!currentUserId) return;
        const updated = courses.map(c => c.id === course.id ? course : c);
        saveCourses(currentUserId, updated);
        setCourses(updated);
    }, [currentUserId, courses]);

    const handleRemoveCourse = useCallback(async (courseId: string) => {
        if (!currentUserId) return;
        const updated = courses.filter(c => c.id !== courseId);
        saveCourses(currentUserId, updated);
        setCourses(updated);
    }, [currentUserId, courses]);

    const handleAddCompletedCourse = useCallback(async (course: Subject) => {
        if (!currentUserId) return;
        const updated = [...completedCourses, course];
        saveCompletedCourses(currentUserId, updated);
        setCompletedCourses(updated);
    }, [currentUserId, completedCourses]);

    const handleUpdateCompletedCourse = useCallback(async (course: Subject) => {
        if (!currentUserId) return;
        const updated = completedCourses.map(c => c.id === course.id ? course : c);
        saveCompletedCourses(currentUserId, updated);
        setCompletedCourses(updated);
    }, [currentUserId, completedCourses]);

    const handleRemoveCompletedCourse = useCallback(async (courseId: string) => {
        if (!currentUserId) return;
        const updated = completedCourses.filter(c => c.id !== courseId);
        saveCompletedCourses(currentUserId, updated);
        setCompletedCourses(updated);
    }, [currentUserId, completedCourses]);

    const handleAddTimetableCourse = useCallback(async (course: Subject) => {
        if (!currentUserId) return;
        const updated = [...timetableCourses, course];
        saveTimetableCourses(currentUserId, updated);
        setTimetableCourses(updated);
    }, [currentUserId, timetableCourses]);

    const handleUpdateTimetableCourse = useCallback(async (course: Subject) => {
        if (!currentUserId) return;
        const updated = timetableCourses.map(c => c.id === course.id ? course : c);
        saveTimetableCourses(currentUserId, updated);
        setTimetableCourses(updated);
    }, [currentUserId, timetableCourses]);

    const handleRemoveTimetableCourse = useCallback(async (courseId: string) => {
        if (!currentUserId) return;
        const updated = timetableCourses.filter(c => c.id !== courseId);
        saveTimetableCourses(currentUserId, updated);
        setTimetableCourses(updated);
    }, [currentUserId, timetableCourses]);

    // 호환성을 위한 추가 메서드들
    const updateUserData = (data: any) => {
        if (!currentUserEmail) return;

        // 분리된 데이터 구조에서는 개별 엔티티별로 업데이트
        if (data.profile && profile) {
            handleUpdateProfile({ ...profile, ...data.profile });
        }
        if (data.graduationInfo && graduationInfo) {
            handleUpdateGraduationInfo({ ...graduationInfo, ...data.graduationInfo });
        }
        if (data.curriculum && curriculum) {
            handleUpdateCurriculum({ ...curriculum, ...data.curriculum });
        }
        if (data.schedule && schedule) {
            handleUpdateSchedule({ ...schedule, ...data.schedule });
        }
        if (data.onboarding && onboarding) {
            handleUpdateOnboarding({ ...onboarding, ...data.onboarding });
        }
        if (data.settings && settings) {
            handleUpdateSettings({ ...settings, ...data.settings });
        }
        if (data.statistics && statistics) {
            handleUpdateStatistics({ ...statistics, ...data.statistics });
        }
    };


    // 커리큘럼 관리 메서드들
    /**
     * 현재 Context 가 보유한 커리큘럼(course) 목록을 안전하게 가져온다.
     * `curriculum` 은 타입 상 courses 속성이 없지만, 동적으로 주입해 사용한다.
     */
    const getCurrentCourses = (): Course[] => {
        return (curriculum as any)?.courses ?? [];
    };

    const getCurriculums = async (): Promise<Course[]> => {
        // 기존 구조와 호환성을 위해 Promise 형태 유지
        return getCurrentCourses();
    };

    const addCurriculum = async (newCourse: Course): Promise<void> => {
        const updatedSubjects = [...(curriculum?.subjects || []), newCourse as any];
        handleUpdateCurriculum({
            subjects: updatedSubjects,
            updatedAt: new Date().toISOString()
        });
    };

    const applyCurriculum = async (curriculum: Course): Promise<void> => {
        const subject: Subject = {
            id: curriculum.id,
            name: curriculum.name,
            code: curriculum.code,
            credits: 0,
            type: '전공선택',
            semester: 1,
        };
        await handleAddTimetableCourse(subject);
    };

    // 기본값들 (로딩 중이거나 데이터가 없을 때 사용)
    const defaultProfile: UserProfile = profile || {
        userId: currentUserId || '',
        studentId: '',
        major: '',
        grade: 1,
        semester: 1,
        updatedAt: new Date().toISOString()
    };

    const defaultGraduationInfo: GraduationInfo = graduationInfo || {
        userId: currentUserId || '',
        totalCredits: 0,
        majorRequired: 0,
        majorElective: 0,
        generalRequired: 0,
        generalElective: 0,
        totalRequired: 130,
        progress: 0,
        remainingCredits: 130,
        updatedAt: new Date().toISOString()
    };

    const defaultCurriculum: Curriculum = curriculum || {
        userId: currentUserId || '',
        type: '',
        subjects: [],
        completedSubjects: [],
        currentSemester: 1,
        updatedAt: new Date().toISOString()
    };

    const defaultOnboarding: Onboarding = onboarding || {
        userId: currentUserId || '',
        isCompleted: false,
        currentStep: 0,
        completedSteps: [],
        interests: [],
        updatedAt: new Date().toISOString()
    };

    const defaultSettings: UserSettings = settings || {
        userId: currentUserId || '',
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
    };

    const defaultStatistics: UserStatistics = statistics || {
        userId: currentUserId || '',
        totalLoginCount: 0,
        lastLoginDate: new Date().toISOString(),
        totalStudyTime: 0,
        completedCoursesCount: 0,
        notesCount: 0,
        messagesCount: 0,
        favoriteCoursesCount: 0,
        updatedAt: new Date().toISOString()
    };

    // Aggregated legacy-friendly userData object (keeps older components working)
    const aggregatedUserData = {
        profile: defaultProfile,
        graduationInfo: defaultGraduationInfo,
        curriculum: defaultCurriculum,
        schedule: defaultSchedule,
        onboarding: defaultOnboarding,
        settings: defaultSettings,
        statistics: defaultStatistics,
        courses,
        completedCourses,
        timetableCourses,
        graduationRequirements,
        favorites,
        recentSearches,
        notifications,
    };

    // Context value useMemo에 user, notes, addNote, updateNote, deleteNote 포함
    const contextValue = useMemo(() => ({
        // 기본 데이터
        userData: aggregatedUserData,
        isLoading,
        error,
        lastUpdated,

        // 데이터 새로고침
        refreshData,

        // 프로필 관리
        profile: defaultProfile,
        updateProfile: handleUpdateProfile,
        updateUserData,
        updateUserField,

        // 졸업 정보 관리
        graduationInfo: defaultGraduationInfo,
        updateGraduationInfo: handleUpdateGraduationInfo,

        // 커리큘럼 관리
        curriculum: defaultCurriculum,
        updateCurriculum: handleUpdateCurriculum,
        getCurriculums,
        addCurriculum,
        applyCurriculum,

        // 시간표 관리
        schedule: defaultSchedule,
        updateSchedule: handleUpdateSchedule,

        // 메모 관리
        notes,
        addNote: addNote,
        updateNote: updateNote,
        deleteNote: deleteNote,

        // 채팅 메시지 관리
        messages,
        addMessage: handleAddMessage,
        clearMessages: handleClearMessages,

        // 온보딩 관리
        onboarding: defaultOnboarding,
        updateOnboarding: handleUpdateOnboarding,

        // 설정 관리
        settings: defaultSettings,
        updateSettings: handleUpdateSettings,

        // 과목 관리 (기존 호환성)
        courses,
        completedCourses,
        timetableCourses,
        graduationRequirements,
        addCourse: handleAddCourse,
        updateCourse: handleUpdateCourse,
        removeCourse: handleRemoveCourse,
        addCompletedCourse: handleAddCompletedCourse,
        updateCompletedCourse: handleUpdateCompletedCourse,
        removeCompletedCourse: handleRemoveCompletedCourse,
        addTimetableCourse: handleAddTimetableCourse,
        updateTimetableCourse: handleUpdateTimetableCourse,
        removeTimetableCourse: handleRemoveTimetableCourse,

        // 새로운 기능들
        favorites,
        addToFavorites: handleAddToFavorites,
        removeFromFavorites: handleRemoveFromFavorites,
        isFavorite,

        recentSearches,
        addRecentSearch: handleAddRecentSearch,
        clearRecentSearches: handleClearRecentSearches,

        notifications,
        addNotification: handleAddNotification,
        markNotificationAsRead: handleMarkNotificationAsRead,
        clearNotifications: handleClearNotifications,

        statistics: defaultStatistics,
        updateStatistics: handleUpdateStatistics,
        user,
    }), [notes, addNote, updateNote, deleteNote, user]);

    return (
        <SeparatedDataContext.Provider value={contextValue}>
            {children}
        </SeparatedDataContext.Provider>
    );
};

const mapBackendToCourse = (slot: any): Course => {
    console.log('[DEBUG] mapBackendToCourse 입력:', slot);
    
    const lectureCode = slot.LectureCode?.code || slot.codeId?.toString() || slot.code_id?.toString() || '';

    const convertDayOfWeek = (backendDay: string): DayKey => {
        const dayMap: Record<string, DayKey> = {
            'MON': 'monday',
            'TUE': 'tuesday', 
            'WED': 'wednesday',
            'THU': 'thursday',
            'FRI': 'friday',
            'SAT': 'saturday',
            'SUN': 'sunday'
        };
        
        const converted = dayMap[backendDay?.toUpperCase()] || 'monday';
        return converted;
    };
    
    const convertedDay = convertDayOfWeek(slot.dayOfWeek);
    
    const result: Course = {
        id: slot.id?.toString() || `temp-${Math.random()}`,
        code: lectureCode,
        name: slot.courseName || '이름없음',
        day: convertedDay,
        startPeriod: slot.startPeriod || 1,
        endPeriod: slot.endPeriod || 1,
        startTime: slot.startTime || '',
        endTime: slot.endTime || '',
        room: slot.room || '',
        instructor: slot.instructor || '',
        credits: slot.credits || 0,
        type: (slot.type as CourseType) || 'GE',
        color: slot.color || '#FF6B6B'
    };
    
    console.log('[DEBUG] mapBackendToCourse 출력:', result);
    return result;
};

const mapCourseToBackend = (course: Course) => {
    const dayMap: Record<string, string> = {
        'monday': 'MON',
        'tuesday': 'TUE',
        'wednesday': 'WED', 
        'thursday': 'THU',
        'friday': 'FRI',
        'saturday': 'SAT',
        'sunday': 'SUN'
    };
    
    return {
        codeId: course.code,
        courseName: course.name,
        dayOfWeek: dayMap[course.day] || 'MON',
        startPeriod: course.startPeriod,
        endPeriod: course.endPeriod,
        startTime: course.startTime,
        endTime: course.endTime,
        room: course.room,
        instructor: course.instructor,
        credits: course.credits,
        type: course.type,
        color: course.color
    };
};

export const useSchedule = (semester: string) => {
    const { updateSchedule, isLoading } = useSeparatedData();
    const [localCourses, setLocalCourses] = useState<Course[]>([]);
    const [currentSemester, setCurrentSemester] = useState<string>('');
    
    console.log('[useSchedule] localCourses:', localCourses);
    console.log('[useSchedule] semester:', semester);
    console.log('[useSchedule] currentSemester:', currentSemester);

    useEffect(() => {
        if (!semester) return;
        
        if (semester !== currentSemester) {
            console.log(`[useSchedule] 학기 변경: ${currentSemester} -> ${semester}`);
            setLocalCourses([]);
            setCurrentSemester(semester);
        }
        
        const loadData = async () => {
            console.log('[useSchedule] 백엔드에서 데이터 로딩:', semester);
            
            try {
                const { apiService } = await import('../services/ApiService');
                const backendTimetable = await apiService.getTimetableBySemester(semester);

                if (backendTimetable && backendTimetable.TimetableSlots) {
                    const slots = backendTimetable.TimetableSlots;
                    const mapped = slots.map(mapBackendToCourse);
                    
                    console.log(`[useSchedule] ${semester} 데이터 로딩 완료:`, mapped.length, '개 과목');
                    setLocalCourses(mapped);
                } else {
                    console.log(`[useSchedule] ${semester} 데이터 없음`);
                    setLocalCourses([]);
                }
            } catch (error) {
                console.error(`[useSchedule] ${semester} 데이터 로딩 실패:`, error);
                setLocalCourses([]);
            }
        };

        loadData();
    }, [semester, currentSemester]);

    const saveSchedule = async (newCourses: Course[]) => {
        const { apiService } = await import('../services/ApiService');
        const payload = newCourses.map(mapCourseToBackend);
        
        await apiService.saveTimetable({
            semester,
            courses: payload,
            updatedAt: new Date().toISOString()
        });
        
        setLocalCourses(newCourses);
        console.log(`[useSchedule] ${semester} 저장 완료`);
    };

    const updateLocalOnly = (newCourses: Course[]) => {
        setLocalCourses(newCourses);
        console.log(`[useSchedule] ${semester} 로컬 업데이트: ${newCourses.length}개 과목`);
    };

    return {
        schedule: { timetable: localCourses } as any,
        courses: localCourses,
        isLoading,
        loadSchedule: async () => localCourses,
        saveSchedule,
        setLocalCourses,
        updateLocalOnly
    };
};

export const useSeparatedData = () => {
    const context = useContext(SeparatedDataContext);
    if (context === undefined) {
        throw new Error('useSeparatedData must be used within a SeparatedDataProvider');
    }
    return context;
};
export const useData = useSeparatedData;
export const useCurriculum = () => {
    const { curriculum, updateCurriculum } = useSeparatedData();
    return { curriculum, updateCurriculum };
};