import { authRepository, LoginDTO, RegisterDTO, AuthResponse } from '../repositories/AuthRepository';
import { ApiError, ErrorCode } from '../errors/ApiError';
import { UserProfile } from '../types/user';

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'currentUser';

export class AuthService {
    private static instance: AuthService;
    private tokenRefreshPromise: Promise<void> | null = null;

    private constructor() {
        this.setupTokenRefreshInterval();
    }

    static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    /**
     * 로그인
     */
    async login(credentials: LoginDTO): Promise<AuthResponse> {
        try {
            // Validate input
            if (!credentials.email || !credentials.password) {
                throw new ApiError(
                    ErrorCode.VALIDATION_ERROR,
                    '이메일과 비밀번호를 입력해주세요.'
                );
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(credentials.email)) {
                throw new ApiError(
                    ErrorCode.VALIDATION_ERROR,
                    '올바른 이메일 형식이 아닙니다.'
                );
            }

            const response = await authRepository.login(credentials);

            // Store tokens and user info
            this.storeAuthData(response);

            return response;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(
                ErrorCode.AUTHENTICATION_ERROR,
                '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.'
            );
        }
    }

    /**
     * 회원가입
     */
    async register(data: RegisterDTO): Promise<AuthResponse> {
        try {
            // Validate required fields
            const requiredFields = ['name', 'email', 'password', 'studentId', 'major', 'grade', 'semester'];
            for (const field of requiredFields) {
                if (!data[field as keyof RegisterDTO]) {
                    throw new ApiError(
                        ErrorCode.VALIDATION_ERROR,
                        '모든 필수 항목을 입력해주세요.'
                    );
                }
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                throw new ApiError(
                    ErrorCode.VALIDATION_ERROR,
                    '올바른 이메일 형식이 아닙니다.'
                );
            }

            // Password validation
            if (data.password.length < 8) {
                throw new ApiError(
                    ErrorCode.VALIDATION_ERROR,
                    '비밀번호는 8자 이상이어야 합니다.'
                );
            }

            const response = await authRepository.register(data);

            // Store tokens and user info
            this.storeAuthData(response);

            return response;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(
                ErrorCode.SERVER_ERROR,
                '회원가입에 실패했습니다.'
            );
        }
    }

    /**
     * 로그아웃
     */
    async logout(): Promise<void> {
        try {
            await authRepository.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearAuthData();
        }
    }

    /**
     * 토큰 갱신
     */
    async refreshAccessToken(): Promise<void> {
        // Prevent multiple simultaneous refresh attempts
        if (this.tokenRefreshPromise) {
            return this.tokenRefreshPromise;
        }

        this.tokenRefreshPromise = this.performTokenRefresh();

        try {
            await this.tokenRefreshPromise;
        } finally {
            this.tokenRefreshPromise = null;
        }
    }

    private async performTokenRefresh(): Promise<void> {
        const refreshToken = this.getRefreshToken();

        if (!refreshToken) {
            throw new ApiError(
                ErrorCode.AUTHENTICATION_ERROR,
                '로그인이 필요합니다.'
            );
        }

        try {
            const response = await authRepository.refreshToken(refreshToken);

            // Update tokens
            localStorage.setItem(TOKEN_KEY, response.accessToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
        } catch (error) {
            this.clearAuthData();
            throw new ApiError(
                ErrorCode.AUTHENTICATION_ERROR,
                '세션이 만료되었습니다. 다시 로그인해주세요.'
            );
        }
    }

    /**
     * 현재 사용자 프로필 조회
     */
    async getCurrentUser(): Promise<UserProfile | null> {
        const token = this.getAccessToken();

        if (!token) {
            return null;
        }

        try {
            return await authRepository.getProfile();
        } catch (error) {
            if (error instanceof ApiError && error.code === ErrorCode.AUTHENTICATION_ERROR) {
                // Try refreshing token
                await this.refreshAccessToken();
                return await authRepository.getProfile();
            }
            throw error;
        }
    }

    /**
     * 토큰 유효성 검사
     */
    async isAuthenticated(): Promise<boolean> {
        const token = this.getAccessToken();

        if (!token) {
            return false;
        }

        return await authRepository.validateToken(token);
    }

    /**
     * Access Token 조회
     */
    getAccessToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    }

    /**
     * Refresh Token 조회
     */
    private getRefreshToken(): string | null {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    }

    /**
     * 인증 데이터 저장
     */
    private storeAuthData(response: AuthResponse): void {
        localStorage.setItem(TOKEN_KEY, response.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }

    /**
     * 인증 데이터 삭제
     */
    private clearAuthData(): void {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }

    /**
     * 토큰 자동 갱신 설정
     */
    private setupTokenRefreshInterval(): void {
        // Refresh token every 50 minutes (assuming 1 hour expiration)
        setInterval(async () => {
            if (await this.isAuthenticated()) {
                try {
                    await this.refreshAccessToken();
                } catch (error) {
                    console.error('Token refresh failed:', error);
                }
            }
        }, 50 * 60 * 1000);
    }

    /**
     * 저장된 사용자 정보 조회
     */
    getStoredUser(): UserProfile | null {
        const userStr = localStorage.getItem(USER_KEY);
        if (!userStr) {
            return null;
        }

        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }
}

// Export singleton instance
export const authService = AuthService.getInstance(); 