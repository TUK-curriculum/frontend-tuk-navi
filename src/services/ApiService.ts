import { GeneratedSchedule } from '@/types/user';
import apiClient from '../config/apiClient';
import { slotToCourse } from '@/utils/mapper';

// 캐시와 debouncing을 위한 유틸리티
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5분

// 캐시 헬퍼 함수
const getCachedData = (key: string) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.data;
    }
    cache.delete(key);
    return null;
};

const setCachedData = (key: string, data: any, ttl: number = CACHE_TTL) => {
    cache.set(key, { data, timestamp: Date.now(), ttl });
};

// Debounce 함수
const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
    let timeout: ReturnType<typeof setTimeout>; 
    return (...args: Parameters<T>) => {
        return new Promise((resolve) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => resolve(func(...args)), wait);
        });
    };
};

// ===== 타입 정의 =====
export interface BackendUser {
    userId: number;
    email: string;
    name: string;
    studentId?: number;
    major?: string;
    grade?: number;
    semester?: number;
    phone?: string;
    provider?: string;
    createdAt?: string;
    enrollmentYear?: number;
    graduationYear?: number;
}

export interface BackendProfile {
    userId: number;
    email?: string;
    name: string;
    studentId?: number;
    major?: string;
    grade?: number;
    semester?: number;
    phone?: string;
    onboardingCompleted?: boolean;
    provider?: string;
    createdAt?: string;
    updatedAt?: string;
    interests?: string[];
    completedCredits?: number;
    career?: string;
    industry?: string;
    remainingSemesters?: number;
    maxCreditsPerTerm?: number;
    enrollmentYear?: number;
    graduationYear?: number;
}

export interface BackendRecord {
    id: number;
    courseName: string;
    courseCode: string;
    credits: number;
    grade: string;
    semester: string;
    year: number;
    category: string;
}

export interface BackendCurriculum {
    id: number;
    name: string;
    type: string;
    subjects: any[];
    totalCredits: number;
    requiredCredits: number;
}

export interface BackendTimetable {
    id: number;
    userId: number;
    semesterCode: string;
    year: number;
    created_at: string;
    updated_at: string;
    courses?: any[];
    TimetableSlots?: any[];
}


export interface BackendNote {
    id: number;
    userId?: number;
    title: string;
    content: string;
    category?: string;
    tags?: string[];
    pinned?: boolean;
    archived?: boolean;
    order?: number;
    createdAt: string;
    updatedAt: string;
}

export interface BackendNotification {
    id: number;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

export interface BackendGraduationStatus {
    totalCredits: number;
    majorCredits: number;
    liberalCredits: number;
    requiredCourses: string[];
    missingCourses: string[];
    isGraduationReady: boolean;
    progressRatio?: number;
    canGraduate?: boolean;
    recommendations?: any[];
}

// ===== API Response 타입 =====
interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

// ===== 통합 API 서비스 클래스 =====
class ApiService {
    private static instance: ApiService;

    public static getInstance(): ApiService {
        if (!ApiService.instance) {
            ApiService.instance = new ApiService();
        }
        return ApiService.instance;
    }

    // ===== 프로필 관리 =====
    async getProfile(): Promise<BackendProfile | null> {
        const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || 'anonymous' : 'anonymous';
        const cacheKey = `user_profile_${userEmail}`;
        const cached = getCachedData(cacheKey);
        if (cached) {
            console.log('[ApiService] Using cached profile data');
            return cached;
        }

        console.log('[ApiService] Fetching user profile');
        try {
            const { data: res } = await apiClient.get<ApiResponse<BackendProfile>>('/profile');
            if (!res.success) {
                console.warn('[ApiService] profile empty - returning null');
                return null;
            }
            const profileData = res.data;
            setCachedData(cacheKey, profileData);
            return profileData;
        } catch (error: any) {
            console.error('[ApiService] Failed to fetch profile:', error);
            return null;
        }
    }

    async completeOnboarding(onboardingData: any): Promise<void> {
        console.log('[ApiService] Completing onboarding with data:', onboardingData);
        try {
            await apiClient.post('/profile/complete-onboarding', onboardingData);

            // 온보딩 완료 후 캐시 무효화 (사용자별 키)
            const userEmail = (typeof window !== 'undefined') ? localStorage.getItem('userEmail') || 'anonymous' : 'anonymous';
            const cacheKey = `user_profile_${userEmail}`;
            cache.delete(cacheKey);

            console.log('[ApiService] Onboarding completed successfully (cache cleared)');
        } catch (error) {
            console.error('[ApiService] Failed to complete onboarding:', error);
            throw error;
        }
    }

    async updateProfile(updates: {
        username?: string;
        name?: string;
        studentId?: number;
        major?: string;
        grade?: number;
        semester?: number;
        phone?: string;
        interests?: string[];
        completedCredits?: number;
        career?: string;
        industry?: string;
        remainingSemesters?: number;
        maxCreditsPerTerm?: number;
        enrollmentYear?: number;
        graduationYear?: number;
        onboardingCompleted?: boolean;
    }): Promise<BackendProfile> {
        console.log('[ApiService] Updating user profile:', updates);
        try {
            const response = await apiClient.put<{ success: boolean; message: string; data: any }>('/profile', updates);
            const updatedProfile = response.data.data;

            // 캐시 무효화 및 새 데이터로 업데이트 (사용자별 키로)
            const userEmail = (typeof window !== 'undefined') ? localStorage.getItem('userEmail') || 'anonymous' : 'anonymous';
            const cacheKey = `user_profile_${userEmail}`;
            cache.delete(cacheKey);
            setCachedData(cacheKey, updatedProfile);

            return updatedProfile;
        } catch (error) {
            console.error('[ApiService] Failed to update profile:', error);
            throw error;
        }
    }

    async getSummary(): Promise<{
        totalCredits: number;
        majorCredits: number;
        liberalCredits: number;
        averageGrade?: number;
    }> {
        try {
            const { data: res } = await apiClient.get<ApiResponse<{
                totalCredits: number;
                majorCredits: number;
                liberalCredits: number;
                averageGrade?: number;
            }>>('/profile/summary');

            if (!res.success) {
                throw new Error(res.message || '학점 요약 조회 실패');
            }
            return res.data;
        } catch (error) {
            console.error('[ApiService] 학점 요약 조회 실패:', error);
            return {
                totalCredits: 0,
                majorCredits: 0,
                liberalCredits: 0,
                averageGrade: undefined
            };
        }
    }
    
    async getSemesters(): Promise<string[]> {
        console.log('[ApiService] Fetching semesters');
        try {
            const { data: res } = await apiClient.get<ApiResponse<string[]>>('/timetable/semesters');
            if (!res.success) throw new Error(res.message || 'Failed to fetch semesters');
            return res.data || [];
        } catch (error) {
            console.error('[ApiService] Failed to fetch semesters:', error);
            const currentYear = new Date().getFullYear();
            return [
                `${currentYear-1}-2학기`,
                `${currentYear}-1학기`,
                `${currentYear}-2학기`
            ];
        }
    }

    
    // ===== 시간표 관리 =====
    
    /**
     * 현재 학기 시간표 조회
     */
    async getCurrentTimetable(semester?: string): Promise<BackendTimetable | null> {
        if (!semester) {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth() + 1;
            
            const currentSemester = (currentMonth >= 3 && currentMonth <= 8) ? 1 : 2;
            semester = `${currentYear}-${currentSemester}학기`;
        }
        
        try {
            const response = await apiClient.get<ApiResponse<BackendTimetable>>('/timetable/current', {
                params: { semester }
            });
                
            const { data: res } = response;
            if (!res.success) {
                console.warn('[ApiService] 현재 시간표를 찾을 수 없음:', res.message);
                return null;
            }
            
            console.log('[ApiService] 현재 시간표 조회 성공:', res.data);
            return res.data || null;
        } catch (error: any) {
            if (error.response?.status === 404) {
                console.log('[ApiService] 현재 시간표가 존재하지 않음');
                return null;
            }
            
            console.error('[ApiService] 현재 시간표 조회 실패:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            
            throw error;
        }
    }

    /**
     * 특정 학기 시간표 조회
     */
    async getTimetableBySemester(semester: string): Promise<BackendTimetable | null> {
        console.log('[ApiService] Fetching timetable for semester:', semester);
        try {
            const encoded = encodeURIComponent(semester);
            const { data: res } = await apiClient.get<ApiResponse<BackendTimetable>>(`/timetable/semester/${encoded}`);
            if (!res.success) {
                console.warn('[ApiService] Timetable not found for semester:', semester);
                return null;
            }
            const timetableData = res.data;
            console.log('[ApiService] Parsed timetable data:', JSON.stringify(timetableData, null, 2));
        
            if (timetableData) {
                console.log('[ApiService] Timetable data keys:', Object.keys(timetableData));
                console.log('[ApiService] TimetableSlots:', timetableData.TimetableSlots);
                console.log('[ApiService] courses:', timetableData.courses);
            }
            return res.data || null;
        } catch (error: any) {
            if (error.response?.status === 404) {
                console.log('[ApiService] No timetable exists for semester:', semester);
                return null;
            }
            console.error('[ApiService] Failed to fetch semester timetable:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                url: error.config?.url
            });
            throw error;
        }
    }


    /**
     * 시간표 생성/업데이트
     */
    async saveTimetable(timetableData: {
        semester: string;
        courses: any[];
        updatedAt?: string;
        isGenerated?: boolean;
    }): Promise<BackendTimetable> {

        try {
            if (!timetableData.semester) {
                throw new Error('Semester is required');
            }
            if (!Array.isArray(timetableData.courses)) {
                throw new Error('Courses must be an array');
            }

            const payload = {
                semesterCode: timetableData.semester,
                courses: timetableData.courses,
                year: new Date().getFullYear(),
                updated_at: timetableData.updatedAt || new Date().toISOString(),
                isGenerated: timetableData.isGenerated || false
            };

            const existingTimetable = await this.getTimetableBySemester(timetableData.semester);

            let response;
            if (existingTimetable?.id) {
                console.log('[ApiService] Updating existing timetable');
                response = await apiClient.put<ApiResponse<BackendTimetable>>(
                    `/timetable/${existingTimetable.id}`,
                    payload
                );
            } else {
                console.log('[ApiService] Creating new timetable');
                response = await apiClient.post<ApiResponse<BackendTimetable>>(
                    '/timetable',
                    payload
                );
            }

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to save timetable');
            }

            console.log('[ApiService] Timetable saved successfully');
            return response.data.data;
        } catch (error) {
            console.error('[ApiService] Failed to save timetable:', error);
            throw error;
        }
    }

    /**
     * 시간표 삭제 (초기화)
     */
    async deleteTimetable(semester: string): Promise<boolean> {
        try {
            const encoded = encodeURIComponent(semester);
            const { data: res } = await apiClient.delete(`/timetable/semester/${encoded}`);
            return res.success;
        } catch (error) {
            console.error('[ApiService] Failed to delete timetable:', error);
            throw error;
        }
    }

    /**
     * 시간표에서 과목 제거
     */
    async removeCourseFromTimetable(semester: string, courseId: number): Promise<BackendTimetable> {
        console.log('[ApiService] Removing course from timetable:', courseId);
        
        try {
            const currentTimetable = await this.getTimetableBySemester(semester);
            
            if (!currentTimetable?.courses) {
                throw new Error('No timetable found for semester: ' + semester);
            }

            const updatedCourses = currentTimetable.courses.filter(
                (course: any) => course.id !== courseId
            );

            return await this.saveTimetable({
                semester,
                courses: updatedCourses
            });
        } catch (error) {
            console.error('[ApiService] Failed to remove course from timetable:', error);
            throw error;
        }
    }

    /**
     * 시간표 과목 수정
     */
    async updateCourseInTimetable(semester: string, courseId: number, updates: Partial<{
        name: string;
        code: string;
        instructor: string;
        credits: number;
        type: string;
        day: string;
        startTime: string;
        endTime: string;
        startPeriod: number;
        endPeriod: number;
        room: string;
    }>): Promise<BackendTimetable> {
        console.log('[ApiService] Updating course in timetable:', courseId, updates);
        
        try {
            const currentTimetable = await this.getTimetableBySemester(semester);
            const currentCourses = currentTimetable?.TimetableSlots?.map(slotToCourse) || [];
            
            if (currentCourses.length === 0) {
                throw new Error('No timetable found for semester: ' + semester);
            }

            const updatedCourses = currentCourses.map((course: any) => 
                course.id === courseId 
                    ? { ...course, ...updates }
                    : course
            );

            return await this.saveTimetable({
                semester,
                courses: updatedCourses,
                updatedAt: new Date().toISOString(),
                isGenerated: false
            });
        } catch (error) {
            console.error('[ApiService] Failed to update course in timetable:', error);
            throw error;
        }
    }

    /**
     * 사용자의 모든 시간표 조회
     */
    async getAllTimetables(): Promise<BackendTimetable[]> {
        console.log('[ApiService] Fetching all user timetables');
        try {
            const { data: res } = await apiClient.get<ApiResponse<BackendTimetable[]>>('/timetable/all');
            if (!res.success) {
                throw new Error(res.message || 'Failed to fetch all timetables');
            }
            console.log('[ApiService] All timetables loaded successfully');
            return res.data || [];
        } catch (error) {
            console.error('[ApiService] Failed to fetch all timetables:', error);
            throw error;
        }
    }

    /**
     * 시간표 복사
     */
    async copyTimetable(fromSemester: string, toSemester: string): Promise<BackendTimetable> {
        console.log('[ApiService] Copying timetable from', fromSemester, 'to', toSemester);
        
        try {
            const sourceTimetable = await this.getTimetableBySemester(fromSemester);
            
            if (!sourceTimetable) {
                throw new Error('Source timetable not found: ' + fromSemester);
            }

            return await this.saveTimetable({
                semester: toSemester,
                courses: sourceTimetable.courses || []
            });
        } catch (error) {
            console.error('[ApiService] Failed to copy timetable:', error);
            throw error;
        }
    }

    /**
     * 시간표 충돌 검사
     */
    async checkTimetableConflicts(semester: string, newCourse: {
        day: string;
        startTime: string;
        endTime: string;
        startPeriod?: number;
        endPeriod?: number;
    }): Promise<{
        hasConflict: boolean;
        conflicts: any[];
    }> {
        console.log('[ApiService] Checking timetable conflicts');
        
        try {
            const currentTimetable = await this.getTimetableBySemester(semester);
            
            if (!currentTimetable?.courses) {
                return { hasConflict: false, conflicts: [] };
            }

            const conflicts = currentTimetable.courses.filter((course: any) => {
                if (course.day !== newCourse.day) return false;
                
                // 시간 기반 충돌 검사
                if (newCourse.startTime && newCourse.endTime && course.startTime && course.endTime) {
                    const newStart = new Date(`1970-01-01 ${newCourse.startTime}`);
                    const newEnd = new Date(`1970-01-01 ${newCourse.endTime}`);
                    const existingStart = new Date(`1970-01-01 ${course.startTime}`);
                    const existingEnd = new Date(`1970-01-01 ${course.endTime}`);
                    
                    return (newStart < existingEnd && newEnd > existingStart);
                }
                
                // 교시 기반 충돌 검사
                if (newCourse.startPeriod && newCourse.endPeriod && course.startPeriod && course.endPeriod) {
                    return (newCourse.startPeriod < course.endPeriod && newCourse.endPeriod > course.startPeriod);
                }
                
                return false;
            });

            return {
                hasConflict: conflicts.length > 0,
                conflicts
            };
        } catch (error) {
            console.error('[ApiService] Failed to check conflicts:', error);
            throw error;
        }
    }

    /**
     * 시간표 자동 생성
     */
    async generateTimetables(curriculumId: number, preferences: any, excludeGenerated: string[] = []): Promise<GeneratedSchedule[]> {
        try {
            const response = await apiClient.post<ApiResponse<{
                timetables: GeneratedSchedule[];
                total: number;
                hasMore: boolean;
            }>>('/timetable/generate', {
                curriculumId,
                preferences,
                excludeGenerated
            });

            if (!response.data.success) {
                throw new Error(response.data.message || '시간표 생성 실패');
            }

            return response.data.data.timetables || [];
        } catch (error) {
            console.error('[ApiService] Failed to generate timetables:', error);
            return [];
        }
    }
    
    // ===== 수강 기록 관리 =====
    async getRecords(): Promise<BackendRecord[]> {
        console.log('[ApiService] Fetching user records');
        try {
            const { data: res } = await apiClient.get<ApiResponse<BackendRecord[]>>('/records');
            return res.success ? res.data : [];
        } catch (error) {
            console.error('[ApiService] Failed to fetch records:', error);
            return [];
        }
    }

    async addRecord(record: Omit<BackendRecord, 'id'>): Promise<BackendRecord | null> {
        console.log('[ApiService] Adding new record:', record);
        try {
            const { data: res } = await apiClient.post<ApiResponse<BackendRecord>>('/records', record);
            return res.success ? res.data : null;
        } catch (error) {
            console.error('[ApiService] Failed to add record:', error);
            return null;
        }
    }

    async updateRecord(id: number, updates: Partial<BackendRecord>): Promise<BackendRecord | null> {
        console.log('[ApiService] Updating record:', id, updates);
        try {
            const { data: res } = await apiClient.put<ApiResponse<BackendRecord>>(`/records/${id}`, updates);
            return res.success ? res.data : null;
        } catch (error) {
            console.error('[ApiService] Failed to update record:', error);
            return null;
        }
    }

    async deleteRecord(id: number): Promise<boolean> {
        console.log('[ApiService] Deleting record:', id);
        try {
            const { data: res } = await apiClient.delete<ApiResponse<null>>(`/records/${id}`);
            return res.success;
        } catch (error) {
            console.error('[ApiService] Failed to delete record:', error);
            return false;
        }
    }

    // ===== 커리큘럼 관리 =====
    async getCurriculums(): Promise<BackendCurriculum[]> {
        console.log('[ApiService] Fetching curriculums');
        try {
            const { data: res } = await apiClient.get<ApiResponse<BackendCurriculum[]>>('/curriculums');
            return res.success ? res.data : [];
        } catch (error) {
            console.error('[ApiService] Failed to fetch curriculums:', error);
            return [];
        }
    }

    async getCurriculumById(id: number): Promise<BackendCurriculum | null> {
        console.log('[ApiService] Fetching curriculum by ID:', id);
        try {
            const { data: res } = await apiClient.get<ApiResponse<BackendCurriculum>>(`/curriculums/${id}`);
            return res.success ? res.data : null;
        } catch (error) {
            console.error('[ApiService] Failed to fetch curriculum:', error);
            return null;
        }
    }

    // ===== 노트 관리 =====
    async getNotes(): Promise<BackendNote[]> {
        console.log('[ApiService] Fetching notes');
        try {
            const { data: res } = await apiClient.get<ApiResponse<BackendNote[]>>('/notes');
            console.log('[ApiService] Notes response:', res);
            if (!res.success) throw new Error(res.message || 'Failed to fetch notes');
            return res.data || [];
        } catch (error: any) {
            console.error('[ApiService] Failed to fetch notes:', error);
            console.error('[ApiService] Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });
            return [];
        }
    }

    async addNote(note: Omit<BackendNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<BackendNote | null> {
        console.log('[ApiService] Adding note:', note);
        try {
            const { data: res } = await apiClient.post<ApiResponse<BackendNote>>('/notes', note);
            if (!res.success) throw new Error(res.message || 'Failed to add note');
            return res.data;
        } catch (error) {
            console.error('[ApiService] Failed to add note:', error);
            return null;
        }
    }

    async updateNote(id: number, updates: Partial<BackendNote>): Promise<BackendNote | null> {
        // 필드명 매핑: pinned → isPinned, archived → isArchived
        const mappedUpdates = {
            ...updates,
            isPinned: updates.pinned !== undefined ? updates.pinned : updates.pinned,
            isArchived: updates.archived !== undefined ? updates.archived : updates.archived,
        };
        delete (mappedUpdates as any).pinned;
        delete (mappedUpdates as any).archived;
        console.log('[ApiService] Updating note:', id, mappedUpdates);
        try {
            const { data: res } = await apiClient.patch<ApiResponse<BackendNote>>(`/notes/${id}`, mappedUpdates);
            if (!res.success) throw new Error(res.message || 'Failed to update note');
            return res.data;
        } catch (error) {
            console.error('[ApiService] Failed to update note:', error);
            return null;
        }
    }

    async deleteNote(id: number): Promise<boolean> {
        console.log('[ApiService] Deleting note:', id);
        try {
            const { data: res } = await apiClient.delete<ApiResponse<null>>(`/notes/${encodeURIComponent(id)}`);
            if (!res.success) throw new Error(res.message || 'Failed to delete note');
            return true;
        } catch (error) {
            console.error('[ApiService] Failed to delete note:', error);
            return false;
        }
    }

    /**
     * 사용자별 프로필 캐시 삭제
     * @param email 특정 사용자의 이메일. 전달하지 않으면 localStorage 의 userEmail 값을 사용합니다.
     */
    clearProfileCache(email?: string): void {
        const userEmail = email || (typeof window !== 'undefined' ? localStorage.getItem('userEmail') || 'anonymous' : 'anonymous');
        const key = `user_profile_${userEmail}`;
        if (cache.delete(key)) {
            console.log(`[ApiService] Cleared profile cache for ${userEmail}`);
        }
    }

    /**
     * 모든 사용자 프로필 캐시를 삭제합니다 (메모리 회수용)
     */
    clearAllProfileCache(): void {
        Array.from(cache.keys()).forEach((key) => {
            if (key.startsWith('user_profile_')) {
                cache.delete(key);
            }
        });
        console.log('[ApiService] Cleared ALL user_profile caches');
    }

    // ===== 알림 관리 =====
    async getNotifications(): Promise<BackendNotification[]> {
        console.log('[ApiService] Fetching notifications');
        try {
            const { data: res } = await apiClient.get<ApiResponse<BackendNotification[]>>('/notifications');
            console.log('[ApiService] Notifications response:', res);
            if (!res.success) throw new Error(res.message || 'Failed to fetch notifications');
            return res.data || [];
        } catch (error: any) {
            console.error('[ApiService] Failed to fetch notifications:', error);
            console.error('[ApiService] Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });
            return [];
        }
    }

    async markNotificationAsRead(id: number): Promise<boolean> {
        console.log('[ApiService] Marking notification as read:', id);
        try {
            const response = await apiClient.patch<{ success: boolean; message?: string }>(`/notifications/${id}/read`);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to mark notification as read');
            }
            return true;
        } catch (error) {
            console.error('[ApiService] Failed to mark notification as read:', error);
            return false;
        }
    }

    // ===== 졸업 관리 =====
    async getGraduationStatus(): Promise<BackendGraduationStatus & {
        thresholds?: { totalRequired: number; majorRequired: number; liberalRequired: number }
    }> {
        console.log('[ApiService] Fetching graduation status');
        try {
            const response = await apiClient.get<any>('/graduation/status');
            const statusData = response.data?.data;

            return {
                totalCredits: statusData.pass?.total?.actual || 0,
                majorCredits: statusData.pass?.major?.actual || 0,
                liberalCredits: statusData.pass?.liberal?.actual || 0,
                requiredCourses: [],
                missingCourses: statusData.missingCourses?.missing || [],
                isGraduationReady: (statusData.pass?.total?.passed &&
                    statusData.pass?.major?.passed &&
                    statusData.pass?.liberal?.passed) || false,
                thresholds: {
                    totalRequired: statusData.pass?.total?.threshold || 130,
                    majorRequired: statusData.pass?.major?.threshold || 69,
                    liberalRequired: statusData.pass?.liberal?.threshold || 37,
                }
            };
        } catch (error) {
            console.error('[ApiService] Failed to fetch graduation status:', error);
            return {
                totalCredits: 0,
                majorCredits: 0,
                liberalCredits: 0,
                requiredCourses: [],
                missingCourses: [],
                isGraduationReady: false,
                thresholds: {
                    totalRequired: 130,
                    majorRequired: 69,
                    liberalRequired: 37,
                }
            };
        }
    }

    // ==== 프로필 관리 ====
    async getCreditSummary(): Promise<{
        totalCredits: number;
        majorCredits: number;
        liberalCredits: number;
        averageGrade: number;
    } | null> {
        try {
            const { data: res } = await apiClient.get<ApiResponse<{
                totalCredits: number;
                majorCredits: number;
                liberalCredits: number;
                averageGrade: number;
            }>>('/profile/summary');
            
            if (!res.success) {
                console.warn('[ApiService] 학점 요약 null 값 반환');
                return null;
            }
            
            return res.data;
        } catch (error: any) {
            console.error('[ApiService] 학점 요약 정보 조회 실패:', error);
            return null;
        }
    }

    // ===== 대시보드 요약 정보 =====
    async getDashboardSummary(): Promise<{
        totalCredits: number;
        graduationProgress: number;
        upcomingCourses: any[];
        recentNotes: BackendNote[];
        notifications: BackendNotification[];
        canGraduate?: boolean;
        missingRequiredCourses?: any[];
        recommendations?: any[];
        thresholds?: {
            totalRequired: number;
            majorRequired: number;
            liberalRequired: number;
        };
    }> {
        console.log('[ApiService] Fetching dashboard summary');

        const token = localStorage.getItem('accessToken');
        if (!token) {
            console.warn('[ApiService] No access token found, using mock data');
            return {
                totalCredits: 0,
                graduationProgress: 0,
                canGraduate: false,
                upcomingCourses: [],
                recentNotes: [],
                notifications: [],
                missingRequiredCourses: [],
                recommendations: [],
                thresholds: {
                    totalRequired: 130,
                    majorRequired: 69,
                    liberalRequired: 37
                }
            };
        }

        try {
            const [
                graduationStatus,
                timetable,
                notes,
                notifications
            ] = await Promise.allSettled([
                this.getGraduationStatus(),
                this.getCurrentTimetable(),
                this.getNotes(),
                this.getNotifications()
            ]);

            const graduationData = graduationStatus.status === 'fulfilled' ? graduationStatus.value : null;
            const totalCredits = graduationData?.totalCredits || 0;

            return {
                totalCredits,
                graduationProgress: graduationData?.progressRatio || Math.round((totalCredits / 130) * 100),
                canGraduate: graduationData?.canGraduate || false,
                missingRequiredCourses: graduationData?.missingCourses || [],
                recommendations: graduationData?.recommendations || [],
                upcomingCourses: timetable.status === 'fulfilled' ? (timetable.value?.courses || []) : [],
                recentNotes: notes.status === 'fulfilled' ? (notes.value || []).slice(0, 5) : [],
                notifications: notifications.status === 'fulfilled' ? (notifications.value || []).filter(n => !n.isRead) : [],
                thresholds: graduationData?.thresholds
            };
        } catch (error) {
            console.error('[ApiService] Failed to fetch dashboard summary:', error);
            return {
                totalCredits: 0,
                graduationProgress: 0,
                canGraduate: false,
                upcomingCourses: [],
                recentNotes: [],
                notifications: [],
                missingRequiredCourses: [],
                recommendations: [],
                thresholds: {
                    totalRequired: 130,
                    majorRequired: 69,
                    liberalRequired: 37
                }
            };
        }
    }
}

export const apiService = ApiService.getInstance(); 