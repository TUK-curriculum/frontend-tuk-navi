import { Course } from './course';

export interface TimetableCourse {
    id: string;
    name: string;
    code?: string;
    instructor?: string;
    credits: number;
    day: Course['day'];
    startPeriod: number;
    endPeriod: number;
    room: string;
    type: Course['type'];
    time?: string; // 예전 데이터 호환용
} 