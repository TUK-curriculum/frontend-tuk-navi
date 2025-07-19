// src/utils/separatedDataManager.ts
// 1대1 데이터 분리 구조를 위한 데이터 관리 유틸리티

import {
    User,
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
    Subject,
    StorageKeys,
    createDefaultUserProfile,
    createDefaultGraduationInfo,
    createDefaultCurriculum,
    createDefaultSchedule,
    createDefaultOnboarding,
    createDefaultSettings,
    createDefaultStatistics
} from '../types/separated-user';

// 마이그레이션 함수들을 re-export
export {
    checkAndMigrateLegacyUserData,
    migrateAllLegacyData,
    isMigrationRequired,
    compareDataStructures
} from './migrationUtils';

// 현재 로그인된 사용자 관리
export const getCurrentUserId = (): string | null => {
    return localStorage.getItem(StorageKeys.currentUser());
};

export const setCurrentUserId = (userId: string): void => {
    localStorage.setItem(StorageKeys.currentUser(), userId);
};

export const clearCurrentUserId = (): void => {
    localStorage.removeItem(StorageKeys.currentUser());
};

// 제네릭 저장/로드 함수
const saveEntity = <T>(key: string, data: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Failed to save ${key}:`, error);
    }
};

const loadEntity = <T>(key: string, defaultValue: T): T => {
    try {
        const data = localStorage.getItem(key);
        if (!data) return defaultValue;
        return JSON.parse(data) as T;
    } catch (error) {
        console.error(`Failed to load ${key}:`, error);
        return defaultValue;
    }
};

const removeEntity = (key: string): void => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Failed to remove ${key}:`, error);
    }
};

// UserProfile 관리
export const getUserProfile = (userId: string): UserProfile => {
    const key = StorageKeys.userProfile(userId);
    return loadEntity(key, createDefaultUserProfile(userId));
};

export const saveUserProfile = (profile: UserProfile): void => {
    const updatedProfile = { ...profile, updatedAt: new Date().toISOString() };
    const key = StorageKeys.userProfile(profile.userId);
    saveEntity(key, updatedProfile);
};

export const updateUserProfile = (userId: string, updates: Partial<Omit<UserProfile, 'userId'>>): UserProfile => {
    const current = getUserProfile(userId);
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    saveUserProfile(updated);
    return updated;
};

// GraduationInfo 관리
export const getGraduationInfo = (userId: string): GraduationInfo => {
    const key = StorageKeys.graduationInfo(userId);
    return loadEntity(key, createDefaultGraduationInfo(userId));
};

export const saveGraduationInfo = (info: GraduationInfo): void => {
    const updatedInfo = { ...info, updatedAt: new Date().toISOString() };
    const key = StorageKeys.graduationInfo(info.userId);
    saveEntity(key, updatedInfo);
};

export const updateGraduationInfo = (userId: string, updates: Partial<Omit<GraduationInfo, 'userId'>>): GraduationInfo => {
    const current = getGraduationInfo(userId);
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    saveGraduationInfo(updated);
    return updated;
};

// Curriculum 관리
export const getCurriculum = (userId: string): Curriculum => {
    const key = StorageKeys.curriculum(userId);
    return loadEntity(key, createDefaultCurriculum(userId));
};

export const saveCurriculum = (curriculum: Curriculum): void => {
    const updatedCurriculum = { ...curriculum, updatedAt: new Date().toISOString() };
    const key = StorageKeys.curriculum(curriculum.userId);
    saveEntity(key, updatedCurriculum);
};

export const updateCurriculum = (userId: string, updates: Partial<Omit<Curriculum, 'userId'>>): Curriculum => {
    const current = getCurriculum(userId);
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    saveCurriculum(updated);
    return updated;
};

// Schedule 관리
export const getSchedule = (userId: string): Schedule => {
    const key = StorageKeys.schedule(userId);
    return loadEntity(key, createDefaultSchedule(userId));
};

export const saveSchedule = (schedule: Schedule): void => {
    const updatedSchedule = { ...schedule, updatedAt: new Date().toISOString() };
    const key = StorageKeys.schedule(schedule.userId);
    saveEntity(key, updatedSchedule);
};

export const updateSchedule = (userId: string, updates: Partial<Omit<Schedule, 'userId'>>): Schedule => {
    const current = getSchedule(userId);
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    saveSchedule(updated);
    return updated;
};

// Onboarding 관리
export const getOnboarding = (userId: string): Onboarding => {
    const key = StorageKeys.onboarding(userId);
    return loadEntity(key, createDefaultOnboarding(userId));
};

export const saveOnboarding = (onboarding: Onboarding): void => {
    const updatedOnboarding = { ...onboarding, updatedAt: new Date().toISOString() };
    const key = StorageKeys.onboarding(onboarding.userId);
    saveEntity(key, updatedOnboarding);
};

export const updateOnboarding = (userId: string, updates: Partial<Omit<Onboarding, 'userId'>>): Onboarding => {
    const current = getOnboarding(userId);
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    saveOnboarding(updated);
    return updated;
};

// UserSettings 관리
export const getUserSettings = (userId: string): UserSettings => {
    const key = StorageKeys.settings(userId);
    return loadEntity(key, createDefaultSettings(userId));
};

export const saveUserSettings = (settings: UserSettings): void => {
    const updatedSettings = { ...settings, updatedAt: new Date().toISOString() };
    const key = StorageKeys.settings(settings.userId);
    saveEntity(key, updatedSettings);
};

export const updateUserSettings = (userId: string, updates: Partial<Omit<UserSettings, 'userId'>>): UserSettings => {
    const current = getUserSettings(userId);
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    saveUserSettings(updated);
    return updated;
};

// UserStatistics 관리
export const getUserStatistics = (userId: string): UserStatistics => {
    const key = StorageKeys.statistics(userId);
    return loadEntity(key, createDefaultStatistics(userId));
};

export const saveUserStatistics = (statistics: UserStatistics): void => {
    const updatedStatistics = { ...statistics, updatedAt: new Date().toISOString() };
    const key = StorageKeys.statistics(statistics.userId);
    saveEntity(key, updatedStatistics);
};

export const updateUserStatistics = (userId: string, updates: Partial<Omit<UserStatistics, 'userId'>>): UserStatistics => {
    const current = getUserStatistics(userId);
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    saveUserStatistics(updated);
    return updated;
};

// Notes 관리 (1:N)
export const getNotes = (userId: string): Note[] => {
    const key = StorageKeys.notes(userId);
    return loadEntity(key, []);
};

export const saveNotes = (userId: string, notes: Note[]): void => {
    const key = StorageKeys.notes(userId);
    saveEntity(key, notes);
};

export const addNote = (userId: string, note: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Note => {
    const notes = getNotes(userId);
    const newNote: Note = {
        ...note,
        id: Date.now().toString(),
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    const updatedNotes = [...notes, newNote];
    saveNotes(userId, updatedNotes);

    // 통계 업데이트
    updateUserStatistics(userId, { notesCount: updatedNotes.length });

    return newNote;
};

export const updateNote = (userId: string, noteId: string, updates: Partial<Omit<Note, 'id' | 'userId'>>): Note | null => {
    const notes = getNotes(userId);
    const noteIndex = notes.findIndex(n => n.id === noteId);
    if (noteIndex === -1) return null;

    const updatedNote = { ...notes[noteIndex], ...updates, updatedAt: new Date().toISOString() };
    const updatedNotes = [...notes];
    updatedNotes[noteIndex] = updatedNote;
    saveNotes(userId, updatedNotes);

    return updatedNote;
};

export const deleteNote = (userId: string, noteId: string): boolean => {
    const notes = getNotes(userId);
    const filteredNotes = notes.filter(n => n.id !== noteId);
    if (filteredNotes.length === notes.length) return false;

    saveNotes(userId, filteredNotes);

    // 통계 업데이트
    updateUserStatistics(userId, { notesCount: filteredNotes.length });

    return true;
};

// Messages 관리 (1:N)
export const getMessages = (userId: string): ChatMessage[] => {
    const key = StorageKeys.messages(userId);
    return loadEntity(key, []);
};

export const saveMessages = (userId: string, messages: ChatMessage[]): void => {
    const key = StorageKeys.messages(userId);
    saveEntity(key, messages);
};

export const addMessage = (userId: string, message: Omit<ChatMessage, 'id' | 'userId' | 'timestamp'>): ChatMessage => {
    const messages = getMessages(userId);
    const newMessage: ChatMessage = {
        ...message,
        id: Date.now().toString(),
        userId,
        timestamp: new Date().toISOString()
    };
    const updatedMessages = [...messages, newMessage];
    saveMessages(userId, updatedMessages);

    // 통계 업데이트
    updateUserStatistics(userId, { messagesCount: updatedMessages.length });

    return newMessage;
};

export const clearMessages = (userId: string): void => {
    saveMessages(userId, []);
    updateUserStatistics(userId, { messagesCount: 0 });
};

// Notifications 관리 (1:N)
export const getNotifications = (userId: string): NotificationItem[] => {
    const key = StorageKeys.notifications(userId);
    return loadEntity(key, []);
};

export const saveNotifications = (userId: string, notifications: NotificationItem[]): void => {
    const key = StorageKeys.notifications(userId);
    saveEntity(key, notifications);
};

export const addNotification = (userId: string, notification: Omit<NotificationItem, 'id' | 'userId' | 'timestamp'>): NotificationItem => {
    const notifications = getNotifications(userId);
    const newNotification: NotificationItem = {
        ...notification,
        id: Date.now().toString(),
        userId,
        timestamp: new Date().toISOString(),
        isRead: false
    };
    const updatedNotifications = [newNotification, ...notifications].slice(0, 50); // 최대 50개 유지
    saveNotifications(userId, updatedNotifications);

    return newNotification;
};

export const markNotificationAsRead = (userId: string, notificationId: string): boolean => {
    const notifications = getNotifications(userId);
    const notificationIndex = notifications.findIndex(n => n.id === notificationId);
    if (notificationIndex === -1) return false;

    const updatedNotifications = [...notifications];
    updatedNotifications[notificationIndex] = { ...updatedNotifications[notificationIndex], isRead: true };
    saveNotifications(userId, updatedNotifications);

    return true;
};

export const clearNotifications = (userId: string): void => {
    saveNotifications(userId, []);
};

// 기존 호환성을 위한 배열 데이터 관리
export const getCourses = (userId: string): Subject[] => {
    const key = StorageKeys.courses(userId);
    return loadEntity(key, []);
};

export const saveCourses = (userId: string, courses: Subject[]): void => {
    const key = StorageKeys.courses(userId);
    saveEntity(key, courses);
};

export const getCompletedCourses = (userId: string): Subject[] => {
    const key = StorageKeys.completedCourses(userId);
    return loadEntity(key, []);
};

export const saveCompletedCourses = (userId: string, courses: Subject[]): void => {
    const key = StorageKeys.completedCourses(userId);
    saveEntity(key, courses);

    // 통계 업데이트
    updateUserStatistics(userId, { completedCoursesCount: courses.length });
};

export const getTimetableCourses = (userId: string): Subject[] => {
    const key = StorageKeys.timetableCourses(userId);
    return loadEntity(key, []);
};

export const saveTimetableCourses = (userId: string, courses: Subject[]): void => {
    const key = StorageKeys.timetableCourses(userId);
    saveEntity(key, courses);
};

export const getGraduationRequirements = (userId: string): Subject[] => {
    const key = StorageKeys.graduationRequirements(userId);
    return loadEntity(key, []);
};

export const saveGraduationRequirements = (userId: string, courses: Subject[]): void => {
    const key = StorageKeys.graduationRequirements(userId);
    saveEntity(key, courses);
};

export const getFavorites = (userId: string): string[] => {
    const key = StorageKeys.favorites(userId);
    return loadEntity(key, []);
};

export const saveFavorites = (userId: string, favorites: string[]): void => {
    const key = StorageKeys.favorites(userId);
    saveEntity(key, favorites);

    // 통계 업데이트
    updateUserStatistics(userId, { favoriteCoursesCount: favorites.length });
};

export const addToFavorites = (userId: string, courseId: string): void => {
    const favorites = getFavorites(userId);
    if (!favorites.includes(courseId)) {
        const updatedFavorites = [...favorites, courseId];
        saveFavorites(userId, updatedFavorites);
    }
};

export const removeFromFavorites = (userId: string, courseId: string): void => {
    const favorites = getFavorites(userId);
    const updatedFavorites = favorites.filter(id => id !== courseId);
    saveFavorites(userId, updatedFavorites);
};

export const getRecentSearches = (userId: string): string[] => {
    const key = StorageKeys.recentSearches(userId);
    return loadEntity(key, []);
};

export const saveRecentSearches = (userId: string, searches: string[]): void => {
    const key = StorageKeys.recentSearches(userId);
    saveEntity(key, searches);
};

export const addRecentSearch = (userId: string, searchTerm: string): void => {
    const searches = getRecentSearches(userId);
    const filtered = searches.filter(term => term !== searchTerm);
    const updated = [searchTerm, ...filtered].slice(0, 10); // 최대 10개 유지
    saveRecentSearches(userId, updated);
};

// 로그인 통계 업데이트
export const updateLoginStatistics = (userId: string): void => {
    const stats = getUserStatistics(userId);
    const updatedStats = {
        ...stats,
        totalLoginCount: stats.totalLoginCount + 1,
        lastLoginDate: new Date().toISOString()
    };
    saveUserStatistics(updatedStats);
};

// 사용자 데이터 초기화 (새 사용자용)
export const initializeUserData = (userId: string): void => {
    // 기본값들을 모두 생성하여 저장
    saveUserProfile(createDefaultUserProfile(userId));
    saveGraduationInfo(createDefaultGraduationInfo(userId));
    saveCurriculum(createDefaultCurriculum(userId));
    saveSchedule(createDefaultSchedule(userId));
    saveOnboarding(createDefaultOnboarding(userId));
    saveUserSettings(createDefaultSettings(userId));
    saveUserStatistics(createDefaultStatistics(userId));

    // 빈 배열들 초기화
    saveNotes(userId, []);
    saveMessages(userId, []);
    saveNotifications(userId, []);
    saveCourses(userId, []);
    saveCompletedCourses(userId, []);
    saveTimetableCourses(userId, []);
    saveGraduationRequirements(userId, []);
    saveFavorites(userId, []);
    saveRecentSearches(userId, []);

    console.log(`사용자 ${userId}의 분리된 데이터 초기화 완료`);
};

// 사용자 데이터 완전 삭제
export const deleteUserData = (userId: string): void => {
    // 모든 키 삭제
    Object.values(StorageKeys).forEach(keyFn => {
        if (typeof keyFn === 'function') {
            const key = keyFn(userId);
            removeEntity(key);
        }
    });

    console.log(`사용자 ${userId}의 모든 데이터 삭제 완료`);
};

// 데이터 내보내기 (백업용)
export const exportUserData = (userId: string): string => {
    const userData = {
        profile: getUserProfile(userId),
        graduationInfo: getGraduationInfo(userId),
        curriculum: getCurriculum(userId),
        schedule: getSchedule(userId),
        onboarding: getOnboarding(userId),
        settings: getUserSettings(userId),
        statistics: getUserStatistics(userId),
        notes: getNotes(userId),
        messages: getMessages(userId),
        notifications: getNotifications(userId),
        courses: getCourses(userId),
        completedCourses: getCompletedCourses(userId),
        timetableCourses: getTimetableCourses(userId),
        graduationRequirements: getGraduationRequirements(userId),
        favorites: getFavorites(userId),
        recentSearches: getRecentSearches(userId)
    };

    return JSON.stringify(userData, null, 2);
};

// 데이터 가져오기 (복원용)
export const importUserData = (userId: string, jsonData: string): boolean => {
    try {
        const userData = JSON.parse(jsonData);

        // 각 항목별로 복원
        if (userData.profile) saveUserProfile({ ...userData.profile, userId });
        if (userData.graduationInfo) saveGraduationInfo({ ...userData.graduationInfo, userId });
        if (userData.curriculum) saveCurriculum({ ...userData.curriculum, userId });
        if (userData.schedule) saveSchedule({ ...userData.schedule, userId });
        if (userData.onboarding) saveOnboarding({ ...userData.onboarding, userId });
        if (userData.settings) saveUserSettings({ ...userData.settings, userId });
        if (userData.statistics) saveUserStatistics({ ...userData.statistics, userId });
        if (userData.notes) saveNotes(userId, userData.notes);
        if (userData.messages) saveMessages(userId, userData.messages);
        if (userData.notifications) saveNotifications(userId, userData.notifications);
        if (userData.courses) saveCourses(userId, userData.courses);
        if (userData.completedCourses) saveCompletedCourses(userId, userData.completedCourses);
        if (userData.timetableCourses) saveTimetableCourses(userId, userData.timetableCourses);
        if (userData.graduationRequirements) saveGraduationRequirements(userId, userData.graduationRequirements);
        if (userData.favorites) saveFavorites(userId, userData.favorites);
        if (userData.recentSearches) saveRecentSearches(userId, userData.recentSearches);

        console.log(`사용자 ${userId}의 데이터 복원 완료`);
        return true;
    } catch (error) {
        console.error('데이터 복원 실패:', error);
        return false;
    }
}; 