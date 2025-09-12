import { UserProfile, UserData, UserSettings } from '../types/user';
import { UserCreateDTO, UserUpdateDTO } from '../repositories/UserRepository';
import { QueryOptions } from '../repositories/BaseRepository';

// Mock user data storage
const mockUsers: Map<string, UserData> = new Map();

// Initialize with sample data
const initializeMockUsers = () => {
    const sampleUsers: UserData[] = [
        {
            profile: {
                name: '김태경',
                email: 'taekyung@tuk.ac.kr',
                studentId: '2021000001',
                major: '컴퓨터공학과',
                grade: 3,
                semester: 2,
                phone: '010-1234-5678',
                nickname: 'TK',
                interests: ['웹개발', '인공지능', '데이터분석'],
                avatar: '/avatars/user1.png',
            },
            graduationInfo: {
                totalCredits: 84,
                majorRequired: 24,
                majorElective: 18,
                generalRequired: 24,
                generalElective: 18,
                totalRequired: 130,
                progress: 65,
                remainingCredits: 46,
            },
            curriculum: {
                type: '2021년도 교육과정',
                subjects: [],
                completedSubjects: ['CS101', 'CS102', 'MATH201'],
                currentSemester: 6,
                track: '소프트웨어공학',
            },
            schedule: {
                currentSemester: '2024-2',
                timetable: [],
                customEvents: [],
            },
            notes: [],
            messages: [],
            onboarding: {
                isCompleted: true,
                currentStep: 5,
                completedSteps: ['profile', 'interests', 'curriculum', 'schedule', 'completion'],
                setupDate: '2024-03-01',
                interests: ['웹개발', '인공지능'],
            },
            settings: {
                theme: 'light',
                notifications: true,
                autoSave: true,
                language: 'ko',
                timezone: 'Asia/Seoul',
                accessibility: {
                    highContrast: false,
                    reduceMotion: false,
                    fontSize: 'medium',
                },
            },
            completedCourses: [],
            timetableCourses: [],
            graduationRequirements: [],
            courses: [],
            favorites: [],
            recentSearches: [],
            notifications: [],
            statistics: {
                totalLoginCount: 42,
                lastLoginDate: new Date().toISOString(),
                totalStudyTime: 3600,
                completedCoursesCount: 15,
                notesCount: 8,
                messagesCount: 23,
                favoriteCoursesCount: 5,
            },
        },
        {
            profile: {
                name: '이수진',
                email: 'sujin@tuk.ac.kr',
                studentId: '2022000002',
                major: '디자인공학부',
                grade: 2,
                semester: 2,
                phone: '010-9876-5432',
                interests: ['UI/UX', '산업디자인', '그래픽디자인'],
            },
            graduationInfo: {
                totalCredits: 48,
                majorRequired: 12,
                majorElective: 9,
                generalRequired: 18,
                generalElective: 9,
                totalRequired: 130,
                progress: 37,
                remainingCredits: 82,
            },
            curriculum: {
                type: '2022년도 교육과정',
                subjects: [],
                completedSubjects: ['DES101', 'DES102', 'ART201'],
                currentSemester: 4,
            },
            schedule: {
                currentSemester: '2024-2',
                timetable: [],
                customEvents: [],
            },
            notes: [],
            messages: [],
            onboarding: {
                isCompleted: true,
                currentStep: 5,
                completedSteps: ['profile', 'interests', 'curriculum', 'schedule', 'completion'],
                interests: ['UI/UX', '산업디자인'],
            },
            settings: {
                theme: 'dark',
                notifications: true,
                autoSave: true,
                language: 'ko',
                timezone: 'Asia/Seoul',
                accessibility: {
                    highContrast: false,
                    reduceMotion: false,
                    fontSize: 'medium',
                },
            },
            completedCourses: [],
            timetableCourses: [],
            graduationRequirements: [],
            courses: [],
            favorites: [],
            recentSearches: [],
            notifications: [],
            statistics: {
                totalLoginCount: 28,
                lastLoginDate: new Date().toISOString(),
                totalStudyTime: 2400,
                completedCoursesCount: 10,
                notesCount: 5,
                messagesCount: 15,
                favoriteCoursesCount: 3,
            },
        },
    ];

    sampleUsers.forEach(user => {
        mockUsers.set(user.profile.studentId, user);
    });
};

// Initialize mock data
initializeMockUsers();

// Mock functions
export const getMockUsers = async (options: QueryOptions = {}): Promise<UserProfile[]> => {
    const users = Array.from(mockUsers.values()).map(userData => userData.profile);

    // Apply filters
    if (options?.filter) {
        const { query, major, grade } = options.filter;

        return users.filter(user => {
            if (query) {
                const searchQuery = query.toLowerCase();
                const matchesQuery =
                    user.name.toLowerCase().includes(searchQuery) ||
                    user.email.toLowerCase().includes(searchQuery) ||
                    user.studentId.includes(searchQuery) ||
                    user.nickname?.toLowerCase().includes(searchQuery);
                if (!matchesQuery) return false;
            }

            if (major && user.major !== major) return false;
            if (grade && user.grade !== grade) return false;

            return true;
        });
    }

    // Apply pagination
    if (options?.page && options?.limit) {
        const start = (options.page - 1) * options.limit;
        const end = start + options.limit;
        return users.slice(start, end);
    }

    return users;
};

export const getMockUserById = async (id: number): Promise<UserProfile | null> => {
    const userData = mockUsers.get(id);
    return userData ? userData.profile : null;
};

export const getMockUserByEmail = async (email: string): Promise<UserProfile | null> => {
    const userData = Array.from(mockUsers.values()).find(
        userData => userData.profile.email === email
    );
    return userData ? userData.profile : null;
};

export const createMockUser = async (data: UserCreateDTO): Promise<UserProfile> => {
    const newUserData: UserData = {
        profile: {
            ...data,
            nickname: data.name,
            interests: [],
        },
        graduationInfo: {
            totalCredits: 0,
            majorRequired: 0,
            majorElective: 0,
            generalRequired: 0,
            generalElective: 0,
            totalRequired: 130,
            progress: 0,
            remainingCredits: 130,
        },
        curriculum: {
            type: '2024년도 교육과정',
            subjects: [],
            completedSubjects: [],
            currentSemester: (data.grade - 1) * 2 + data.semester,
        },
        schedule: {
            currentSemester: '2024-2',
            timetable: [],
            customEvents: [],
        },
        notes: [],
        messages: [],
        onboarding: {
            isCompleted: false,
            currentStep: 1,
            completedSteps: [],
            interests: [],
        },
        settings: {
            theme: 'light',
            notifications: true,
            autoSave: true,
            language: 'ko',
            timezone: 'Asia/Seoul',
            accessibility: {
                highContrast: false,
                reduceMotion: false,
                fontSize: 'medium',
            },
        },
        completedCourses: [],
        timetableCourses: [],
        graduationRequirements: [],
        courses: [],
        favorites: [],
        recentSearches: [],
        notifications: [],
        statistics: {
            totalLoginCount: 0,
            lastLoginDate: new Date().toISOString(),
            totalStudyTime: 0,
            completedCoursesCount: 0,
            notesCount: 0,
            messagesCount: 0,
            favoriteCoursesCount: 0,
        },
    };

    mockUsers.set(data.studentId, newUserData);
    return newUserData.profile;
};

export const updateMockUser = async (id: number, data: UserUpdateDTO): Promise<UserProfile> => {
    const userData = mockUsers.get(id);
    if (!userData) {
        throw new Error('User not found');
    }

    userData.profile = {
        ...userData.profile,
        ...data,
    };

    mockUsers.set(id, userData);
    return userData.profile;
};

export const deleteMockUser = async (id: number): Promise<boolean> => {
    return mockUsers.delete(id);
};

export const getMockUserData = async (id: number): Promise<UserData | null> => {
    return mockUsers.get(id) || null;
};

export const updateMockUserSettings = async (
    id: number,
    settings: Partial<UserSettings>
): Promise<boolean> => {
    const userData = mockUsers.get(id);
    if (!userData) {
        return false;
    }

    userData.settings = {
        ...userData.settings,
        ...settings,
    };

    mockUsers.set(id, userData);
    return true;
}; 