// src/services/CurriculumService.ts
import apiClient from '../config/apiClient';
import {
    Curriculum,
    Lecture,
    CurriculumListResponse,
    CurriculumDetailResponse,
    CreateCurriculumRequest,
    CreateCurriculumResponse,
    AddLectureRequest,
    AddLectureResponse,
    UpdateLectureRequest,
    DeleteResponse,
    CurriculumWithStats,
    SemesterBreakdown,
    CurriculumLecture,
} from '../types/curriculum';
import { BackendRecord } from './ApiService';

class CurriculumService {
    private readonly baseUrl = '/curriculums';

    /**
     * 사용자의 모든 커리큘럼 조회
     */
    async getCurriculums(defaultOnly: boolean = false): Promise<Curriculum[]> {
        try {
            const url = defaultOnly
                ? `${this.baseUrl}?defaultOnly=true`
                : this.baseUrl;

            const response = await apiClient.get<{ success: boolean; curriculums: Curriculum[] }>(url);

            if (!response.data.success) {
                throw new Error('커리큘럼 목록을 불러오는데 실패했습니다.');
            }

            return response.data.curriculums;
        } catch (error) {
            console.error('Failed to fetch curriculums:', error);
            throw new Error('커리큘럼 목록을 불러오는데 실패했습니다.');
        }
    }

    /**
     * 특정 커리큘럼 상세 조회
     */
    async getCurriculumById(curriculumId: number): Promise<Curriculum> {
        try {
            const response = await apiClient.get<{ success: boolean; curriculum: Curriculum }>(`${this.baseUrl}/${curriculumId}`);
            if (response.data.success) {
                return response.data.curriculum;
            } else {
                throw new Error('커리큘럼 상세 정보를 불러오는데 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to fetch curriculum:', error);
            throw new Error('커리큘럼 상세 정보를 불러오는데 실패했습니다.');
        }
    }

    /**
     * 새 커리큘럼 생성
     */
    async createCurriculum(data: CreateCurriculumRequest): Promise<Curriculum> {
        try {
            const response = await apiClient.post<{ success: boolean; curriculum: Curriculum }>(this.baseUrl, data);
            if (response.data.success) {
                return response.data.curriculum;
            } else {
                throw new Error('커리큘럼 생성에 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to create curriculum:', error);
            throw new Error('커리큘럼 생성에 실패했습니다.');
        }
    }

    /**
     * 커리큘럼 삭제
     */
    async deleteCurriculum(curriculumId: number): Promise<void> {
        try {
            const response = await apiClient.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${curriculumId}`);
            if (!response.data.success) {
                throw new Error(response.data.message || '커리큘럼 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to delete curriculum:', error);
            throw new Error('커리큘럼 삭제에 실패했습니다.');
        }
    }

    /**
     * 기본 커리큘럼 설정
     */
    async setDefaultCurriculum(curriculumId: number): Promise<void> {
        try {
            const response = await apiClient.post<{ success: boolean; message: string }>(
                `${this.baseUrl}/default`,
                { curriculumId }
            );
            if (!response.data.success) {
                throw new Error(response.data.message || '기본 커리큘럼 설정에 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to set default curriculum:', error);
            throw new Error('기본 커리큘럼 설정에 실패했습니다.');
        }
    }

    /**
     * 기본 커리큘럼 조회
     */
    async getDefaultCurriculum(): Promise<Curriculum | null> {
        try {
            const response = await apiClient.get<{ success: boolean; defaultCurriculum: Curriculum }>(`${this.baseUrl}/default`);
            if (response.data.success) {
                return response.data.defaultCurriculum;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Failed to get default curriculum:', error);
            return null;
        }
    }

    /**
     * 커리큘럼에 과목 추가
     */
    async addLecture(curriculumId: number, data: AddLectureRequest): Promise<CurriculumLecture> {
        try {
            const payload = {
                lect_id: data.lect_id ?? null,
                courseCode: data.courseCode || null,
                name: data.name,
                credits: data.credits,
                type: data.type,
                grade: data.grade,
                semester: data.semester,
                status: data.status,
                recordGrade: data.recordGrade || null, 
            };

            const response = await apiClient.post<{ success: boolean; lecture: CurriculumLecture }>(
                `${this.baseUrl}/${curriculumId}/lectures`,
                payload
            );

            if (response.data.success) {
                return response.data.lecture;
            } else {
                throw new Error('강의 추가에 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to add lecture:', error);
            throw new Error('강의 추가에 실패했습니다.');
        }
    }

    /**
     * 커리큘럼 이름 수정
     */
    async updateCurriculum(curriculumId: number, data: Partial<CreateCurriculumRequest>): Promise<Curriculum> {
        try {
            const response = await apiClient.put<{ success: boolean; curriculum: Curriculum }>(
                `${this.baseUrl}/${curriculumId}`,
                data
            );
            if (response.data.success) {
                return response.data.curriculum;
            } else {
                throw new Error('커리큘럼 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to update curriculum:', error);
            throw new Error('커리큘럼 수정에 실패했습니다.');
        }
    }

    /**
     * 과목 수정
     */
    async updateLecture(curriculumId: number, lectureId: number, data: UpdateLectureRequest): Promise<CurriculumLecture> {
        try {
            const response = await apiClient.put<{ success: boolean; updatedLecture: CurriculumLecture }>(`${this.baseUrl}/${curriculumId}/lectures/${lectureId}`, data);
            if (response.data.success) {
                return response.data.updatedLecture;
            } else {
                throw new Error('과목 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to update lecture:', error);
            throw new Error('과목 수정에 실패했습니다.');
        }
    }

    /**
     * 과목 삭제
     */
    async deleteLecture(curriculumId: number, lectureId: number): Promise<void> {
        try {
            const response = await apiClient.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${curriculumId}/lectures/${lectureId}`);
            if (!response.data.success) {
                throw new Error(response.data.message || '과목 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to delete lecture:', error);
            throw new Error('과목 삭제에 실패했습니다.');
        }
    }

    /**
     * 커리큘럼 통계 계산
     */
    calculateCurriculumStats(curriculum: Curriculum): CurriculumWithStats {
        const lectures = curriculum.lectures || [];
        // curri_id가 일치하는 강의만 필터링
        const relevantLectures = lectures.filter(lecture => lecture.curri_id === curriculum.id);
        const totalLectures = relevantLectures.length;

        // 학기별 분류
        const semesterMap = new Map<string, CurriculumLecture[]>();
        relevantLectures.forEach(lecture => {
            if (!semesterMap.has(lecture.semester)) {
                semesterMap.set(lecture.semester, []);
            }
            semesterMap.get(lecture.semester)!.push(lecture);
        });

        const semesterBreakdown: SemesterBreakdown[] = Array.from(semesterMap.entries())
            .map(([semester, semesterLectures]) => ({
                semester,
                lectures: semesterLectures,
                credits: semesterLectures.reduce((sum, lecture) => sum + lecture.credits, 0),
            }))
            .sort((a, b) => {
                const order = ['1', 'S', '2', 'W'];
                return order.indexOf(a.semester) - order.indexOf(b.semester);
            });

        const totalCredits = semesterBreakdown.reduce((sum, semester) => sum + semester.credits, 0);
        const completionRate = totalLectures > 0 ? Math.min((totalLectures / 20) * 100, 100) : 0;

        return {
            ...curriculum,
            totalLectures,
            totalCredits,
            completionRate,
            semesterBreakdown,
        };
    }

    /**
     * 커리큘럼 필터링 및 정렬
     */
    filterAndSortCurriculums(
        curriculums: Curriculum[],
        search: string,
        sort: 'recent' | 'name' | 'lectures',
        showDefaultOnly: boolean = false
    ): Curriculum[] {
        let filtered = curriculums;

        if (search.trim()) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(curriculum =>
                curriculum.name.toLowerCase().includes(searchLower)
            );
        }

        if (showDefaultOnly) {
            filtered = filtered.filter(curriculum => curriculum.isDefault);
        }

        switch (sort) {
            case 'recent':
                filtered.sort((a, b) => {
                    const dateA = new Date(a.created_at || 0).getTime();
                    const dateB = new Date(b.created_at || 0).getTime();
                    return dateB - dateA;
                });
                break;
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'lectures':
                filtered.sort((a, b) => {
                    const lecturesA = a.lectures?.length || 0;
                    const lecturesB = b.lectures?.length || 0;
                    return lecturesB - lecturesA;
                });
                break;
        }

        return filtered;
    }

    /**
     * 시간표 충돌 검사
     */
    checkTimeConflict(
        curriculumId: number,
        dayOfWeek: string,
        startTime: string,
        endTime: string,
        excludeLectureId?: number
    ): boolean {
        // 실제로는 서버에서 검사하지만, 클라이언트에서도 기본 검사 가능
        return false; // 서버에서 처리
    }

    /**
     * 과목 데이터 검증
     */
    validateLectureData(data: AddLectureRequest): string[] {
        const errors: string[] = [];

        if (!data.name?.trim()) {
            errors.push('과목명을 입력해주세요.');
        }

        if (!data.credits || data.credits < 1) {
            errors.push('학점을 입력해주세요.');
        }

        if (!data.semester) {
            errors.push('학기를 선택해주세요.');
        }

        const validSemesters = ['1', '2', 'S', 'W'];
        if (!validSemesters.includes(data.semester)) {
            errors.push('올바른 학기를 선택해주세요.');
        }

        const validTypes = ['GR', 'GE', 'MR', 'ME', 'RE', 'FE'];
        if (!validTypes.includes(data.type)) {
            errors.push('올바른 과목 타입을 선택해주세요.');
        }

        return errors;
    }
}

export const curriculumService = new CurriculumService(); 