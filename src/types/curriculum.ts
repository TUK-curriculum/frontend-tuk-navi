// src/types/curriculum.ts
export interface Curriculum {
    id: number;
    userId: number;
    name: string;
    total_credits: number;
    description?: string;
    isDefault: boolean;
    conditions: string;
    created_at?: string;
    updated_at?: string;
    lectures?: CurriculumLecture[];
    completionRate?: number; 
    extraSemesters?: { grade: number; semester: number }[];
}

export interface LectureCode {
  id: number;
  code: string;
  name?: string;
}

export interface CurriculumLecture {
    id: number;
    curri_id: number;
    lect_id: number;
    name: string;
    credits: number;
    semester: '1' | '2' | 'S' | 'W';
    type: 'GR' | 'GE' | 'MR' | 'ME' | 'RE' | 'FE';
    grade: number;
    isCompleted?: boolean;
    lectureCode?: LectureCode;
    recordGrade?: string;

    courseCode?: string;
    courseName?: string;
    dayOfWeek?: string;
    startTime?: string;
    endTime?: string;
    professor?: string;
    status?: 'completed' | 'current' | 'planned' | 'off-track';
    isRetaken?: boolean;
    category?: string;
}

export interface Lecture {
    id: number;
    curri_id: number;
    courseName: string;
    lecture_name?: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    semester: number;
    credits?: number;
    professor?: string;
    status?: 'completed' | 'current' | 'planned' | 'off-track';
    category?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Course {
    id: number;
    name: string;
    category: string;
    type: string;
    credits: number;
    year?: number;
    semester?: number;
    description?: string;
}

export interface CreateCurriculumRequest {
    name: string;
    description?: string;
    conditions?: string;
    isDefault?: boolean;
}

export interface AddLectureRequest {
    courseCode?: string;
    code?: string;
    lect_id?: number;
    name: string;
    credits: number;
    type: 'GR' | 'GE' | 'MR' | 'ME' | 'RE' | 'FE';
    grade: number;
    semester: '1' | '2' | 'S' | 'W';
    status?: 'completed' | 'current' | 'planned';
    isRetaken?: boolean; 
    recordGrade?: string;
}


export interface UpdateLectureRequest extends Partial<AddLectureRequest> {
    name?: string;
    credits?: number;
    semester?: '1' | '2' | 'S' | 'W';
    type?: 'GR' | 'GE' | 'MR' | 'ME' | 'RE' | 'FE';
    status?: 'completed' | 'current' | 'planned';
    isRetaken?: boolean; 
    grade?: number;
}

export interface CurriculumListResponse {
    success: boolean;
    curriculums: Curriculum[];
}

export interface CurriculumDetailResponse {
    success: boolean;
    curriculum: Curriculum;
}

export interface CreateCurriculumResponse {
    success: boolean;
    curriculum: Curriculum;
}

export interface AddLectureResponse {
    success: boolean;
    lecture: CurriculumLecture;
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
    semester: string;
    lectures: CurriculumLecture[];
    credits: number;
}

export interface CurriculumFilters {
    search: string;
    sort: 'recent' | 'name' | 'lectures';
    showDefaultOnly: boolean;
}

export interface CurriculumFormData {
    name: string;
    description?: string;
    conditions?: string;
    isDefault: boolean;
}

export interface GetCurriculumsParams {
    defaultOnly?: boolean;
}