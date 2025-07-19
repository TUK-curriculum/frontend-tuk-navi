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
} from '../types/curriculum';

class CurriculumService {
    private readonly baseUrl = '/curriculums';

    /**
 * 사용자의 모든 커리큘럼 조회
 */
    async getCurriculums(): Promise<Curriculum[]> {
        try {
            const response = await apiClient.get<{ success: boolean; curriculums: Curriculum[] }>(this.baseUrl);
            if (response.data.success) {
                return response.data.curriculums;
            } else {
                throw new Error('커리큘럼 목록을 불러오는데 실패했습니다.');
            }
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
    async setDefaultCurriculum(name: string): Promise<Curriculum> {
        try {
            const response = await apiClient.post<{ success: boolean; curriculum: Curriculum }>(`${this.baseUrl}/default`, { name });
            if (response.data.success) {
                return response.data.curriculum;
            } else {
                throw new Error('기본 커리큘럼 설정에 실패했습니다.');
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
    async addLecture(curriculumId: number, data: AddLectureRequest): Promise<Lecture> {
        try {
            const response = await apiClient.post<{ success: boolean; lecture: Lecture }>(`${this.baseUrl}/${curriculumId}/lectures`, data);
            if (response.data.success) {
                return response.data.lecture;
            } else {
                throw new Error('과목 추가에 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to add lecture:', error);
            throw new Error('과목 추가에 실패했습니다.');
        }
    }

    /**
     * 과목 수정
     */
    async updateLecture(curriculumId: number, lectureId: number, data: UpdateLectureRequest): Promise<Lecture> {
        try {
            const response = await apiClient.put<{ success: boolean; updatedLecture: Lecture }>(`${this.baseUrl}/${curriculumId}/lectures/${lectureId}`, data);
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
     * 커리큘럼 통계 계산 (백엔드 모델 구조에 맞게)
     */
    calculateCurriculumStats(curriculum: Curriculum): CurriculumWithStats {
        const lectures = curriculum.lectures || [];
        // curri_id가 일치하는 강의만 필터링
        const relevantLectures = lectures.filter(lecture => lecture.curri_id === curriculum.id);
        const totalLectures = relevantLectures.length;

        // 학기별 분류 (백엔드 모델 구조에 맞게)
        const semesterMap = new Map<number, Lecture[]>();
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
                credits: semesterLectures.length * 3, // 기본 3학점 가정
            }))
            .sort((a, b) => a.semester - b.semester);

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
     * 커리큘럼 필터링 및 정렬 (백엔드 모델 구조에 맞게)
     */
    filterAndSortCurriculums(
        curriculums: Curriculum[],
        search: string,
        sort: 'recent' | 'name' | 'lectures',
        showDefaultOnly: boolean = false
    ): Curriculum[] {
        let filtered = curriculums;

        // 검색 필터
        if (search.trim()) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(curriculum =>
                curriculum.name.toLowerCase().includes(searchLower)
            );
        }

        // 기본 커리큘럼만 표시
        if (showDefaultOnly) {
            filtered = filtered.filter(curriculum => curriculum.isDefault);
        }

        // 정렬
        switch (sort) {
            case 'recent':
                filtered.sort((a, b) => {
                    const dateA = new Date(a.createdAt || 0).getTime();
                    const dateB = new Date(b.createdAt || 0).getTime();
                    return dateB - dateA;
                });
                break;
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'lectures':
                filtered.sort((a, b) => {
                    // curri_id가 일치하는 강의만 카운트
                    const lecturesA = a.lectures?.filter(lecture => lecture.curri_id === a.id).length || 0;
                    const lecturesB = b.lectures?.filter(lecture => lecture.curri_id === b.id).length || 0;
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

        if (!data.courseName?.trim()) {
            errors.push('과목명을 입력해주세요.');
        }

        if (!data.dayOfWeek) {
            errors.push('요일을 선택해주세요.');
        }

        if (!data.startTime) {
            errors.push('시작 시간을 입력해주세요.');
        }

        if (!data.endTime) {
            errors.push('종료 시간을 입력해주세요.');
        }

        if (!data.semester || data.semester < 1) {
            errors.push('학기를 선택해주세요.');
        }

        // 시간 형식 검증
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (data.startTime && !timeRegex.test(data.startTime)) {
            errors.push('시작 시간 형식이 올바르지 않습니다. (HH:MM)');
        }

        if (data.endTime && !timeRegex.test(data.endTime)) {
            errors.push('종료 시간 형식이 올바르지 않습니다. (HH:MM)');
        }

        // 시작 시간이 종료 시간보다 늦은지 검증
        if (data.startTime && data.endTime) {
            const start = new Date(`2000-01-01T${data.startTime}:00`);
            const end = new Date(`2000-01-01T${data.endTime}:00`);
            if (start >= end) {
                errors.push('시작 시간은 종료 시간보다 빨라야 합니다.');
            }
        }

        return errors;
    }
}

export const curriculumService = new CurriculumService(); 