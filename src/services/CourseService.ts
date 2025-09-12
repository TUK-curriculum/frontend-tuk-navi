import { Course } from '../types/course';
import {
  courseRepository,
  CourseCreateDTO,
  CourseUpdateDTO,
  CourseSearchParams,
  CourseEnrollmentDTO
} from '../repositories/CourseRepository';
import { ApiError, ErrorCode } from '../errors/ApiError';

export interface TimetableValidation {
  isValid: boolean;
  conflicts: Course[];
  totalCredits: number;
  warnings: string[];
}

export class CourseService {
  private static instance: CourseService;

  private constructor() { }

  static getInstance(): CourseService {
    if (!CourseService.instance) {
      CourseService.instance = new CourseService();
    }
    return CourseService.instance;
  }

  /**
   * 모든 강의 조회
   */
  async getAllCourses(options?: { page?: number; limit?: number }): Promise<Course[]> {
    try {
      return await courseRepository.findAll(options);
    } catch (error) {
      console.error('Failed to get all courses:', error);
      throw new ApiError(
        ErrorCode.SERVER_ERROR,
        '강의 목록을 불러오는데 실패했습니다.'
      );
    }
  }

  /**
   * 강의 ID로 조회
   */
  async getCourseById(id: number): Promise<Course> {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new ApiError(
        ErrorCode.NOT_FOUND,
        '강의를 찾을 수 없습니다.'
      );
    }
    return course;
  }

  /**
   * 강의 검색
   */
  async searchCourses(params: CourseSearchParams): Promise<Course[]> {
    try {
      return await courseRepository.search(params);
    } catch (error) {
      console.error('Failed to search courses:', error);
      return [];
    }
  }

  /**
   * 새 강의 생성 (관리자용)
   */
  async createCourse(data: CourseCreateDTO): Promise<Course> {
    // Validate required fields
    if (!data.name || !data.code || !data.day || !data.startPeriod || !data.endPeriod) {
      throw new ApiError(
        ErrorCode.VALIDATION_ERROR,
        '필수 입력 항목을 확인해주세요.'
      );
    }

    // Validate period range
    if (data.startPeriod < 1 || data.endPeriod > 14 || data.startPeriod > data.endPeriod) {
      throw new ApiError(
        ErrorCode.VALIDATION_ERROR,
        '올바른 교시를 입력해주세요. (1-14교시)'
      );
    }

    // Validate credits
    if (data.credits < 1 || data.credits > 6) {
      throw new ApiError(
        ErrorCode.VALIDATION_ERROR,
        '학점은 1-6 사이여야 합니다.'
      );
    }

    try {
      return await courseRepository.create(data);
    } catch (error) {
      console.error('Failed to create course:', error);
      throw new ApiError(
        ErrorCode.SERVER_ERROR,
        '강의 생성에 실패했습니다.'
      );
    }
  }

  /**
   * 강의 정보 업데이트
   */
  async updateCourse(id: number, data: CourseUpdateDTO): Promise<Course> {
    // Check if course exists
    await this.getCourseById(id);

    // Validate period range if provided
    if (data.startPeriod || data.endPeriod) {
      const startPeriod = data.startPeriod || 1;
      const endPeriod = data.endPeriod || 14;

      if (startPeriod < 1 || endPeriod > 14 || startPeriod > endPeriod) {
        throw new ApiError(
          ErrorCode.VALIDATION_ERROR,
          '올바른 교시를 입력해주세요. (1-14교시)'
        );
      }
    }

    try {
      return await courseRepository.update(id, data);
    } catch (error) {
      console.error('Failed to update course:', error);
      throw new ApiError(
        ErrorCode.SERVER_ERROR,
        '강의 정보 업데이트에 실패했습니다.'
      );
    }
  }

  /**
   * 강의 삭제
   */
  async deleteCourse(id: number): Promise<void> {
    // Check if course exists
    await this.getCourseById(id);

    try {
      await courseRepository.delete(id);
    } catch (error) {
      console.error('Failed to delete course:', error);
      throw new ApiError(
        ErrorCode.SERVER_ERROR,
        '강의 삭제에 실패했습니다.'
      );
    }
  }

  /**
   * 수강 신청
   */
  async enrollCourse(enrollment: CourseEnrollmentDTO): Promise<void> {
    // Check if course exists
    await this.getCourseById(enrollment.courseId);

    // Check for time conflicts
    const conflictCheck = await courseRepository.checkConflict(
      enrollment.courseId,
      enrollment.studentId
    );

    if (conflictCheck.hasConflict) {
      const conflictingCourseNames = conflictCheck.conflictingCourses
        ?.map(c => c.name)
        .join(', ');

      throw new ApiError(
        ErrorCode.VALIDATION_ERROR,
        `시간표가 겹칩니다: ${conflictingCourseNames}`
      );
    }

    try {
      await courseRepository.enrollCourse(enrollment);
    } catch (error) {
      console.error('Failed to enroll course:', error);
      throw new ApiError(
        ErrorCode.SERVER_ERROR,
        '수강 신청에 실패했습니다.'
      );
    }
  }

  /**
   * 수강 취소
   */
  async dropCourse(courseId: string, studentId: string): Promise<void> {
    // Check if course exists
    await this.getCourseById(courseId);

    try {
      await courseRepository.dropCourse(courseId, studentId);
    } catch (error) {
      console.error('Failed to drop course:', error);
      throw new ApiError(
        ErrorCode.SERVER_ERROR,
        '수강 취소에 실패했습니다.'
      );
    }
  }

  /**
   * 이수 완료 과목 조회
   */
  async getCompletedCourses(studentId: string): Promise<Course[]> {
    try {
      return await courseRepository.getCompletedCourses(studentId);
    } catch (error) {
      console.error('Failed to get completed courses:', error);
      return [];
    }
  }

  /**
   * 시간표 유효성 검증
   */
  async validateTimetable(courses: Course[]): Promise<TimetableValidation> {
    const validation: TimetableValidation = {
      isValid: true,
      conflicts: [],
      totalCredits: 0,
      warnings: [],
    };

    // Calculate total credits
    validation.totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);

    // Check credit limits
    if (validation.totalCredits > 21) {
      validation.warnings.push('수강 가능 학점(21학점)을 초과했습니다.');
      validation.isValid = false;
    } else if (validation.totalCredits < 12) {
      validation.warnings.push('최소 이수 학점(12학점)보다 적습니다.');
    }

    // Check for time conflicts
    for (let i = 0; i < courses.length; i++) {
      for (let j = i + 1; j < courses.length; j++) {
        const course1 = courses[i];
        const course2 = courses[j];

        if (course1.day === course2.day) {
          const hasConflict =
            (course1.startPeriod <= course2.startPeriod && course2.startPeriod <= course1.endPeriod) ||
            (course1.startPeriod <= course2.endPeriod && course2.endPeriod <= course1.endPeriod) ||
            (course2.startPeriod <= course1.startPeriod && course1.endPeriod <= course2.endPeriod);

          if (hasConflict) {
            validation.conflicts.push(course1, course2);
            validation.isValid = false;
            validation.warnings.push(
              `${course1.name}와 ${course2.name}의 시간이 겹칩니다.`
            );
          }
        }
      }
    }

    return validation;
  }

  /**
   * 추천 강의 조회
   */
  async getRecommendedCourses(
    studentId: string,
    major: string,
    completedCourseIds: string[]
  ): Promise<Course[]> {
    try {
      // Get all courses for the major
      const majorCourses = await this.searchCourses({ query: major });

      // Filter out completed courses
      const availableCourses = majorCourses.filter(
        course => !completedCourseIds.includes(course.id)
      );

      // Sort by type (required first) and credits
      return availableCourses.sort((a, b) => {
        if (a.type === 'required' && b.type !== 'required') return -1;
        if (a.type !== 'required' && b.type === 'required') return 1;
        return b.credits - a.credits;
      }).slice(0, 10);
    } catch (error) {
      console.error('Failed to get recommended courses:', error);
      return [];
    }
  }
}

// Export singleton instance
export const courseService = CourseService.getInstance(); 