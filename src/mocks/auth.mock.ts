import { LoginDTO, RegisterDTO, AuthResponse } from '../repositories/AuthRepository';
import { UserProfile } from '../types/user';
import { getMockUserByEmail, createMockUser } from './users.mock';

// Mock tokens
const generateMockToken = (prefix: string): string => {
    const randomString = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now();
    return `${prefix}_${randomString}_${timestamp}`;
};

// Current authenticated user
let currentAuthUser: UserProfile | null = null;
let currentAccessToken: string | null = null;
let currentRefreshToken: string | null = null;

export const mockLogin = async (credentials: LoginDTO): Promise<AuthResponse> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if user exists
    const user = await getMockUserByEmail(credentials.email);

    if (!user) {
        throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // In real implementation, we would verify password
    // For mock, we'll accept any password for existing users

    currentAuthUser = user;
    currentAccessToken = generateMockToken('access');
    currentRefreshToken = generateMockToken('refresh');

    return {
        user,
        accessToken: currentAccessToken,
        refreshToken: currentRefreshToken,
    };
};

export const mockRegister = async (data: RegisterDTO): Promise<AuthResponse> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Check if email already exists
    const existingUser = await getMockUserByEmail(data.email);

    if (existingUser) {
        throw new Error('이미 존재하는 이메일입니다.');
    }

    // Create new user
    const newUser = await createMockUser({
        name: data.name,
        email: data.email,
        password: data.password, // In real implementation, this would be hashed
        studentId: data.studentId,
        major: data.major,
        grade: data.grade,
        semester: data.semester,
        phone: data.phone,
    });

    currentAuthUser = newUser;
    currentAccessToken = generateMockToken('access');
    currentRefreshToken = generateMockToken('refresh');

    return {
        user: newUser,
        accessToken: currentAccessToken,
        refreshToken: currentRefreshToken,
    };
};

export const mockLogout = async (): Promise<void> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    currentAuthUser = null;
    currentAccessToken = null;
    currentRefreshToken = null;
};

export const mockRefreshToken = async (refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
}> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));

    if (!currentRefreshToken || currentRefreshToken !== refreshToken) {
        throw new Error('Invalid refresh token');
    }

    // Generate new tokens
    currentAccessToken = generateMockToken('access');
    currentRefreshToken = generateMockToken('refresh');

    return {
        accessToken: currentAccessToken,
        refreshToken: currentRefreshToken,
    };
};

export const mockGetProfile = async (): Promise<UserProfile> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    if (!currentAuthUser || !currentAccessToken) {
        throw new Error('Unauthorized');
    }

    return currentAuthUser;
};

export const mockValidateToken = async (token: string): Promise<boolean> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    return token === currentAccessToken && currentAccessToken !== null;
};

// Helper function to set mock auth state (for testing)
export const setMockAuthState = (user: UserProfile | null): void => {
    currentAuthUser = user;
    if (user) {
        currentAccessToken = generateMockToken('access');
        currentRefreshToken = generateMockToken('refresh');
    } else {
        currentAccessToken = null;
        currentRefreshToken = null;
    }
}; 