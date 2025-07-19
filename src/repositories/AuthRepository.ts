import apiClient from '../config/apiClient';
import { apiEndpoints } from '../config/environment';
import { UserProfile } from '../types/user';

export interface LoginDTO {
    email: string;
    password: string;
}

export interface RegisterDTO {
    name: string;
    email: string;
    password: string;
    studentId: string;
    major: string;
    grade: number;
    semester: number;
    phone?: string;
    interests?: string[];
}

export interface AuthResponse {
    user: UserProfile;
    accessToken: string;
    refreshToken: string;
}

export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
}

export class AuthRepository {
    private static instance: AuthRepository;

    private constructor() { }

    static getInstance(): AuthRepository {
        if (!AuthRepository.instance) {
            AuthRepository.instance = new AuthRepository();
        }
        return AuthRepository.instance;
    }

    async login(credentials: LoginDTO): Promise<AuthResponse> {
        try {
            const response = await apiClient.post<AuthResponse>(apiEndpoints.auth.login, credentials);
            return response.data;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    async register(data: RegisterDTO): Promise<AuthResponse> {
        try {
            const signupPayload = {
                username: data.name,
                email: data.email,
                password: data.password,
                major: data.major,
                studentId: data.studentId,
                grade: data.grade,
                semester: data.semester,
                phone: data.phone,
                interests: data.interests || [],
            };

            await apiClient.post(apiEndpoints.auth.register, signupPayload);

            const loginResponse = await apiClient.post<AuthResponse>(apiEndpoints.auth.login, {
                email: data.email,
                password: data.password,
            });
            return loginResponse.data;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }

    async logout(): Promise<void> {
        await apiClient.post(apiEndpoints.auth.logout);
    }

    async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
        const response = await apiClient.post<RefreshTokenResponse>(apiEndpoints.auth.refresh, {
            refreshToken,
        });
        return response.data;
    }

    async getProfile(): Promise<UserProfile> {
        const response = await apiClient.get<UserProfile>(apiEndpoints.auth.profile);
        return response.data;
    }

    async validateToken(token: string): Promise<boolean> {
        try {
            await apiClient.get(apiEndpoints.auth.profile, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return true;
        } catch {
            return false;
        }
    }
}

// Export singleton instance
export const authRepository = AuthRepository.getInstance(); 