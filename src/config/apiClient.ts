// config/apiClient.ts
import axios, { AxiosResponse } from 'axios';

// API 기본 설정
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Axios 인스턴스 생성
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터: 모든 요청에 토큰 추가
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터: 토큰 만료 처리
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // 401 Unauthorized 처리
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const refreshResponse = await axios.post<{ accessToken: string; refreshToken: string }>(
                        `${API_BASE_URL}/auth/refresh`,
                        { refreshToken }
                    );

                    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;

                    localStorage.setItem('accessToken', newAccessToken);
                    if (newRefreshToken) {
                        localStorage.setItem('refreshToken', newRefreshToken);
                    }

                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('currentUser'); // 'userEmail' 대신 'currentUser' 사용

                if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                    window.location.href = '/login';
                }
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient; 