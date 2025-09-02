// src/utils/migrationUtils.ts
// 기존 통합 데이터를 1대1 분리 구조로 마이그레이션

import { UserData as LegacyUserData } from '../types/user';
import {
    saveUserProfile,
    saveGraduationInfo,
    saveCurriculum,
    saveSchedule,
    saveOnboarding,
    saveUserSettings,
    saveUserStatistics,
    saveNotes,
    saveMessages,
    saveNotifications,
    saveCourses,
    saveCompletedCourses,
    saveTimetableCourses,
    saveGraduationRequirements,
    saveFavorites,
    saveRecentSearches,
    initializeUserData,
    setCurrentUserId
} from './separatedDataManager';

// 기존 통합 데이터에서 분리 구조로 마이그레이션
export const migrateUserDataToSeparatedStructure = (userId: string, legacyData: LegacyUserData): boolean => {
    try {
        console.log(`사용자 ${userId}의 데이터를 분리 구조로 마이그레이션 시작...`);

        // UserProfile 마이그레이션
        if (legacyData.profile) {
            saveUserProfile({
                userId,
                studentId: legacyData.profile.studentId || '',
                major: legacyData.profile.major || '',
                grade: legacyData.profile.grade || 1,
                semester: legacyData.profile.semester || 1,
                phone: legacyData.profile.phone,
                nickname: legacyData.profile.nickname,
                interests: legacyData.profile.interests || [],
                avatar: legacyData.profile.avatar,
                updatedAt: new Date().toISOString()
            });
        }

        // GraduationInfo 마이그레이션
        if (legacyData.graduationInfo) {
            saveGraduationInfo({
                userId,
                totalCredits: legacyData.graduationInfo.totalCredits || 0,
                majorRequired: legacyData.graduationInfo.majorRequired || 0,
                majorElective: legacyData.graduationInfo.majorElective || 0,
                generalRequired: legacyData.graduationInfo.generalRequired || 0,
                generalElective: legacyData.graduationInfo.generalElective || 0,
                totalRequired: legacyData.graduationInfo.totalRequired || 130,
                progress: legacyData.graduationInfo.progress || 0,
                remainingCredits: legacyData.graduationInfo.remainingCredits || 130,
                extra: legacyData.graduationInfo.extra,
                diagnosis: legacyData.graduationInfo.diagnosis,
                updatedAt: new Date().toISOString()
            });
        }

        // Curriculum 마이그레이션
        if (legacyData.curriculum) {
            saveCurriculum({
                userId,
                type: legacyData.curriculum.type || '',
                subjects: legacyData.curriculum.subjects || [],
                completedSubjects: legacyData.curriculum.completedSubjects || [],
                currentSemester: legacyData.curriculum.currentSemester || 1,
                appliedDate: legacyData.curriculum.appliedDate,
                track: legacyData.curriculum.track,
                updatedAt: new Date().toISOString()
            });
        }

        // Schedule 마이그레이션
        if (legacyData.schedule) {
            saveSchedule({
                userId,
                currentSemester: legacyData.schedule.currentSemester || '',
                timetable: legacyData.schedule.timetable || [],
                customEvents: legacyData.schedule.customEvents || [],
                updatedAt: new Date().toISOString()
            });
        }

        // Onboarding 마이그레이션
        if (legacyData.onboarding) {
            saveOnboarding({
                userId,
                isCompleted: legacyData.onboarding.isCompleted || false,
                currentStep: legacyData.onboarding.currentStep || 0,
                completedSteps: legacyData.onboarding.completedSteps || [],
                setupDate: legacyData.onboarding.setupDate,
                interests: legacyData.onboarding.interests || [],
                updatedAt: new Date().toISOString()
            });
        }

        // UserSettings 마이그레이션
        if (legacyData.settings) {
            saveUserSettings({
                userId,
                theme: legacyData.settings.theme || 'light',
                notifications: legacyData.settings.notifications !== false,
                autoSave: legacyData.settings.autoSave !== false,
                language: legacyData.settings.language || 'ko',
                timezone: legacyData.settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
                accessibility: legacyData.settings.accessibility || {
                    highContrast: false,
                    reduceMotion: false,
                    fontSize: 'medium'
                },
                pinnedSemester: legacyData.settings.pinnedSemester,
                accessToken: legacyData.settings.accessToken,
                refreshToken: legacyData.settings.refreshToken,
                csrfToken: legacyData.settings.csrfToken,
                updatedAt: new Date().toISOString()
            });
        }

        // UserStatistics 마이그레이션
        if (legacyData.statistics) {
            saveUserStatistics({
                userId,
                totalLoginCount: legacyData.statistics.totalLoginCount || 0,
                lastLoginDate: legacyData.statistics.lastLoginDate || new Date().toISOString(),
                totalStudyTime: legacyData.statistics.totalStudyTime || 0,
                completedCoursesCount: legacyData.statistics.completedCoursesCount || 0,
                notesCount: legacyData.statistics.notesCount || 0,
                messagesCount: legacyData.statistics.messagesCount || 0,
                favoriteCoursesCount: legacyData.statistics.favoriteCoursesCount || 0,
                updatedAt: new Date().toISOString()
            });
        }

        // Notes 마이그레이션 (userId 추가)
        if (legacyData.notes && Array.isArray(legacyData.notes)) {
            const migratedNotes = legacyData.notes.map(note => ({
                ...note,
                userId
            }));
            saveNotes(userId, migratedNotes);
        }

        // Messages 마이그레이션 (userId 추가)
        if (legacyData.messages && Array.isArray(legacyData.messages)) {
            const migratedMessages = legacyData.messages.map(message => ({
                ...message,
                userId
            }));
            saveMessages(userId, migratedMessages);
        }

        // Notifications 마이그레이션 (userId 추가)
        if (legacyData.notifications && Array.isArray(legacyData.notifications)) {
            const migratedNotifications = legacyData.notifications.map(notification => ({
                ...notification,
                userId
            }));
            saveNotifications(userId, migratedNotifications);
        }

        // 기존 호환성을 위한 배열 데이터들 마이그레이션
        if (legacyData.courses) saveCourses(userId, legacyData.courses);
        if (legacyData.completedCourses) saveCompletedCourses(userId, legacyData.completedCourses);
        if (legacyData.timetableCourses) saveTimetableCourses(userId, legacyData.timetableCourses);
        if (legacyData.graduationRequirements) saveGraduationRequirements(userId, legacyData.graduationRequirements);
        if (legacyData.favorites) saveFavorites(userId, legacyData.favorites);
        if (legacyData.recentSearches) saveRecentSearches(userId, legacyData.recentSearches);

        console.log(`사용자 ${userId}의 데이터 마이그레이션 완료`);
        return true;

    } catch (error) {
        console.error(`사용자 ${userId}의 데이터 마이그레이션 실패:`, error);
        return false;
    }
};

// 기존 localStorage에서 통합 데이터 찾아서 마이그레이션
export const migrateAllLegacyData = (): boolean => {
    try {
        console.log('기존 통합 데이터 구조 마이그레이션 시작...');

        let migratedCount = 0;
        const currentUser = localStorage.getItem('currentUser');

        // localStorage의 모든 키 확인
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key) continue;

            // 기존 user_${email} 형태의 통합 데이터 찾기
            if (key.startsWith('user_') && !key.includes('_profile') && !key.includes('_graduation') &&
                !key.includes('_curriculum') && !key.includes('_schedule') && !key.includes('_onboarding') &&
                !key.includes('_settings') && !key.includes('_statistics') && !key.includes('_notes') &&
                !key.includes('_messages') && !key.includes('_notifications') && !key.includes('_courses') &&
                !key.includes('_completedCourses') && !key.includes('_timetableCourses') &&
                !key.includes('_graduationRequirements') && !key.includes('_favorites') &&
                !key.includes('_recentSearches')) {

                const userId = key.replace('user_', '');
                const dataStr = localStorage.getItem(key);

                if (dataStr) {
                    try {
                        const legacyData = JSON.parse(dataStr) as LegacyUserData;

                        // 마이그레이션 실행
                        const success = migrateUserDataToSeparatedStructure(userId, legacyData);
                        if (success) {
                            migratedCount++;

                            // 기존 통합 데이터 삭제 (백업용으로 남겨둘 수도 있음)
                            // localStorage.removeItem(key);
                            console.log(`${userId} 마이그레이션 완료`);
                        }
                    } catch (parseError) {
                        console.error(`${userId} 데이터 파싱 실패:`, parseError);
                    }
                }
            }
        }

        // 현재 사용자 설정 유지
        if (currentUser) {
            setCurrentUserId(currentUser);
        }

        console.log(`마이그레이션 완료: ${migratedCount}명의 사용자 데이터 처리`);
        return migratedCount > 0;

    } catch (error) {
        console.error('전체 마이그레이션 실패:', error);
        return false;
    }
};

// 특정 사용자의 기존 데이터 확인 및 마이그레이션
export const checkAndMigrateLegacyUserData = (userId: string): boolean => {
    const legacyKey = `user_${userId}`;
    const legacyDataStr = localStorage.getItem(legacyKey);

    if (!legacyDataStr) {
        // 기존 데이터가 없으면 새로운 구조로 초기화
        initializeUserData(userId);
        return false;
    }

    try {
        const legacyData = JSON.parse(legacyDataStr) as LegacyUserData;

        // 이미 마이그레이션된 데이터가 있는지 확인
        const profileKey = `user_${userId}_profile`;
        if (localStorage.getItem(profileKey)) {
            console.log(`사용자 ${userId}는 이미 마이그레이션 완료됨`);
            return false;
        }

        // 마이그레이션 실행
        const success = migrateUserDataToSeparatedStructure(userId, legacyData);
        if (success) {
            console.log(`사용자 ${userId} 자동 마이그레이션 완료`);
        }
        return success;

    } catch (error) {
        console.error(`사용자 ${userId} 마이그레이션 확인 실패:`, error);
        initializeUserData(userId);
        return false;
    }
};

// 마이그레이션 상태 확인
export const isMigrationRequired = (): boolean => {
    // localStorage에 기존 통합 구조가 있는지 확인
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;

        if (key.startsWith('user_') && !key.includes('_')) {
            // user_email 형태의 키가 있고, 분리된 키가 아닌 경우
            return true;
        }
    }
    return false;
};

// 개발용: 데이터 구조 비교
export const compareDataStructures = (userId: string): void => {
    const legacyKey = `user_${userId}`;
    const legacyDataStr = localStorage.getItem(legacyKey);

    if (!legacyDataStr) {
        console.log('기존 데이터 없음');
        return;
    }

    try {
        const legacyData = JSON.parse(legacyDataStr);
        console.log('기존 통합 구조:', legacyData);

        // 분리된 구조도 출력
        console.log('새로운 분리 구조:');
        console.log('- Profile:', localStorage.getItem(`user_${userId}_profile`));
        console.log('- Graduation:', localStorage.getItem(`user_${userId}_graduation`));
        console.log('- Curriculum:', localStorage.getItem(`user_${userId}_curriculum`));
        console.log('- Schedule:', localStorage.getItem(`user_${userId}_schedule`));
        console.log('- Settings:', localStorage.getItem(`user_${userId}_settings`));

    } catch (error) {
        console.error('데이터 비교 실패:', error);
    }
}; 