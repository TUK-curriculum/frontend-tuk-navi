import { Course } from '../data/graduationRequirements';

export interface OnboardingData {
    courses: Course[];
    totalCredits: number;
    interests: string[];
    setupCompleted: boolean;
    setupDate: string;
    userGrade?: number;
    userCredits?: number;
}

// 기존 전역 데이터 접근 함수들은 제거
// 이제 useData를 통해 per-user 데이터에 접근
export const loadOnboardingData = (): OnboardingData | null => {
    // useData를 통해 접근하도록 변경됨
    console.warn('loadOnboardingData는 더 이상 사용되지 않습니다. useData를 사용하세요.');
    return null;
};

export const saveOnboardingData = (onboardingData: OnboardingData): void => {
    // useData를 통해 접근하도록 변경됨
    console.warn('saveOnboardingData는 더 이상 사용되지 않습니다. useData를 사용하세요.');
};

export const updateOnboardingCourses = (courses: Course[]): void => {
    console.warn('updateOnboardingCourses는 더 이상 사용되지 않습니다. useData를 사용하세요.');
};

export const updateOnboardingInterests = (interests: string[]): void => {
    console.warn('updateOnboardingInterests는 더 이상 사용되지 않습니다. useData를 사용하세요.');
};

export const isOnboardingCompleted = (): boolean => {
    console.warn('isOnboardingCompleted는 더 이상 사용되지 않습니다. useData를 사용하세요.');
    return false;
};

export const getOnboardingGrade = (): number => {
    console.warn('getOnboardingGrade는 더 이상 사용되지 않습니다. useData를 사용하세요.');
    return 1;
};

export const getOnboardingCredits = (): number => {
    console.warn('getOnboardingCredits는 더 이상 사용되지 않습니다. useData를 사용하세요.');
    return 0;
};

export const getOnboardingCourses = (): Course[] => {
    console.warn('getOnboardingCourses는 더 이상 사용되지 않습니다. useData를 사용하세요.');
    return [];
};

export const getOnboardingInterests = (): string[] => {
    console.warn('getOnboardingInterests는 더 이상 사용되지 않습니다. useData를 사용하세요.');
    return [];
}; 