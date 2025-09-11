export interface Professor {
  id: number;
  name: string;
  email?: string;
  office?: string;
  position?: string;
  research_area?: string;
  major_name?: string;
  lecture_count: number;
}

export interface PreferredProfessor {
  preferred_id: number;
  professor_id: number;
  name: string;
  email?: string;
  office?: string;
  position?: string;
  research_area?: string;
  major_name?: string;
  lecture_count: number;
}

export interface ProfessorLecture {
  id: number;
  name: string;
  grade: string;
  semester: string;
  room: string;
  year: number;
  course_name: string;
  course_type: string;
  credit: number;
}