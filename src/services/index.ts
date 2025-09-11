// Export all services from a single entry point
export { authService } from './AuthService';
export { userService } from './UserService';
export { courseService } from './CourseService';
export { noteService } from './NoteService';
export { notificationService } from './NotificationService';
export { chatService } from './ChatService';
export { graduationService } from './GraduationService';
export { curriculumService } from './CurriculumService';
export { professorService } from './ProfessorService';

// Export types if needed by components
export type { UserSearchParams } from './UserService';
export type { TimetableValidation } from './CourseService'; 