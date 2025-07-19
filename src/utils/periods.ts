export const periods = [
    { idx: 1, start: '09:30', end: '10:20' },
    { idx: 2, start: '10:30', end: '11:20' },
    { idx: 3, start: '11:30', end: '12:20' },
    { idx: 4, start: '12:30', end: '13:20' },
    { idx: 5, start: '13:30', end: '14:20' },
    { idx: 6, start: '14:30', end: '15:20' },
    { idx: 7, start: '15:30', end: '16:20' },
    { idx: 8, start: '16:30', end: '17:20' },
    { idx: 9, start: '17:25', end: '18:15' },
    { idx: 10, start: '18:15', end: '19:05' },
    { idx: 11, start: '19:05', end: '19:55' },
    { idx: 12, start: '20:00', end: '20:50' },
    { idx: 13, start: '20:50', end: '21:40' },
    { idx: 14, start: '21:40', end: '22:30' },
];

export const idxToTime = (idx: number, which: 'start' | 'end') =>
    periods.find(p => p.idx === idx)?.[which] ?? '';

export const timeToIdx = (time: string) =>
    periods.find(p => p.start === time || p.end === time)?.idx ?? -1; 