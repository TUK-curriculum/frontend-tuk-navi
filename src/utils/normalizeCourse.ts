import { idxToTime, timeToIdx } from './periods';
import { CourseCore, Course, DayKey } from '../types/course';
import { parseTimeString } from './parseTimeString';

export function normalizeCourse(raw: Record<string, unknown>): CourseCore {
    // 이미 교시 기반이면 그대로
    if (raw.startPeriod && raw.endPeriod) return raw as CourseCore;

    // "월 3교시",  "13th 20:50~21:40"  같은 문자열 처리
    const parsed = parseTimeString(raw.time ?? `${raw.startTime}~${raw.endTime}`);
    const startIdx = parsed?.startIdx ?? timeToIdx(raw.startTime);
    const endIdx = parsed?.endIdx ?? timeToIdx(raw.endTime);

    return {
        id: raw.id ?? (typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).slice(2)),
        name: raw.name,
        day: parsed?.dayKey ?? raw.day,
        startPeriod: startIdx,
        endPeriod: endIdx,
        credits: raw.credits ?? 3,
        room: raw.room ?? '',
        type: raw.type ?? 'elective',
    };
}

export const toRuntimeCourse = (c: CourseCore): Course => ({
    ...c,
    startTime: idxToTime(c.startPeriod, 'start'),
    endTime: idxToTime(c.endPeriod, 'end'),
    code: c.code ?? '',
    instructor: c.instructor ?? '',
}); 