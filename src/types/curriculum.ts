// src/types/curriculum.ts
export interface Curriculum {
    id: number;
    name: string;
    isDefault: boolean;
    userId: string;
    lectures?: Lecture[];
    createdAt?: string;
    updatedAt?: string;
}

export interface Lecture {
    id: number;
    curri_id: number;
    courseName: string;
    lecture_name?: string; // 과목명 (courseName과 동일하거나 별도)
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    semester: number;
    credits?: number; // 학점
    professor?: string; // 교수명
    status?: 'completed' | 'current' | 'pending' | 'elective'; // 수강 상태
    category?: string; // 과목 카테고리
    createdAt?: string;
    updatedAt?: string;
}

// 백엔드 모델과 정확히 일치하는 인터페이스
export interface CurriculumModel {
    id: number;
    name: string;
    isDefault: boolean;
    userId: string;
    lectures?: LectureModel[];
    createdAt?: string;
    updatedAt?: string;
}

export interface LectureModel {
    id: number;
    curri_id: number;
    courseName: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    semester: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface Course {
    id: string;
    name: string;
    category: string;
    type: string;
    credits: number;
    year?: number;
    semester?: number;
    description?: string;
}

export interface CurriculumSubject {
    curriculumUserId: number;
    courseId: string;
    isCompleted: boolean;
}

// API Response Types
export interface CurriculumListResponse {
    success: boolean;
    curriculums: Curriculum[];
}

export interface CurriculumDetailResponse {
    success: boolean;
    curriculum: Curriculum;
}

export interface CreateCurriculumRequest {
    name: string;
    isDefault?: boolean;
}

export interface CreateCurriculumResponse {
    success: boolean;
    curriculum: Curriculum;
}

export interface AddLectureRequest {
    courseName: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    semester: number;
}

export interface AddLectureResponse {
    success: boolean;
    lecture: Lecture;
}

export interface UpdateLectureRequest {
    courseName?: string;
    dayOfWeek?: string;
    startTime?: string;
    endTime?: string;
    semester?: number;
}

export interface DeleteResponse {
    success: boolean;
    message: string;
}

// Frontend specific types for UI
export interface CurriculumWithStats extends Curriculum {
    totalLectures: number;
    totalCredits: number;
    completionRate: number;
    semesterBreakdown: SemesterBreakdown[];
}

export interface SemesterBreakdown {
    semester: number;
    lectures: Lecture[];
    credits: number;
}

export interface CurriculumFilters {
    search: string;
    sort: 'recent' | 'name' | 'lectures';
    showDefaultOnly: boolean;
}

export interface CurriculumFormData {
    name: string;
    isDefault: boolean;
}

export interface LectureFormData {
    courseName: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    semester: number;
}

export interface Course {
    id: string;
    name: string;
    category: string;
    type: string;
    credits: number;
    year?: number;
    semester?: number;
    description?: string;
}

export interface CurriculumSubject {
    curriculumUserId: number;
    courseId: string;
    isCompleted: boolean;
}

// API Response Types
export interface CurriculumListResponse {
    success: boolean;
    curriculums: Curriculum[];
}

export interface CurriculumDetailResponse {
    success: boolean;
    curriculum: Curriculum;
}

export interface CreateCurriculumRequest {
    name: string;
    isDefault?: boolean;
}

export interface CreateCurriculumResponse {
    success: boolean;
    curriculum: Curriculum;
}

export interface AddLectureRequest {
    courseName: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    semester: number;
}

export interface AddLectureResponse {
    success: boolean;
    lecture: Lecture;
}

export interface UpdateLectureRequest {
    courseName?: string;
    dayOfWeek?: string;
    startTime?: string;
    endTime?: string;
    semester?: number;
}

export interface DeleteResponse {
    success: boolean;
    message: string;
}

// Frontend specific types for UI
export interface CurriculumWithStats extends Curriculum {
    totalLectures: number;
    totalCredits: number;
    completionRate: number;
    semesterBreakdown: SemesterBreakdown[];
}

export interface SemesterBreakdown {
    semester: number;
    lectures: Lecture[];
    credits: number;
}

export interface CurriculumFilters {
    search: string;
    sort: 'recent' | 'name' | 'lectures';
    showDefaultOnly: boolean;
}

export interface CurriculumFormData {
    name: string;
    isDefault: boolean;
}

export interface LectureFormData {
    courseName: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    semester: number;
} 