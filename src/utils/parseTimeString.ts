export type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
export type ParsedTime =
    | { day: DayKey; startPeriod: number; endPeriod: number }
    | { day: DayKey; start: string; end: string };

// 챗봇에서 내려오는 시간 문자열을 파싱하는 함수
export function parseChatbotTimeString(
    timeString: string
): { day: DayKey; startPeriod: number; endPeriod: number } | null {
    const parsed = parseTimeString(timeString);

    if (parsed && 'startPeriod' in parsed) {
        return parsed;
    }

    if (parsed && 'start' in parsed) {
        const p = parsed as Extract<ParsedTime, { start: string; end: string }>;
        const startPeriod = timeToPeriod(p.start);
        const endPeriod = timeToPeriod(p.end);
        return { day: p.day, startPeriod, endPeriod };
    }

    return null;
}

// 시간을 교시로 변환하는 함수
function timeToPeriod(time: string): number {
    const [hour, minute] = time.split(':').map(Number);
    const totalMinutes = hour * 60 + minute;

    // 교시별 시간 매핑 (예시)
    const periodMap: { [key: number]: number } = {
        570: 1,   // 09:30
        630: 2,   // 10:30
        690: 3,   // 11:30
        750: 4,   // 12:30
        810: 5,   // 13:30
        870: 6,   // 14:30
        930: 7,   // 15:30
        990: 8,   // 16:30
        1045: 9,  // 17:25
        1095: 10, // 18:15
        1145: 11, // 19:05
        1200: 12, // 20:00
        1250: 13, // 20:50
        1300: 14, // 21:40
    };

    return periodMap[totalMinutes] || 1;
}

/** "월 2교시" | "목 3~4교시" | "13th 20:50~21:40" 등을 표준 구조로 변환 */
export function parseTimeString(raw: string): ParsedTime | null {
    raw = raw.trim();

    // ① '월 2교시' or '목 3~4교시'
    const kor = raw.match(/^([월화수목금])\s*([\d]+)(~([\d]+))?교시$/);
    if (kor) {
        const [, d, p1, , p2] = kor;
        const day = korDayToKey(d);
        const startPeriod = Number(p1);
        const endPeriod = p2 ? Number(p2) : startPeriod;
        return { day, startPeriod, endPeriod };
    }

    // ② '13th 20:50~21:40'
    const eng = raw.match(/^(\d{1,2})(st|nd|rd|th)\s+(\d{2}:\d{2})~(\d{2}:\d{2})$/i);
    if (eng) {
        const [, idx, , start, end] = eng;
        const day = indexToKey(Number(idx));
        return { day, start, end };
    }

    // ③ '화 09:00~11:50'
    const korTime = raw.match(/^([월화수목금])\s+(\d{2}:\d{2})~(\d{2}:\d{2})$/);
    if (korTime) {
        const [, d, start, end] = korTime;
        const day = korDayToKey(d);
        return { day, start, end };
    }

    return null;
}

function korDayToKey(kor: string): DayKey {
    const map: Record<string, DayKey> = {
        월: 'monday',
        화: 'tuesday',
        수: 'wednesday',
        목: 'thursday',
        금: 'friday',
    };
    return map[kor] ?? 'monday';
}

function indexToKey(idx: number): DayKey {
    const arr: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    return arr[(idx - 1) % 5];
} 