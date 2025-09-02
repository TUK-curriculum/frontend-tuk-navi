import { BaseRepository } from './BaseRepository';
import apiClient from '../config/apiClient';

export interface UserProfile {
    userId: string;
    name: string;
    email: string;
    studentId?: string;
    major?: string;
    grade?: number;
    semester?: number;
    phone?: string;
    nickname?: string;
    interests?: string[];
    avatar?: string;
}

export interface UserProfileUpdate {
    username?: string;
    phone?: string;
    major?: string;
}

export interface UserProfileResponse {
    success: boolean;
    message: string;
    data: UserProfile;
}

class UserRepository extends BaseRepository {
    private static instance: UserRepository;

    public static getInstance(): UserRepository {
        if (!UserRepository.instance) {
            UserRepository.instance = new UserRepository();
        }
        return UserRepository.instance;
    }

    /**
     * 사용자 프로필 조회
     */
    async getProfile(): Promise<UserProfile> {
        console.log('[UserRepository] Getting user profile');

        try {
            const response = await apiClient.get<UserProfileResponse>('/profile');
            console.log('[UserRepository] Profile fetched successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('[UserRepository] Failed to fetch profile:', error);
            throw error;
        }
    }

    /**
     * 사용자 프로필 수정
     */
    async updateProfile(updates: UserProfileUpdate): Promise<UserProfile> {
        console.log('[UserRepository] Updating user profile:', updates);

        try {
            const response = await apiClient.put<UserProfileResponse>('/profile', updates);
            console.log('[UserRepository] Profile updated successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('[UserRepository] Failed to update profile:', error);
            throw error;
        }
    }

    /**
     * 사용자 계정 정보 조회 (auth 엔드포인트)
     */
    async getAccount(): Promise<any> {
        console.log('[UserRepository] Getting account info');

        try {
            const response = await apiClient.get('/auth/account');
            console.log('[UserRepository] Account info fetched successfully:', response);
            return response;
        } catch (error) {
            console.error('[UserRepository] Failed to fetch account:', error);
            throw error;
        }
    }
}

export const userRepository = UserRepository.getInstance(); 