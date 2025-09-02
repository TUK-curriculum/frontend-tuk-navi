// src/mocks/chatbot.mock.ts
// 챗봇 데모용 mock 데이터 및 시나리오

import { Course, DayKey } from '../types/course';

// 커리큘럼 추천 타입
export interface CurriculumSuggestion {
    title: string;
    description: string;
    subjects: string[];
    totalCredits: number;
    graduationRate: number;
    semesters: Semester[];
    externalCourses?: { name: string; url: string; desc?: string }[];
}

export interface Semester {
    semester: string;
    subjects: Subject[];
    credits: number;
}

export interface Subject {
    name: string;
    type: '필수' | '트랙' | '선택' | '교양' | '외부';
    source?: string;
    url?: string;
}

// 메시지 타입 정의
export interface UserMessage {
    from: 'user';
    text: string;
}

export interface AITextMessage {
    from: 'ai';
    type: 'text';
    text: string;
}

export interface AICurriculumMessage {
    from: 'ai';
    type: 'curriculum-suggestion';
    content: CurriculumSuggestion;
}

export interface AIScheduleMessage {
    from: 'ai';
    type: 'schedule-suggestion';
    content: {
        message: string;
        schedule: {
            monday: string[];
            tuesday: string[];
            wednesday: string[];
            thursday: string[];
            friday: string[];
        };
    };
}

export interface AIActionMessage {
    from: 'ai';
    type: 'action-buttons';
    content: {
        title: string;
        buttons: {
            text: string;
            action: string;
            color: string;
        }[];
    };
}

export interface AICurriculumListMessage {
    from: 'ai';
    type: 'curriculum-list';
    list: CurriculumSuggestion[];
}

export interface AICurriculumDetailMessage {
    from: 'ai';
    type: 'curriculum-detail';
    content: CurriculumSuggestion;
}

export interface AIScheduleDetailMessage {
    from: 'ai';
    type: 'schedule';
    content: {
        title: string;
        rows: {
            day: string;
            time: string;
            subject: string;
            room: string;
            professor: string;
        }[];
    };
}

export interface AITrackListMessage {
    from: 'ai';
    type: 'track-list';
    tracks: CurriculumSuggestion[];
}

export type ChatMessage = UserMessage | AITextMessage | AICurriculumMessage | AIScheduleMessage | AIActionMessage | AICurriculumListMessage | AICurriculumDetailMessage | AIScheduleDetailMessage | AITrackListMessage;

// 데모용 커리큘럼 트랙 데이터
export const curriculumTracks: CurriculumSuggestion[] = [
    {
        title: '정보보안 트랙',
        description: '정보보안 전문가를 위한 실전 중심 커리큘럼입니다.',
        subjects: ['자료구조', '컴퓨터구조', '운영체제', '정보보안개론'],
        totalCredits: 130,
        graduationRate: 95,
        semesters: [
            {
                semester: '2학년 1학기',
                credits: 18,
                subjects: [
                    { name: '자료구조', type: '필수' },
                    { name: '컴퓨터구조', type: '필수' }
                ]
            },
            {
                semester: '2학년 2학기',
                credits: 18,
                subjects: [
                    { name: '운영체제', type: '필수' },
                    { name: '정보보안개론', type: '트랙' }
                ]
            }
        ],
        externalCourses: [
            { name: 'K-MOOC 정보보안개론', url: 'https://www.kmooc.kr', desc: '정보보안 기초 이론' }
        ]
    },
    {
        title: 'AI 트랙',
        description: 'AI 전문가를 위한 최신 인공지능 커리큘럼입니다.',
        subjects: ['인공지능개론', '머신러닝', '딥러닝'],
        totalCredits: 120,
        graduationRate: 97,
        semesters: [
            {
                semester: '2학년 1학기',
                credits: 18,
                subjects: [
                    { name: '인공지능개론', type: '필수' },
                    { name: '머신러닝', type: '트랙' }
                ]
            },
            {
                semester: '2학년 2학기',
                credits: 18,
                subjects: [
                    { name: '딥러닝', type: '트랙' },
                    { name: '자연어처리', type: '트랙' }
                ]
            }
        ],
        externalCourses: [
            { name: 'Coursera Deep Learning', url: 'https://www.coursera.org', desc: '딥러닝 실무' }
        ]
    },
    {
        title: '네트워크 전공 트랙',
        description: '네트워크 엔지니어를 위한 실무 중심 커리큘럼입니다.',
        subjects: ['네트워크프로그래밍', '클라우드컴퓨팅', 'IoT시스템'],
        totalCredits: 125,
        graduationRate: 93,
        semesters: [
            {
                semester: '2학년 1학기',
                credits: 18,
                subjects: [
                    { name: '네트워크프로그래밍', type: '트랙' },
                    { name: '클라우드컴퓨팅', type: '트랙' }
                ]
            }
        ],
        externalCourses: [
            { name: 'AWS 네트워킹', url: 'https://aws.amazon.com', desc: '클라우드 네트워킹' }
        ]
    },
    {
        title: '데이터사이언스 트랙',
        description: '데이터 분석가를 위한 통계 및 머신러닝 커리큘럼입니다.',
        subjects: ['통계학', '데이터마이닝', '데이터시각화'],
        totalCredits: 128,
        graduationRate: 96,
        semesters: [
            {
                semester: '2학년 1학기',
                credits: 18,
                subjects: [
                    { name: '통계학', type: '필수' },
                    { name: '데이터마이닝', type: '트랙' }
                ]
            }
        ],
        externalCourses: [
            { name: 'Kaggle 데이터사이언스', url: 'https://www.kaggle.com', desc: '실전 데이터 분석' }
        ]
    },
    {
        title: '임베디드 트랙',
        description: '임베디드 시스템 개발자를 위한 하드웨어 중심 커리큘럼입니다.',
        subjects: ['마이크로프로세서', '펌웨어개발', 'IoT프로그래밍'],
        totalCredits: 132,
        graduationRate: 94,
        semesters: [
            {
                semester: '2학년 1학기',
                credits: 18,
                subjects: [
                    { name: '마이크로프로세서', type: '트랙' },
                    { name: '펌웨어개발', type: '트랙' }
                ]
            }
        ],
        externalCourses: [
            { name: 'Arduino IoT', url: 'https://www.arduino.cc', desc: 'IoT 하드웨어 개발' }
        ]
    }
];

// 외부 강의 추천 데이터
export const externalCourses = {
    '정보보안 트랙': [
        { name: 'K-MOOC 정보보안', url: 'https://www.kmooc.kr' },
        { name: 'edX Cybersecurity Fundamentals', url: 'https://www.edx.org' },
        { name: 'Coursera IT Security', url: 'https://www.coursera.org' },
    ],
    '네트워크 전공 트랙': [
        { name: 'K-MOOC 네트워크', url: 'https://www.kmooc.kr' },
        { name: 'edX Computer Networks', url: 'https://www.edx.org' },
        { name: 'Coursera Networking Basics', url: 'https://www.coursera.org' },
    ],
    'AI 트랙': [
        { name: 'K-MOOC 인공지능', url: 'https://www.kmooc.kr' },
        { name: 'Coursera Deep Learning', url: 'https://www.coursera.org' },
        { name: 'edX AI for Everyone', url: 'https://www.edx.org' },
    ],
    '데이터사이언스 트랙': [
        { name: 'K-MOOC 데이터사이언스', url: 'https://www.kmooc.kr' },
        { name: 'Coursera Data Science', url: 'https://www.coursera.org' },
        { name: 'edX Data Science Essentials', url: 'https://www.edx.org' },
    ],
    '임베디드 트랙': [
        { name: 'K-MOOC 임베디드', url: 'https://www.kmooc.kr' },
        { name: 'Coursera Embedded Systems', url: 'https://www.coursera.org' },
        { name: 'edX Embedded Systems', url: 'https://www.edx.org' },
    ],
};

// 데모용 초기 대화 히스토리
export const mockHistory: ChatMessage[] = [
    { from: "user", text: "안녕하세요! AI 분야로 진로를 바꾸고 싶은데 어떤 과목을 들어야 할까요?" },
    {
        from: "ai",
        type: "text",
        text: "안녕하세요! AI 분야 진로 변경을 도와드리겠습니다. 현재 3학년이고 89학점을 이수하셨네요. AI 분야로 진로를 바꾸시려면 다음과 같은 커리큘럼을 추천드립니다:"
    },
    {
        from: "ai",
        type: "curriculum-suggestion",
        content: curriculumTracks[1] // AI 트랙
    },
    {
        from: "ai",
        type: "action-buttons",
        content: {
            title: "이 커리큘럼으로 진행하시겠습니까?",
            buttons: [
                { text: "커리큘럼 생성하기", action: "generate-curriculum", color: "primary" },
                { text: "다른 옵션 보기", action: "show-alternatives", color: "secondary" },
                { text: "시간표 생성하기", action: "generate-schedule", color: "success" }
            ]
        }
    }
];

// 시간표 교시 정보
export const periodSlots = [
    { label: '1교시', time: '09:30~10:20', start: '09:30', end: '10:20' },
    { label: '2교시', time: '10:30~11:20', start: '10:30', end: '11:20' },
    { label: '3교시', time: '11:30~12:20', start: '11:30', end: '12:20' },
    { label: '4교시', time: '12:30~13:20', start: '12:30', end: '13:20' },
    { label: '5교시', time: '13:30~14:20', start: '13:30', end: '14:20' },
    { label: '6교시', time: '14:30~15:20', start: '14:30', end: '15:20' },
    { label: '7교시', time: '15:30~16:20', start: '15:30', end: '16:20' },
    { label: '8교시', time: '16:30~17:20', start: '16:30', end: '17:20' },
    { label: '9교시', time: '17:25~18:15', start: '17:25', end: '18:15' },
    { label: '10교시', time: '18:15~19:05', start: '18:15', end: '19:05' },
    { label: '11교시', time: '19:05~19:55', start: '19:05', end: '19:55' },
    { label: '12교시', time: '20:00~20:50', start: '20:00', end: '20:50' },
    { label: '13교시', time: '20:50~21:40', start: '20:50', end: '21:40' },
    { label: '14교시', time: '21:40~22:30', start: '21:40', end: '22:30' },
];

// 시간표 생성용 슬롯
export const timetableSlots = [
    { day: 'monday', time: '09:00~10:30' },
    { day: 'monday', time: '14:00~15:30' },
    { day: 'tuesday', time: '10:00~11:30' },
    { day: 'wednesday', time: '13:00~14:30' },
    { day: 'thursday', time: '09:00~10:30' },
    { day: 'friday', time: '15:00~16:30' },
    { day: 'thursday', time: '11:00~12:30' },
    { day: 'wednesday', time: '15:00~16:30' },
    { day: 'tuesday', time: '13:00~14:30' },
    { day: 'friday', time: '10:00~11:30' },
];

// 트랙별 대표 이모지 함수
export function iconForTrack(title: string) {
    if (title.includes('정보보안')) return '🔒';
    if (title.includes('네트워크')) return '🌐';
    if (title.includes('AI')) return '🤖';
    if (title.includes('데이터')) return '📊';
    if (title.includes('임베디드')) return '🛠️';
    return '📚';
}

// 데모용 AI 응답 생성 함수
export const generateMockAIResponse = (userInput: string, userContext?: any): ChatMessage[] => {
    const lowerInput = userInput.toLowerCase();

    if (lowerInput.includes('커리큘럼')) {
        return [
            { from: 'ai', type: 'track-list', tracks: curriculumTracks }
        ];
    } else if (lowerInput.includes('과목') || lowerInput.includes('추천')) {
        let personalizedMessage = '추천 과목을 알려드릴게요!';
        if (userContext) {
            if (userContext.career) {
                personalizedMessage = `${userContext.career} 분야로 진로를 준비하시는군요! 관련 과목을 추천해드릴게요.`;
            } else if (userContext.interests?.length > 0) {
                personalizedMessage = `${userContext.interests.join(', ')} 분야에 관심이 있으시군요! 관련 과목을 추천해드릴게요.`;
            }
        }

        return [
            { from: 'ai', type: 'text', text: personalizedMessage }
        ];
    } else if (lowerInput.includes('시간표') || lowerInput.includes('스케줄')) {
        return [
            {
                from: 'ai',
                type: 'schedule-suggestion',
                content: {
                    message: '커리큘럼을 기반으로 시간표를 생성해드릴까요?',
                    schedule: {
                        monday: ['인공지능 개론 (09:00-10:30)', '머신러닝 (14:00-15:30)'],
                        tuesday: ['웹프로그래밍 (10:00-11:30)'],
                        wednesday: ['데이터베이스 시스템 (13:00-14:30)'],
                        thursday: ['알고리즘과 자료구조 (09:00-10:30)'],
                        friday: ['소프트웨어공학 (15:00-16:30)']
                    }
                }
            }
        ];
    } else if (lowerInput.includes('졸업') || lowerInput.includes('요건')) {
        let graduationMessage = '졸업 요건을 확인해드릴게요!';
        if (userContext) {
            const progress = userContext.credits > 0 ? Math.round((userContext.credits / 130) * 100) : 0;
            graduationMessage = `현재 ${userContext.credits}학점을 이수하셨고, 졸업까지 ${130 - userContext.credits}학점이 남았습니다. (진행률: ${progress}%)`;
        }

        return [
            { from: 'ai', type: 'text', text: graduationMessage }
        ];
    } else if (lowerInput.includes('내 정보') || lowerInput.includes('프로필')) {
        if (userContext) {
            const profileMessage = `${userContext.name}님의 정보\n\n` +
                `• 전공: ${userContext.major}\n` +
                `• 학년: ${userContext.grade}\n` +
                `• 이수 학점: ${userContext.credits}학점\n` +
                `• 희망 진로: ${userContext.career || '미설정'}\n` +
                `• 관심 분야: ${userContext.interests?.length > 0 ? userContext.interests.join(', ') : '미설정'}\n` +
                `• 잔여 학기: ${userContext.remainingSemesters}학기\n` +
                `• 학기당 최대 학점: ${userContext.maxCreditsPerTerm}학점`;

            return [
                { from: 'ai', type: 'text', text: profileMessage }
            ];
        } else {
            return [
                { from: 'ai', type: 'text', text: '사용자 정보를 찾을 수 없습니다. 온보딩을 완료해주세요.' }
            ];
        }
    } else {
        return [
            { from: 'ai', type: 'text', text: 'AI 분석 결과를 바탕으로 개인화된 추천을 제공해드릴 수 있습니다. 커리큘럼 추천, 시간표 생성, 졸업 요건 확인 등 무엇이든 물어보세요!' }
        ];
    }
};

// 데모용 시간표 생성 함수
export const generateMockSchedule = (curriculum: CurriculumSuggestion, semester: string): Course[] => {
    // 현재 학기 과목 탐색
    let sem = curriculum.semesters.find(s => (s.semester + '학기') === semester || s.semester === semester);

    // 과목이 없으면 첫 번째로 과목이 존재하는 학기로 자동 대체
    if (!sem || !Array.isArray(sem.subjects) || sem.subjects.length === 0) {
        sem = curriculum.semesters.find(s => (s.subjects ?? []).length > 0);
    }

    if (!sem || !Array.isArray(sem.subjects) || sem.subjects.length === 0) {
        return [];
    }

    // 현실적인 시간표 슬롯 정의
    const realisticTimeSlots = [
        { day: 'monday' as DayKey, time: '09:30~10:20', period: '1교시', room: '201호' },
        { day: 'monday' as DayKey, time: '13:30~14:20', period: '5교시', room: '202호' },
        { day: 'tuesday' as DayKey, time: '10:30~11:20', period: '2교시', room: '301호' },
        { day: 'tuesday' as DayKey, time: '14:30~15:20', period: '6교시', room: '302호' },
        { day: 'wednesday' as DayKey, time: '11:30~12:20', period: '3교시', room: '401호' },
        { day: 'thursday' as DayKey, time: '09:30~10:20', period: '1교시', room: '501호' },
        { day: 'thursday' as DayKey, time: '13:30~14:20', period: '5교시', room: '502호' },
        { day: 'friday' as DayKey, time: '10:30~11:20', period: '2교시', room: '601호' },
    ];

    // 교수진 이름 (트랙별로 다른 교수진)
    const professors = {
        'AI': ['김인공', '이지능', '박머신', '최딥러', '정자연'],
        '정보보안': ['김보안', '이암호', '박네트워크', '최시스템', '정포렌식'],
        '네트워크': ['김네트워크', '이클라우드', '박분산', '최IoT', '정무선'],
        '데이터사이언스': ['김데이터', '이통계', '박마이닝', '최시각화', '정빅데이터'],
        '임베디드': ['김임베디드', '이마이크로', '박펌웨어', '최하드웨어', '정IoT'],
        'default': ['김교수', '이교수', '박교수', '최교수', '정교수']
    };

    // 트랙별 교수진 선택
    const getProfessorList = (trackName: string) => {
        if (!trackName) return professors['default'];
        if (trackName.includes('AI')) return professors['AI'];
        if (trackName.includes('정보보안')) return professors['정보보안'];
        if (trackName.includes('네트워크')) return professors['네트워크'];
        if (trackName.includes('데이터')) return professors['데이터사이언스'];
        if (trackName.includes('임베디드')) return professors['임베디드'];
        return professors['default'];
    };

    const professorList = getProfessorList(curriculum.title || '');

    // 과목별로 현실적인 시간표 생성 (최대 5개 과목으로 제한)
    const maxSubjects = Math.min(sem.subjects.length, 5);
    const selectedSubjects = sem.subjects.slice(0, maxSubjects);

    return selectedSubjects.map((subject, idx) => {
        const slot = realisticTimeSlots[idx % realisticTimeSlots.length];
        const professor = professorList[idx % professorList.length];
        const codeBase = (curriculum?.title || '').replace(/\s/g, '').toUpperCase().slice(0, 4);

        // 시간대에 맞는 period 계산
        const periodStart = parseInt(slot.period.replace('교시', '')) || 1;
        const periodEnd = periodStart;

        // type 변환: '필수'->'required', '교양'->'liberal', 나머지->'elective'
        let courseType: 'required' | 'elective' | 'liberal' = 'elective';
        if (subject.type === '필수') courseType = 'required';
        else if (subject.type === '교양') courseType = 'liberal';

        return {
            id: `${Date.now()}_${idx}`,
            name: subject.name,
            code: `${codeBase}${100 + idx}`,
            instructor: professor,
            credits: 3,
            day: slot.day,
            startTime: slot.time.split('~')[0],
            endTime: slot.time.split('~')[1],
            room: slot.room,
            type: courseType,
            startPeriod: periodStart,
            endPeriod: periodEnd
        };
    });
};

// 데모용 액션 버튼 응답
export const generateMockActionResponse = (action: string): ChatMessage => {
    switch (action) {
        case 'generate-curriculum':
            return {
                from: "ai",
                type: "text",
                text: "커리큘럼이 성공적으로 생성되었습니다! 이제 시간표를 생성하시겠습니까?"
            };
        case 'generate-schedule':
            return {
                from: "ai",
                type: "schedule-suggestion",
                content: {
                    message: '커리큘럼을 기반으로 시간표를 생성했습니다.',
                    schedule: {
                        monday: ['인공지능 개론 (09:00-10:30)', '머신러닝 (14:00-15:30)'],
                        tuesday: ['웹프로그래밍 (10:00-11:30)'],
                        wednesday: ['데이터베이스 시스템 (13:00-14:30)'],
                        thursday: ['알고리즘과 자료구조 (09:00-10:30)'],
                        friday: ['소프트웨어공학 (15:00-16:30)']
                    }
                }
            };
        default:
            return {
                from: "ai",
                type: "text",
                text: "다른 옵션을 보여드리겠습니다."
            };
    }
}; 