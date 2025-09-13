import { Course, DayKey, CourseType } from "@/types/course";

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