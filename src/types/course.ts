export type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

export interface CourseCore {
    id: string;
    name: string;
    day: DayKey;
    startPeriod: number; // 1~14
    endPeriod: number;   // 1~14
    credits: number;
    room: string;
    type: 'required' | 'elective' | 'liberal';
    code?: string;
    instructor?: string;
    // 커리큘럼 관리용 속성
    locked?: boolean;
    starred?: boolean;
    selected?: boolean;
}

export interface Course extends CourseCore {
    startTime: string; // '09:30'
    endTime: string;   // '10:20'
    code: string;
    instructor: string;
} 