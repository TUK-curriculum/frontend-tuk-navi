import { UserProfile, UserData, UserSettings } from '../types/user';
import { userRepository, UserCreateDTO, UserUpdateDTO } from '../repositories/UserRepository';
import { ApiError, ErrorCode } from '../errors/ApiError';

export interface UserSearchParams {
    query?: string;
    major?: string;
    grade?: number;
    page?: number;
    limit?: number;
}

export class UserService {
    private static instance: UserService;

    private constructor() { }

    static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }

    /**
     * 모든 사용자 조회
     */
    async getAllUsers(params?: UserSearchParams): Promise<UserProfile[]> {
        try {
            return await userRepository.findAll({
                page: params?.page,
                limit: params?.limit,
                filter: {
                    query: params?.query,
                    major: params?.major,
                    grade: params?.grade,
                },
            });
        } catch (error) {
            console.error('Failed to get all users:', error);
            throw new ApiError(
                ErrorCode.SERVER_ERROR,
                '사용자 목록을 불러오는데 실패했습니다.'
            );
        }
    }

    /**
     * 사용자 ID로 조회
     */
    async getUserById(id: string): Promise<UserProfile> {
        const user = await userRepository.findById(id);
        if (!user) {
            throw new ApiError(
                ErrorCode.NOT_FOUND,
                '사용자를 찾을 수 없습니다.'
            );
        }
        return user;
    }

    /**
     * 이메일로 사용자 조회
     */
    async getUserByEmail(email: string): Promise<UserProfile | null> {
        try {
            return await userRepository.findByEmail(email);
        } catch (error) {
            console.error('Failed to get user by email:', error);
            return null;
        }
    }

    /**
     * 새 사용자 생성
     */
    async createUser(data: UserCreateDTO): Promise<UserProfile> {
        // Validate email uniqueness
        const existingUser = await this.getUserByEmail(data.email);
        if (existingUser) {
            throw new ApiError(
                ErrorCode.VALIDATION_ERROR,
                '이미 존재하는 이메일입니다.'
            );
        }

        // Validate required fields
        if (!data.name || !data.email || !data.password || !data.studentId) {
            throw new ApiError(
                ErrorCode.VALIDATION_ERROR,
                '필수 입력 항목을 확인해주세요.'
            );
        }

        try {
            return await userRepository.create(data);
        } catch (error) {
            console.error('Failed to create user:', error);
            throw new ApiError(
                ErrorCode.SERVER_ERROR,
                '사용자 생성에 실패했습니다.'
            );
        }
    }

    /**
     * 사용자 정보 업데이트
     */
    async updateUser(id: string, data: UserUpdateDTO): Promise<UserProfile> {
        // Check if user exists
        await this.getUserById(id);

        // If email is being updated, check uniqueness
        if (data.email) {
            const existingUser = await this.getUserByEmail(data.email);
            if (existingUser && existingUser.studentId !== id) {
                throw new ApiError(
                    ErrorCode.VALIDATION_ERROR,
                    '이미 존재하는 이메일입니다.'
                );
            }
        }

        try {
            return await userRepository.update(id, data);
        } catch (error) {
            console.error('Failed to update user:', error);
            throw new ApiError(
                ErrorCode.SERVER_ERROR,
                '사용자 정보 업데이트에 실패했습니다.'
            );
        }
    }

    /**
     * 사용자 삭제
     */
    async deleteUser(id: string): Promise<void> {
        // Check if user exists
        await this.getUserById(id);

        try {
            await userRepository.delete(id);
        } catch (error) {
            console.error('Failed to delete user:', error);
            throw new ApiError(
                ErrorCode.SERVER_ERROR,
                '사용자 삭제에 실패했습니다.'
            );
        }
    }

    /**
     * 사용자 전체 데이터 조회
     */
    async getUserData(id: string): Promise<UserData> {
        const userData = await userRepository.getUserData(id);
        if (!userData) {
            throw new ApiError(
                ErrorCode.NOT_FOUND,
                '사용자 데이터를 찾을 수 없습니다.'
            );
        }
        return userData;
    }

    /**
     * 사용자 설정 업데이트
     */
    async updateUserSettings(
        id: string,
        settings: Partial<UserSettings>
    ): Promise<void> {
        // Check if user exists
        await this.getUserById(id);

        try {
            await userRepository.updateSettings(id, settings);
        } catch (error) {
            console.error('Failed to update user settings:', error);
            throw new ApiError(
                ErrorCode.SERVER_ERROR,
                '사용자 설정 업데이트에 실패했습니다.'
            );
        }
    }

    /**
     * 사용자 검색
     */
    async searchUsers(query: string): Promise<UserProfile[]> {
        if (!query || query.trim().length < 2) {
            return [];
        }

        try {
            return await this.getAllUsers({ query });
        } catch (error) {
            console.error('Failed to search users:', error);
            return [];
        }
    }

    /**
     * 전공별 사용자 조회
     */
    async getUsersByMajor(major: string): Promise<UserProfile[]> {
        try {
            return await this.getAllUsers({ major });
        } catch (error) {
            console.error('Failed to get users by major:', error);
            return [];
        }
    }

    /**
     * 학년별 사용자 조회
     */
    async getUsersByGrade(grade: number): Promise<UserProfile[]> {
        if (grade < 1 || grade > 6) {
            throw new ApiError(
                ErrorCode.VALIDATION_ERROR,
                '올바른 학년을 입력해주세요. (1-6)'
            );
        }

        try {
            return await this.getAllUsers({ grade });
        } catch (error) {
            console.error('Failed to get users by grade:', error);
            return [];
        }
    }
}

// Export singleton instance
export const userService = UserService.getInstance(); 