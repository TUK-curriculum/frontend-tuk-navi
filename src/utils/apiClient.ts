// API 클라이언트 설정
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// JWT 토큰 관리 - useData를 통해 접근
const getAuthToken = (): string | null => {
    // Access token stored by AuthContext / AuthRepository
    return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
};

const setAuthToken = (token: string): void => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', token);
    }
};

const removeAuthToken = (): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
    }
};

// API 요청 헤더 생성
const createHeaders = (includeAuth: boolean = true): HeadersInit => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (includeAuth) {
        const token = getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return headers;
};

// API 응답 처리
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        if (response.status === 401) {
            // 인증 실패 시 토큰 제거
            removeAuthToken();
            throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API 요청 실패: ${response.status}`);
    }

    return response.json();
};

// API 클라이언트
export const apiClient = {
    // 인증 관련 API
    auth: {
        // 로그인
        login: async (email: string, password: string) => {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: createHeaders(false),
                body: JSON.stringify({ email, password }),
            });

            const data = await handleResponse(response);
            setAuthToken(data.accessToken);
            return data;
        },

        // 회원가입
        signup: async (email: string, password: string, username: string, major?: string, phone?: string) => {
            const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: createHeaders(false),
                body: JSON.stringify({ email, password, username, major, phone }),
            });

            return handleResponse(response);
        },

        // 로그아웃
        logout: async () => {
            try {
                await fetch(`${API_BASE_URL}/auth/session`, {
                    method: 'DELETE',
                    headers: createHeaders(),
                });
            } catch (error) {
                console.error('로그아웃 API 호출 실패:', error);
            } finally {
                removeAuthToken();
            }
        },

        // 사용자 정보 조회
        getAccount: async () => {
            const response = await fetch(`${API_BASE_URL}/auth/account`, {
                method: 'GET',
                headers: createHeaders(),
            });

            return handleResponse(response);
        },
    },

    // 커리큘럼 관련 API
    curriculums: {
        // 커리큘럼 목록 조회
        getAll: async () => {
            const response = await fetch(`${API_BASE_URL}/curriculums`, {
                method: 'GET',
                headers: createHeaders(),
            });

            return handleResponse(response);
        },

        // 특정 커리큘럼 조회
        getById: async (curriculumId: string) => {
            const response = await fetch(`${API_BASE_URL}/curriculums/${curriculumId}`, {
                method: 'GET',
                headers: createHeaders(),
            });

            return handleResponse(response);
        },

        // 커리큘럼 생성
        create: async (name: string, isDefault: boolean = false) => {
            const response = await fetch(`${API_BASE_URL}/curriculums`, {
                method: 'POST',
                headers: createHeaders(),
                body: JSON.stringify({ name, isDefault }),
            });

            return handleResponse(response);
        },

        // 커리큘럼 삭제
        delete: async (curriculumId: string) => {
            const response = await fetch(`${API_BASE_URL}/curriculums/${curriculumId}`, {
                method: 'DELETE',
                headers: createHeaders(),
            });

            return handleResponse(response);
        },

        // 기본 커리큘럼 조회
        getDefault: async () => {
            const response = await fetch(`${API_BASE_URL}/curriculums/default`, {
                method: 'GET',
                headers: createHeaders(),
            });

            return handleResponse(response);
        },

        // 기본 커리큘럼 설정
        setDefault: async (name: string) => {
            const response = await fetch(`${API_BASE_URL}/curriculums/default`, {
                method: 'POST',
                headers: createHeaders(),
                body: JSON.stringify({ name }),
            });

            return handleResponse(response);
        },
    },

    // 강의 관련 API
    lectures: {
        // 강의 추가
        addToCurriculum: async (curriculumId: string, lectureData: Record<string, unknown>) => {
            const response = await fetch(`${API_BASE_URL}/curriculums/${curriculumId}/lectures`, {
                method: 'POST',
                headers: createHeaders(),
                body: JSON.stringify(lectureData),
            });

            return handleResponse(response);
        },

        // 강의 수정
        update: async (curriculumId: string, lectureId: string, lectureData: Record<string, unknown>) => {
            const response = await fetch(`${API_BASE_URL}/curriculums/${curriculumId}/lectures/${lectureId}`, {
                method: 'PUT',
                headers: createHeaders(),
                body: JSON.stringify(lectureData),
            });

            return handleResponse(response);
        },

        // 강의 삭제
        delete: async (curriculumId: string, lectureId: string) => {
            const response = await fetch(`${API_BASE_URL}/curriculums/${curriculumId}/lectures/${lectureId}`, {
                method: 'DELETE',
                headers: createHeaders(),
            });

            return handleResponse(response);
        },
    },

    // 시간표 관련 API
    timetable: {
        // 현재 학기 시간표 조회
        getCurrent: async () => {
            const response = await fetch(`${API_BASE_URL}/users/timetable/current`, {
                method: 'GET',
                headers: createHeaders(),
            });

            return handleResponse(response);
        },
    },

    // 졸업 관련 API
    graduation: {
        // 이수 학점 조회
        getCredits: async () => {
            const response = await fetch(`${API_BASE_URL}/users/records/credits`, {
                method: 'GET',
                headers: createHeaders(),
            });

            return handleResponse(response);
        },

        // 졸업 요건 통과 여부 조회
        getPassStatus: async () => {
            const response = await fetch(`${API_BASE_URL}/graduation/pass`, {
                method: 'GET',
                headers: createHeaders(),
            });

            return handleResponse(response);
        },

        // 미이수 필수 과목 조회
        getRequiredMissing: async () => {
            const response = await fetch(`${API_BASE_URL}/graduation/required-missing`, {
                method: 'GET',
                headers: createHeaders(),
            });

            return handleResponse(response);
        },
    },

    // 챗봇 관련 API
    chatbot: {
        // 메시지 전송
        sendMessage: async (message: string) => {
            const response = await fetch(`${API_BASE_URL}/chat/messages`, {
                method: 'POST',
                headers: createHeaders(),
                body: JSON.stringify({ message }),
            });

            return handleResponse(response);
        },

        // 사용자 상태 조회
        getUserStatus: async () => {
            const response = await fetch(`${API_BASE_URL}/users/status`, {
                method: 'GET',
                headers: createHeaders(),
            });

            return handleResponse(response);
        },

        // 관심 분야 조회
        getPreferences: async () => {
            const response = await fetch(`${API_BASE_URL}/users/preference`, {
                method: 'GET',
                headers: createHeaders(),
            });

            return handleResponse(response);
        },

        // 관심 분야 설정
        setPreferences: async (preferences: Record<string, unknown>) => {
            const response = await fetch(`${API_BASE_URL}/users/preference`, {
                method: 'POST',
                headers: createHeaders(),
                body: JSON.stringify(preferences),
            });

            return handleResponse(response);
        },
    },
};

// 토큰 갱신 함수
export const refreshToken = async (): Promise<boolean> => {
    try {
        if (typeof window === 'undefined') return false;
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            return false;
        }

        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (response.ok) {
            const data = await response.json();
            if (data?.accessToken) {
                setAuthToken(data.accessToken);
            }
            if (data?.refreshToken) {
                localStorage.setItem('refreshToken', data.refreshToken);
            }
            return true;
        }
        return false;
    } catch (error) {
        console.error('토큰 갱신 실패:', error);
        return false;
    }
};

// 인터셉터: 401 에러 시 토큰 갱신 시도
export const setupApiInterceptors = () => {
    // fetch를 오버라이드하여 인터셉터 기능 추가
    const originalFetch = window.fetch;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const response = await originalFetch(input, init);

        if (response.status === 401) {
            const refreshed = await refreshToken();
            if (refreshed) {
                // 토큰 갱신 성공 시 원래 요청 재시도
                const newInit = { ...init };
                if (newInit.headers) {
                    const token = getAuthToken();
                    if (token) {
                        (newInit.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
                    }
                }
                return originalFetch(input, newInit);
            }
        }

        return response;
    };
}; 