import { BaseRepository, QueryOptions } from './BaseRepository';
import { Course } from '../types/course';
import apiClient from '../config/apiClient';
import { apiEndpoints } from '../config/environment';

export interface CourseCreateDTO {
    name: string;
    day: Course['day'];
    startPeriod: number;
    endPeriod: number;
    credits: number;
    room: string;
    type: Course['type'];
    code: string;
    instructor: string;
}

export interface CourseUpdateDTO extends Partial<CourseCreateDTO> {
    locked?: boolean;
    starred?: boolean;
    selected?: boolean;
}

export interface CourseSearchParams {
    query?: string;
    type?: Course['type'];
    day?: Course['day'];
    instructor?: string;
    credits?: number;
}

export interface CourseEnrollmentDTO {
    courseId: string;
    studentId: string;
    semester: string;
}

export class CourseRepository extends BaseRepository<Course> {
    protected endpoint = apiEndpoints.courses.list;

    async findAll(options?: QueryOptions): Promise<Course[]> {
        const queryString = this.buildQueryString(options);
        const response = await apiClient.get<Course[]>(`${this.endpoint}${queryString}`);
        return response.data;
    }

    async findById(id: number): Promise<Course | null> {
        try {
            const response = await apiClient.get<Course>(apiEndpoints.courses.detail(id));
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async search(params: CourseSearchParams): Promise<Course[]> {
        const queryString = this.buildQueryString({ filter: params });
        const response = await apiClient.get<Course[]>(`${apiEndpoints.courses.search}${queryString}`);
        return response.data;
    }

    async create(data: CourseCreateDTO): Promise<Course> {
        const response = await apiClient.post<Course>(this.endpoint, data);
        return response.data;
    }

    async update(id: number, data: CourseUpdateDTO): Promise<Course> {
        const response = await apiClient.patch<Course>(apiEndpoints.courses.detail(id), data);
        return response.data;
    }

    async delete(id: number): Promise<void> {
        await apiClient.delete(apiEndpoints.courses.detail(id));
    }

    // Course-specific methods
    async enrollCourse(enrollment: CourseEnrollmentDTO): Promise<void> {
        await apiClient.post(apiEndpoints.courses.enroll, enrollment);
    }

    async dropCourse(courseId: string, studentId: string): Promise<void> {
        await apiClient.post(apiEndpoints.courses.drop, { courseId, studentId });
    }

    async getCompletedCourses(studentId: string): Promise<Course[]> {
        const queryString = this.buildQueryString({ filter: { studentId } });
        const response = await apiClient.get<Course[]>(`${apiEndpoints.courses.completed}${queryString}`);
        return response.data;
    }

    async checkConflict(courseId: string, studentId: string): Promise<{
        hasConflict: boolean;
        conflictingCourses?: Course[];
    }> {
        const response = await apiClient.post<{ hasConflict: boolean; conflictingCourses?: Course[] }>(
            '/courses/check-conflict',
            { courseId, studentId }
        );
        return response.data;
    }
}

// Export singleton instance
export const courseRepository = new CourseRepository(); 