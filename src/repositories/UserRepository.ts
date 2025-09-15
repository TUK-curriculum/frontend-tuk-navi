import { BaseRepository, PaginatedResponse, QueryOptions } from './BaseRepository';
import apiClient from '../config/apiClient';
import { UserData, UserProfile, UserSettings } from '../types/user';

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

export interface UserUpdateDTO {
    name?: string;
    email?: string;
    password?: string;
    studentId?: number;
    major?: string;
    grade?: number;
    semester?: number;
    phone?: string;
    nickname?: string;
    interests?: string[];
    avatar?: string;
}

export interface UserCreateDTO {
    name: string;
    email: string;
    password: string;
    studentId: number;
    major?: string;
    grade?: number;
    semester?: number;
    phone?: string;
    nickname?: string;
    interests?: string[];
    avatar?: string;
}


class UserRepository extends BaseRepository<UserProfile> {
    protected endpoint = '/users';

    private static instance: UserRepository;

    public static getInstance(): UserRepository {
        if (!UserRepository.instance) {
            UserRepository.instance = new UserRepository();
        }
        return UserRepository.instance;
    }

    async findAll(options?: QueryOptions): Promise<UserProfile[]> {
        const queryString = this.buildQueryString(options);
        const response = await apiClient.get<PaginatedResponse<UserProfile>>(`${this.endpoint}${queryString}`);
        return response.data.data;
    }

    async findById(id: number): Promise<UserProfile | null> {
        try {
        const response = await apiClient.get<UserProfileResponse>(`${this.endpoint}/${id}`);
        return response.data.data;
        } catch {
        return null;
        }
    }

    async create(data: Partial<UserProfile>): Promise<UserProfile> {
        const response = await apiClient.post<UserProfileResponse>(this.endpoint, data);
        return response.data.data;
    }

    async update(id: number, data: Partial<UserProfile>): Promise<UserProfile> {
        const response = await apiClient.put<UserProfileResponse>(`${this.endpoint}/${id}`, data);
        return response.data.data;
    }

    async delete(id: number): Promise<boolean> {
        await apiClient.delete(`${this.endpoint}/${id}`);
        return true;
    }

    async getProfile(): Promise<UserProfile> {
        const response = await apiClient.get<UserProfileResponse>('/profile');
        return response.data.data;
    }

    async updateProfile(updates: UserProfileUpdate): Promise<UserProfile> {
        const response = await apiClient.put<UserProfileResponse>('/profile', updates);
        return response.data.data;
    }

    async getAccount(): Promise<any> {
        const response = await apiClient.get('/auth/account');
        return response.data;
    }

    async findByEmail(email: string): Promise<UserProfile | null> {
        const queryString = this.buildQueryString({ filter: { email } });
        const response = await apiClient.get<PaginatedResponse<UserProfile>>(`${this.endpoint}${queryString}`);
        return response.data.data[0] ?? null;
    }

    async getUserData(id: number): Promise<UserData> {
        const response = await apiClient.get<UserData>(`${this.endpoint}/${id}/data`);
        return response.data;
    }

    async updateSettings(id: number, settings: Partial<UserSettings>): Promise<void> {
        await apiClient.put(`${this.endpoint}/${id}/settings`, settings);
    }
}

export const userRepository = UserRepository.getInstance(); 