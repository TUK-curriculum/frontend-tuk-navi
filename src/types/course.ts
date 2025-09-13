export type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type CourseType = 'GR' | 'GE' | 'MR' | 'ME' | 'RE' | 'FE';

export interface CourseCore {
    id: number;
    name: string; 
    code: string; 
    day: DayKey; 
    startPeriod: number;
    endPeriod: number;
    credits: number;
    room: string;
    type: CourseType;
    instructor: string;

    locked?: boolean;
    starred?: boolean;
    selected?: boolean;
    color?: string;

    year?: number;
    semester?: number;
}

export interface Course extends CourseCore {
    startTime: string;
    endTime: string;
}