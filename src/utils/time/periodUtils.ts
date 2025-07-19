import { periodMap } from './periodMap';

/**
 * Convert start/end time strings ("09:30", "10:20") → 교시 번호(1~14)
 */
export function startEndFromTimes(startTime: string, endTime: string) {
    const sIdx = periodMap.findIndex(p => p.start === startTime);
    const eIdx = periodMap.findIndex(p => p.end === endTime);

    if (sIdx < 0 || eIdx < 0) {
        throw new Error(`Invalid time range: ${startTime}~${endTime}`);
    }

    return { startPeriod: sIdx + 1, endPeriod: eIdx + 1 } as const;
}

/**
 * Convert 교시 번호(1~14) → start/end time strings
 */
export function timesFromPeriods(startPeriod: number, endPeriod: number) {
    return {
        startTime: periodMap[startPeriod - 1]?.start,
        endTime: periodMap[endPeriod - 1]?.end,
    } as const;
} 