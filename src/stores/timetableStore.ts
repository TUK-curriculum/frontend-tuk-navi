import { create } from 'zustand';
import { Course } from '../types/course';
import { TimetableCourse } from '../types/timetable';
import { startEndFromTimes } from '../utils/time/periodUtils';
import { periods } from '../data/periodMap';

interface TimetableState {
    semester: string;
    courses: Course[];
    setSemester: (semester: string) => void;
    initializeCourses: (timetableCourses: TimetableCourse[]) => void;
    addCourse: (courseData: Partial<Course>) => void;
    updateCourse: (courseData: Partial<Course>) => void;
    deleteCourse: (courseId: string) => void;
}

// DataContext의 TimetableCourse를 UI에서 사용하는 Course 형태로 변환
const convertToUICourse = (tc: TimetableCourse): Course => {
    let startPeriod = typeof tc.startPeriod === 'number' ? tc.startPeriod : 0;
    let endPeriod = typeof tc.endPeriod === 'number' ? tc.endPeriod : 0;

    if ((!startPeriod || !endPeriod) && (tc as any).time) {
        const [startTime, endTime] = (tc as any).time.split(/[-~]/).map((s: string) => s.trim());
        const p = startEndFromTimes(startTime, endTime);
        startPeriod = p.startPeriod;
        endPeriod = p.endPeriod;
    }

    startPeriod = startPeriod || 1;
    endPeriod = endPeriod || startPeriod;

    return {
        id: tc.id ?? `temp-${Math.random()}`,
        name: tc.name,
        code: tc.code ?? '',
        instructor: (tc as any).professor ?? '',
        credits: tc.credits,
        day: tc.day as Course['day'],
        startPeriod,
        endPeriod,
        room: tc.room,
        type: tc.type as Course['type'],
        startTime: periods[startPeriod - 1]?.start ?? '',
        endTime: periods[endPeriod - 1]?.end ?? '',
    };
}

export const useTimetableStore = create<TimetableState>((set) => ({
    semester: '2024-2학기',
    courses: [],
    setSemester: (semester) => set({ semester }),
    initializeCourses: (timetableCourses) => set({
        courses: timetableCourses.map(convertToUICourse)
    }),
    addCourse: (courseData) => set((state) => {
        const newCourse: Course = {
            id: `new-${Date.now()}`,
            name: '새 과목',
            ...courseData,
        } as Course;
        return { courses: [...state.courses, newCourse] };
    }),
    updateCourse: (courseData) => set((state) => ({
        courses: state.courses.map((c) =>
            c.id === courseData.id ? { ...c, ...courseData } as Course : c
        ),
    })),
    deleteCourse: (courseId) => set((state) => ({
        courses: state.courses.filter((c) => c.id !== courseId),
    })),
}));
