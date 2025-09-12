// 한국공학대학교 컴퓨터공학부 졸업요건 데이터 (2021·2022학번 기준)

export interface Course {
    id: number;
    name: string;
    credits: number;
    category: string;
    type: 'required' | 'elective';
    year: number; // 1학년, 2학년, 3학년, 4학년
    semester?: number; // 1학기, 2학기
    description?: string;
}

export interface GraduationRequirements {
    totalCredits: number;
    majorRequired: number;
    majorElective: number;
    generalRequired: number;
    generalElective: number;
    basicScience: number;
}

// 컴퓨터공학부 졸업요건
export const computerEngineeringRequirements: GraduationRequirements = {
    totalCredits: 130,
    majorRequired: 28,
    majorElective: 12,
    generalRequired: 10,
    generalElective: 20,
    basicScience: 15
};

// 전공필수 과목
export const majorRequiredCourses: Course[] = [
    { id: 'CS101', name: '이산수학', credits: 3, category: '전공필수', type: 'required', year: 1, semester: 1 },
    { id: 'CS102', name: '자료구조', credits: 3, category: '전공필수', type: 'required', year: 1, semester: 2 },
    { id: 'CS201', name: '알고리즘', credits: 3, category: '전공필수', type: 'required', year: 2, semester: 1 },
    { id: 'CS202', name: '컴퓨터구조', credits: 3, category: '전공필수', type: 'required', year: 2, semester: 2 },
    { id: 'CS301', name: '운영체제', credits: 3, category: '전공필수', type: 'required', year: 3, semester: 1 },
    { id: 'CS302', name: '데이터베이스', credits: 3, category: '전공필수', type: 'required', year: 3, semester: 2 },
    { id: 'CS401', name: '컴퓨터네트워크', credits: 3, category: '전공필수', type: 'required', year: 4, semester: 1 },
    { id: 'CS402', name: '종합설계기획', credits: 1, category: '전공필수', type: 'required', year: 4, semester: 1 },
    { id: 'CS403', name: '종합설계 1', credits: 3, category: '전공필수', type: 'required', year: 4, semester: 1 },
    { id: 'CS404', name: '종합설계 2', credits: 3, category: '전공필수', type: 'required', year: 4, semester: 2 }
];

// 전공선택 과목
export const majorElectiveCourses: Course[] = [
    { id: 'CS501', name: '스마트센서개론', credits: 3, category: '전공선택', type: 'elective', year: 2, semester: 1 },
    { id: 'CS502', name: '클라우드컴퓨팅', credits: 3, category: '전공선택', type: 'elective', year: 2, semester: 2 },
    { id: 'CS503', name: '디지털신호처리', credits: 3, category: '전공선택', type: 'elective', year: 3, semester: 1 },
    { id: 'CS504', name: '디지털영상처리', credits: 3, category: '전공선택', type: 'elective', year: 3, semester: 2 },
    { id: 'CS505', name: 'UNIX시스템프로그래밍', credits: 3, category: '전공선택', type: 'elective', year: 3, semester: 1 },
    { id: 'CS506', name: '모바일프로그래밍', credits: 3, category: '전공선택', type: 'elective', year: 3, semester: 2 },
    { id: 'CS507', name: '웹서비스프로그래밍', credits: 3, category: '전공선택', type: 'elective', year: 3, semester: 1 },
    { id: 'CS508', name: '소프트웨어공학', credits: 3, category: '전공선택', type: 'elective', year: 3, semester: 2 },
    { id: 'CS509', name: '컴퓨터응용설계', credits: 3, category: '전공선택', type: 'elective', year: 4, semester: 1 },
    { id: 'CS510', name: '네트워크프로그래밍', credits: 3, category: '전공선택', type: 'elective', year: 4, semester: 1 },
    { id: 'CS511', name: '네트워크매니지먼트', credits: 3, category: '전공선택', type: 'elective', year: 4, semester: 2 },
    { id: 'CS512', name: '인공지능', credits: 3, category: '전공선택', type: 'elective', year: 4, semester: 1 },
    { id: 'CS513', name: '오픈소스SW기초', credits: 3, category: '전공선택', type: 'elective', year: 2, semester: 1 },
    { id: 'CS514', name: '프론트엔드프로그래밍', credits: 3, category: '전공선택', type: 'elective', year: 2, semester: 2 },
    { id: 'CS515', name: '논리회로', credits: 3, category: '전공선택', type: 'elective', year: 1, semester: 2 },
    { id: 'CS516', name: '마이크로프로세서응용', credits: 3, category: '전공선택', type: 'elective', year: 3, semester: 1 },
    { id: 'CS517', name: '임베디드시스템', credits: 3, category: '전공선택', type: 'elective', year: 3, semester: 2 },
    { id: 'CS518', name: 'IoT 설계', credits: 3, category: '전공선택', type: 'elective', year: 4, semester: 1 },
    { id: 'CS519', name: 'HCI개론', credits: 3, category: '전공선택', type: 'elective', year: 4, semester: 2 }
];

// 교양필수 과목
export const generalRequiredCourses: Course[] = [
    { id: 'GE101', name: '글쓰기', credits: 3, category: '교양필수', type: 'required', year: 1, semester: 1 },
    { id: 'GE102', name: '대학영어', credits: 2, category: '교양필수', type: 'required', year: 1, semester: 1 },
    { id: 'GE103', name: '글로벌잉글리시', credits: 2, category: '교양필수', type: 'required', year: 1, semester: 2 },
    { id: 'GE104', name: '가치와비전', credits: 1, category: '교양필수', type: 'required', year: 1, semester: 1 },
    { id: 'GE105', name: '탐구와실천', credits: 1, category: '교양필수', type: 'required', year: 1, semester: 2 },
    { id: 'GE106', name: '진로와미래(취업과 창직)', credits: 1, category: '교양필수', type: 'required', year: 2, semester: 1 }
];

// 교양필수 과목 배열 export
export const generalRequired = generalRequiredCourses;

// 교양선택 과목 (핵심교양)
export const generalElectiveCourses: Course[] = [
    // 문학과 예술 영역
    { id: 'GE201', name: '문학의 이해', credits: 3, category: '교양선택', type: 'elective', year: 1, semester: 1 },
    { id: 'GE202', name: '예술의 이해', credits: 3, category: '교양선택', type: 'elective', year: 1, semester: 2 },
    // 역사와 철학 영역
    { id: 'GE203', name: '역사의 이해', credits: 3, category: '교양선택', type: 'elective', year: 1, semester: 1 },
    { id: 'GE204', name: '철학의 이해', credits: 3, category: '교양선택', type: 'elective', year: 1, semester: 2 },
    // 기업과 미디어 영역
    { id: 'GE205', name: '기업의 이해', credits: 3, category: '교양선택', type: 'elective', year: 2, semester: 1 },
    { id: 'GE206', name: '미디어의 이해', credits: 3, category: '교양선택', type: 'elective', year: 2, semester: 2 },
    // 인간과 사회 영역
    { id: 'GE207', name: '인간의 이해', credits: 3, category: '교양선택', type: 'elective', year: 2, semester: 1 },
    { id: 'GE208', name: '사회의 이해', credits: 3, category: '교양선택', type: 'elective', year: 2, semester: 2 },
    // 자연과 생명 영역
    { id: 'GE209', name: '자연의 이해', credits: 3, category: '교양선택', type: 'elective', year: 1, semester: 1 },
    { id: 'GE210', name: '생명의 이해', credits: 3, category: '교양선택', type: 'elective', year: 1, semester: 2 },
    // 일반교양
    { id: 'GE211', name: '융합사고', credits: 2, category: '교양선택', type: 'elective', year: 1, semester: 1 },
    { id: 'GE212', name: '문제해결', credits: 2, category: '교양선택', type: 'elective', year: 1, semester: 2 },
    { id: 'GE213', name: '글로벌소양', credits: 2, category: '교양선택', type: 'elective', year: 2, semester: 1 },
    { id: 'GE214', name: '대인관계', credits: 2, category: '교양선택', type: 'elective', year: 2, semester: 2 },
    { id: 'GE215', name: '자기관리', credits: 2, category: '교양선택', type: 'elective', year: 3, semester: 1 }
];

// 계열기초 과목
export const basicScienceCourses: Course[] = [
    { id: 'BS101', name: '수학 1 (미적분학 I)', credits: 3, category: '계열기초', type: 'required', year: 1, semester: 1 },
    { id: 'BS102', name: '수학 2 (미적분학 II)', credits: 3, category: '계열기초', type: 'required', year: 1, semester: 2 },
    { id: 'BS103', name: '선형대수학', credits: 3, category: '계열기초', type: 'elective', year: 2, semester: 1 },
    { id: 'BS104', name: '확률및통계학', credits: 3, category: '계열기초', type: 'elective', year: 2, semester: 2 },
    { id: 'BS105', name: '수치해석', credits: 3, category: '계열기초', type: 'elective', year: 3, semester: 1 },
    { id: 'BS106', name: '물리학', credits: 3, category: '계열기초', type: 'elective', year: 1, semester: 2 },
    { id: 'BS107', name: '물리학실험', credits: 1, category: '계열기초', type: 'elective', year: 1, semester: 2 },
    { id: 'BS108', name: '일반화학 1', credits: 3, category: '계열기초', type: 'elective', year: 1, semester: 1 },
    { id: 'BS109', name: '일반화학실험 1', credits: 1, category: '계열기초', type: 'elective', year: 1, semester: 1 },
    { id: 'BS110', name: '일반화학 2', credits: 3, category: '계열기초', type: 'elective', year: 1, semester: 2 },
    { id: 'BS111', name: '일반화학실험 2', credits: 1, category: '계열기초', type: 'elective', year: 1, semester: 2 },
    { id: 'BS112', name: '일반생물학', credits: 3, category: '계열기초', type: 'elective', year: 2, semester: 1 }
];

// 모든 과목 통합
export const allCourses = [
    ...majorRequiredCourses,
    ...majorElectiveCourses,
    ...generalRequiredCourses,
    ...generalElectiveCourses,
    ...basicScienceCourses
];

// 학년별 과목 분류
export const getCoursesByYear = (year: number) => {
    return allCourses.filter(course => course.year <= year);
};

// 카테고리별 과목 분류
export const getCoursesByCategory = (category: string) => {
    return allCourses.filter(course => course.category === category);
};

// 교시별 시간 정보
export const classSchedule = {
    1: '09:30 ~ 10:20',
    2: '10:30 ~ 11:20',
    3: '11:30 ~ 12:20',
    4: '12:30 ~ 13:20',
    5: '13:30 ~ 14:20',
    6: '14:30 ~ 15:20',
    7: '15:30 ~ 16:20',
    8: '16:30 ~ 17:20',
    9: '17:25 ~ 18:15',
    10: '18:15 ~ 19:05',
    11: '19:05 ~ 19:55',
    12: '20:00 ~ 20:50',
    13: '20:50 ~ 21:40',
    14: '21:40 ~ 22:30'
};

/**
 * 사용자의 이수과목 배열을 받아 졸업요건 충족 현황을 반환합니다.
 * 실제 로직은 필요에 따라 수정하세요.
 */
export function diagnoseGraduation(completedCourses: Course[]) {
    // 총 이수 학점 계산
    const totalCredits = completedCourses.reduce((sum, c) => sum + c.credits, 0);
    // 전공필수 이수 학점
    const majorRequired = completedCourses.filter(c => c.category === '전공필수').reduce((sum, c) => sum + c.credits, 0);
    // 전공선택 이수 학점
    const majorElective = completedCourses.filter(c => c.category === '전공선택').reduce((sum, c) => sum + c.credits, 0);
    // 교양필수 이수 학점
    const generalRequired = completedCourses.filter(c => c.category === '교양필수').reduce((sum, c) => sum + c.credits, 0);
    // 교양선택 이수 학점
    const generalElective = completedCourses.filter(c => c.category === '교양선택').reduce((sum, c) => sum + c.credits, 0);
    // 계열기초 이수 학점
    const basicScience = completedCourses.filter(c => c.category === '계열기초').reduce((sum, c) => sum + c.credits, 0);

    return {
        totalCredits,
        majorRequired,
        majorElective,
        generalRequired,
        generalElective,
        basicScience,
        // 추가로 필요한 진단 결과를 여기에 넣으세요
    };
} 