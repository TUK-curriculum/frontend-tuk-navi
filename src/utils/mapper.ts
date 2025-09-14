import { Course, DayKey, CourseType } from "@/types/course";
import type { BackendRecord } from '@/services/ApiService';
import type { Course as GraduationCourse } from '@/stores/graduationStore';

const dayMap: Record<string, DayKey> = {
  MON: "monday",
  TUE: "tuesday",
  WED: "wednesday",
  THU: "thursday",
  FRI: "friday",
  SAT: "saturday",
  SUN: "sunday",
};

export const reverseDayMap: Record<DayKey, string> = {
  monday: "MON",
  tuesday: "TUE",
  wednesday: "WED",
  thursday: "THU",
  friday: "FRI",
  saturday: "SAT",
  sunday: "SUN"
};

export function slotToCourse(slot: any): Course {
  const lectureCode = slot.LectureCode?.code || slot.codeId?.toString() || "";

  return {
    id: Number(slot.id) || Date.now(),
    name: slot.courseName || "이름 없음",
    code: lectureCode,
    instructor: slot.instructor || "",
    day: slot.dayOfWeek ? dayMap[slot.dayOfWeek] : "monday",
    startPeriod: slot.startPeriod,
    endPeriod: slot.endPeriod,
    startTime: slot.startTime,
    endTime: slot.endTime,
    room: slot.room || "",
    credits: slot.credits || 0,
    type: (slot.type as CourseType) || "GE",
    color: slot.color || "#FF6B6B",
  };
}

export function courseToSlot(course: Course): any {
  return {
    courseName: course.name,
    codeId: course.code || null,
    instructor: course.instructor,
    dayOfWeek: reverseDayMap[course.day],
    startPeriod: course.startPeriod,
    endPeriod: course.endPeriod,
    startTime: course.startTime,
    endTime: course.endTime,
    room: course.room,
    credits: course.credits,
    type: course.type,
    color: course.color || "#FF6B6B",
  };
}

export const mapRecordToCourse = (r: BackendRecord): GraduationCourse => {
  return {
    code: r.courseCode,
    name: r.courseName,
    credit: r.credits,
    type: mapCategoryToType(r.type),
    year: r.year ?? 0,
    semester: parseSemester(r.semester),
    professor: '',
    description: '',
  };
};

const mapCategoryToType = (cat: string): string => {
  switch (cat) {
    case 'MR': return '전공필수';
    case 'ME': return '전공선택';
    case 'GR': return '교양필수';
    case 'GE': return '교양선택';
    default:   return '기타';
  }
};

const parseSemester = (sem: string): number => {
  if (!sem) return 0;
  const match = sem.match(/(\d)학기$/);
  return match ? parseInt(match[1]) : 0;
};