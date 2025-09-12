import { Course, DayKey } from '../types/course';
import {
    CourseCreateDTO,
    CourseUpdateDTO,
    CourseSearchParams,
    CourseEnrollmentDTO
} from '../repositories/CourseRepository';
import { QueryOptions } from '../repositories/BaseRepository';
import { parseTimeString } from '../utils/parseTimeString';

// Mock course data storage
const mockCourses: Map<string, Course> = new Map();
const enrollments: Map<string, Set<string>> = new Map(); // studentId -> Set<courseId>

// Generate time strings based on periods
const generateTimeFromPeriod = (period: number): string => {
    const baseHour = 9;
    const baseMinute = 0;
    const minutesPerPeriod = 50;

    const totalMinutes = (period - 1) * minutesPerPeriod;
    const hours = baseHour + Math.floor(totalMinutes / 60);
    const minutes = baseMinute + (totalMinutes % 60);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Initialize with sample data
const initializeMockCourses = () => {
    const sampleCourses: Omit<Course, 'startTime' | 'endTime'>[] = [
        // 컴퓨터공학과 전공필수
        {
            id: 'CS101',
            name: '프로그래밍기초',
            code: 'CS101',
            day: 'monday',
            startPeriod: 1,
            endPeriod: 2,
            credits: 3,
            room: '공학관 301',
            type: 'required',
            instructor: '김교수',
        },
        {
            id: 'CS201',
            name: '자료구조',
            code: 'CS201',
            day: 'tuesday',
            startPeriod: 3,
            endPeriod: 4,
            credits: 3,
            room: '공학관 302',
            type: 'required',
            instructor: '이교수',
        },
        {
            id: 'CS301',
            name: '알고리즘',
            code: 'CS301',
            day: 'wednesday',
            startPeriod: 2,
            endPeriod: 3,
            credits: 3,
            room: '공학관 303',
            type: 'required',
            instructor: '박교수',
        },
        // 전공선택
        {
            id: 'CS401',
            name: '웹프로그래밍',
            code: 'CS401',
            day: 'thursday',
            startPeriod: 5,
            endPeriod: 6,
            credits: 3,
            room: '공학관 401',
            type: 'elective',
            instructor: '최교수',
        },
        {
            id: 'CS402',
            name: '데이터베이스',
            code: 'CS402',
            day: 'friday',
            startPeriod: 3,
            endPeriod: 4,
            credits: 3,
            room: '공학관 402',
            type: 'elective',
            instructor: '정교수',
        },
        // 교양필수
        {
            id: 'GE101',
            name: '대학영어',
            code: 'GE101',
            day: 'monday',
            startPeriod: 5,
            endPeriod: 6,
            credits: 2,
            room: '인문관 201',
            type: 'liberal',
            instructor: '김교수',
        },
        {
            id: 'GE201',
            name: '글쓰기와소통',
            code: 'GE201',
            day: 'tuesday',
            startPeriod: 7,
            endPeriod: 8,
            credits: 2,
            room: '인문관 202',
            type: 'liberal',
            instructor: '이교수',
        },
        // 디자인공학부 과목들
        {
            id: 'DES101',
            name: '디자인기초',
            code: 'DES101',
            day: 'monday',
            startPeriod: 3,
            endPeriod: 5,
            credits: 3,
            room: '디자인관 101',
            type: 'required',
            instructor: '강교수',
        },
        {
            id: 'DES201',
            name: 'UI/UX디자인',
            code: 'DES201',
            day: 'wednesday',
            startPeriod: 4,
            endPeriod: 6,
            credits: 3,
            room: '디자인관 201',
            type: 'elective',
            instructor: '윤교수',
        },
    ];

    sampleCourses.forEach(courseData => {
        const course: Course = {
            ...courseData,
            startTime: generateTimeFromPeriod(courseData.startPeriod),
            endTime: generateTimeFromPeriod(courseData.endPeriod + 1),
        };
        mockCourses.set(course.id, course);
    });
};

// Initialize mock data
initializeMockCourses();

// Mock functions
export const getMockCourses = async (options?: QueryOptions): Promise<Course[]> => {
    const courses = Array.from(mockCourses.values());

    // Apply filters
    if (options?.filter) {
        const { type, day, instructor } = options.filter;

        return courses.filter(course => {
            if (type && course.type !== type) return false;
            if (day && course.day !== day) return false;
            if (instructor && !course.instructor.includes(instructor)) return false;
            return true;
        });
    }

    // Apply pagination
    if (options?.page && options?.limit) {
        const start = (options.page - 1) * options.limit;
        const end = start + options.limit;
        return courses.slice(start, end);
    }

    return courses;
};

export const getMockCourseById = async (id: number): Promise<Course | null> => {
    return mockCourses.get(id) || null;
};

export const searchMockCourses = async (params: CourseSearchParams): Promise<Course[]> => {
    const courses = Array.from(mockCourses.values());

    return courses.filter(course => {
        if (params.query) {
            const query = params.query.toLowerCase();
            const matchesQuery =
                course.name.toLowerCase().includes(query) ||
                course.code.toLowerCase().includes(query) ||
                course.instructor.toLowerCase().includes(query);
            if (!matchesQuery) return false;
        }

        if (params.type && course.type !== params.type) return false;
        if (params.day && course.day !== params.day) return false;
        if (params.instructor && !course.instructor.includes(params.instructor)) return false;
        if (params.credits && course.credits !== params.credits) return false;

        return true;
    });
};

export const createMockCourse = async (data: CourseCreateDTO): Promise<Course> => {
    const newCourse: Course = {
        ...data,
        id: `${data.code}_${Date.now()}`,
        startTime: generateTimeFromPeriod(data.startPeriod),
        endTime: generateTimeFromPeriod(data.endPeriod + 1),
    };

    mockCourses.set(newCourse.id, newCourse);
    return newCourse;
};

export const updateMockCourse = async (id: number, data: CourseUpdateDTO): Promise<Course> => {
    const course = mockCourses.get(id);
    if (!course) {
        throw new Error('Course not found');
    }

    const updatedCourse: Course = {
        ...course,
        ...data,
        startTime: data.startPeriod
            ? generateTimeFromPeriod(data.startPeriod)
            : course.startTime,
        endTime: data.endPeriod
            ? generateTimeFromPeriod(data.endPeriod + 1)
            : course.endTime,
    };

    mockCourses.set(id, updatedCourse);
    return updatedCourse;
};

export const deleteMockCourse = async (id: number): Promise<boolean> => {
    return mockCourses.delete(id);
};

export const enrollMockCourse = async (enrollment: CourseEnrollmentDTO): Promise<boolean> => {
    const { courseId, studentId } = enrollment;

    if (!mockCourses.has(courseId)) {
        throw new Error('Course not found');
    }

    if (!enrollments.has(studentId)) {
        enrollments.set(studentId, new Set());
    }

    enrollments.get(studentId)!.add(courseId);
    return true;
};

export const dropMockCourse = async (courseId: string, studentId: string): Promise<boolean> => {
    const studentEnrollments = enrollments.get(studentId);
    if (!studentEnrollments) {
        return false;
    }

    return studentEnrollments.delete(courseId);
};

export const getMockCompletedCourses = async (studentId: string): Promise<Course[]> => {
    const studentEnrollments = enrollments.get(studentId);
    if (!studentEnrollments) {
        return [];
    }

    const completedCourses: Course[] = [];
    studentEnrollments.forEach(courseId => {
        const course = mockCourses.get(courseId);
        if (course) {
            completedCourses.push(course);
        }
    });

    return completedCourses;
};

export const checkMockCourseConflict = async (
    courseId: string,
    studentId: string
): Promise<{ hasConflict: boolean; conflictingCourses?: Course[] }> => {
    const course = mockCourses.get(courseId);
    if (!course) {
        throw new Error('Course not found');
    }

    const studentEnrollments = enrollments.get(studentId);
    if (!studentEnrollments) {
        return { hasConflict: false };
    }

    const conflictingCourses: Course[] = [];

    studentEnrollments.forEach(enrolledCourseId => {
        const enrolledCourse = mockCourses.get(enrolledCourseId);
        if (!enrolledCourse || enrolledCourse.day !== course.day) {
            return;
        }

        // Check time conflict
        const hasConflict =
            (course.startPeriod <= enrolledCourse.startPeriod && enrolledCourse.startPeriod <= course.endPeriod) ||
            (course.startPeriod <= enrolledCourse.endPeriod && enrolledCourse.endPeriod <= course.endPeriod) ||
            (enrolledCourse.startPeriod <= course.startPeriod && course.endPeriod <= enrolledCourse.endPeriod);

        if (hasConflict) {
            conflictingCourses.push(enrolledCourse);
        }
    });

    return {
        hasConflict: conflictingCourses.length > 0,
        conflictingCourses,
    };
}; 