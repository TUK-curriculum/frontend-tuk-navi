import { Course, DayKey } from '../types/course';
import { periods } from '../data/periodMap';

const dayMap: { [key: string]: DayKey } = {
    '월': 'monday', '화': 'tuesday', '수': 'wednesday', '목': 'thursday', '금': 'friday',
    '월요일': 'monday', '화요일': 'tuesday', '수요일': 'wednesday', '목요일': 'thursday', '금요일': 'friday'
};

function findPeriods(text: string): { startPeriod: number, endPeriod: number } | null {
    const periodRegex = /(\d{1,2})\s*(?:[~,-]\s*(\d{1,2}))?교?/;
    const periodMatch = text.match(periodRegex);
    if (periodMatch) {
        const start = parseInt(periodMatch[1], 10);
        const end = periodMatch[2] ? parseInt(periodMatch[2], 10) : start;
        if (start > 0 && start <= periods.length) {
            return { startPeriod: start, endPeriod: end > start ? end : start };
        }
    }

    const timeRegex = /(\d{2}:\d{2})\s*[~-]\s*(\d{2}:\d{2})/;
    const timeMatch = text.match(timeRegex);
    if (timeMatch) {
        const startTime = timeMatch[1];
        const endTime = timeMatch[2];
        const startPeriod = periods.findIndex(p => p.start === startTime) + 1;
        const endPeriod = periods.findIndex(p => p.end === endTime) + 1;
        if (startPeriod > 0 && endPeriod > 0) {
            return { startPeriod, endPeriod };
        }
    }
    return null;
}

export function parseOcrText(text: string): Partial<Course>[] {
    const lines = text.split('\n').filter(line => line.trim().length > 2);
    const suggestions: Partial<Course>[] = [];

    for (const line of lines) {
        let currentLine = line.replace(/\s+/g, ' ').trim();
        let day: DayKey | null = null;

        for (const key in dayMap) {
            if (currentLine.includes(key)) {
                day = dayMap[key];
                currentLine = currentLine.replace(key, '').trim();
                break;
            }
        }

        if (!day) continue;

        const periodInfo = findPeriods(currentLine);

        if (periodInfo) {
            const periodRegex = /(\d{1,2})\s*(?:[~,-]\s*(\d{1,2}))?교?|(\d{2}:\d{2})\s*[~-]\s*(\d{2}:\d{2})/;
            currentLine = currentLine.replace(periodRegex, '').trim();
        }

        const name = currentLine.replace(/[()[\]{}]/g, ' ').split(/\s+/).filter(s => s.length > 1)[0] || '분석 실패';
        if (name === '분석 실패') continue;

        const suggestion: Partial<Course> = {
            id: `ocr-${Date.now()}-${suggestions.length}`,
            name,
            day,
            startPeriod: periodInfo?.startPeriod ?? 1,
            endPeriod: periodInfo?.endPeriod ?? 1,
            credits: 3,
            type: 'elective',
            room: '',
            instructor: '',
        };
        suggestions.push(suggestion);
    }

    return suggestions;
} 