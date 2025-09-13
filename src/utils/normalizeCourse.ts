import { idxToTime, timeToIdx } from './periods';
import { CourseCore, Course, DayKey } from '../types/course';
import { parseTimeString } from './parseTimeString';

function isCourseCore(obj: any): obj is CourseCore {
    return obj && 'startPeriod' in obj && 'endPeriod' in obj && 'name' in obj;
}

export function normalizeCourse(raw: Record<string, unknown>): CourseCore {
    if (isCourseCore(raw)) {
        return raw;
    }

    const r = raw as any;
    const parsed = parseTimeString(r.time ?? `${r.startTime}~${r.endTime}`);
    const startIdx = 'startPeriod' in (parsed ?? {}) ? (parsed as any).startPeriod : timeToIdx(r.startTime);
    const endIdx = 'endPeriod' in (parsed ?? {}) ? (parsed as any).endPeriod : timeToIdx(r.endTime);

    return {
        id: r.id ?? (typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).slice(2)),
        name: r.name,
        day: 'day' in (parsed ?? {}) ? (parsed as any).day : r.day,
        startPeriod: startIdx,
        endPeriod: endIdx,
        credits: r.credits ?? 3,
        room: r.room ?? '',
        type: r.type ?? 'elective',
        code: r.code ?? '',
        instructor: r.instructor ?? '',
    };
}

export const toRuntimeCourse = (c: CourseCore): Course => ({
    ...c,
    startTime: idxToTime(c.startPeriod, 'start'),
    endTime: idxToTime(c.endPeriod, 'end'),
    code: c.code ?? '',
    instructor: c.instructor ?? '',
}); 