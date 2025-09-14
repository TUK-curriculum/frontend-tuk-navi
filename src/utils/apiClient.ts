// API 클라이언트 설정
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// JWT 토큰 관리
const getAuthToken = (): string | null => {
    return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
};

const setAuthToken = (token: string): void => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', token);
    }
};

const setRefreshToken = (token: string): void => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', token);
    }
};

const removeAuthToken = (): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
    }
};

// 사용자 정보 저장/제거
const setUserInfo = (user: any): void => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('userInfo', JSON.stringify(user));
    }
};

const removeUserInfo = (): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('userInfo');
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
            removeAuthToken();
            throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API 요청 실패: ${response.status}`);
    }

    return response.json();
};

const handleGoogleLogin = async (): Promise<any> => {
    window.location.href = `${API_BASE_URL}/auth/google`;
    return Promise.resolve();
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

        // 구글 소셜 로그인
        googleLogin: async () => {
            try {
                return await handleGoogleLogin();
            } catch (error) {
                console.error('Google login error:', error);
                throw error;
            }
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

        // 토큰 갱신
        refreshToken: async () => {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                throw new Error('Refresh token not found');
            }

            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: createHeaders(false),
                body: JSON.stringify({ refreshToken }),
            });

            const data = await handleResponse(response);
            setAuthToken(data.accessToken);
            setRefreshToken(data.refreshToken);
            
            return data;
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

    // 프로필 관련 API
    profile: {
        // 프로필 정보 조회
        getProfile: async () => {
            const response = await fetch(`${API_BASE_URL}/profile`, {
                method: 'GET',
                headers: createHeaders(),
            });

            return handleResponse(response);
        },

        // 프로필 수정
        updateProfile: async (updates: { username?: string; phone?: string; major?: string }) => {
            const response = await fetch(`${API_BASE_URL}/profile`, {
                method: 'PUT',
                headers: createHeaders(),
                body: JSON.stringify(updates),
            });

            return handleResponse(response);
        },

        // 학점 요약 정보 조회
        getSummary: async () => {
            const response = await fetch(`${API_BASE_URL}/profile/summary`, {
                method: 'GET',
                headers: createHeaders(),
            });

            return handleResponse(response);
        },

        // 온보딩 완료 처리
        completeOnboarding: async (onboardingData: Record<string, unknown>) => {
            const response = await fetch(`${API_BASE_URL}/profile/complete-onboarding`, {
                method: 'POST',
                headers: createHeaders(),
                body: JSON.stringify(onboardingData),
            });

            return handleResponse(response);
        },
    },

    // 학적/학점 관련 API
    records: {
        // 모든 학적 기록 조회
        getAll: async () => {
            const response = await fetch(`${API_BASE_URL}/records`, {
                method: 'GET',
                headers: createHeaders(),
            });

            return handleResponse(response);
        },

        // 이수 학점 조회
        getCredits: async () => {
            const response = await fetch(`${API_BASE_URL}/users/records/credits`, {
                method: 'GET',
                headers: createHeaders(),
            });

            return handleResponse(response);
        },

        // 학적 기록 추가
        add: async (recordData: Record<string, unknown>) => {
            const response = await fetch(`${API_BASE_URL}/records`, {
                method: 'POST',
                headers: createHeaders(),
                body: JSON.stringify(recordData),
            });

            return handleResponse(response);
        },

        // 학적 기록 수정
        update: async (recordId: number, updates: Record<string, unknown>) => {
            const response = await fetch(`${API_BASE_URL}/records/${recordId}`, {
                method: 'PUT',
                headers: createHeaders(),
                body: JSON.stringify(updates),
            });

            return handleResponse(response);
        },

        // 학적 기록 삭제
        delete: async (recordId: number) => {
            const response = await fetch(`${API_BASE_URL}/records/${recordId}`, {
                method: 'DELETE',
                headers: createHeaders(),
            });

            return handleResponse(response);
        },
    },

    // 졸업 관련 API
    graduation: {
        // 졸업사정기준 취득현황 조회
        getStatus: async () => {
            const response = await fetch(`${API_BASE_URL}/graduation/status`, {
                method: 'GET',
                headers: createHeaders(),
            });

            return handleResponse(response);
        },

        // 필수과목 이수 내역 조회
        getRequired: async () => {
            const response = await fetch(`${API_BASE_URL}/graduation/required`, {
                method: 'GET',
                headers: createHeaders(),
            });

            return handleResponse(response);
        },

        // 졸업결격 사유 조회
        getDisqualification: async () => {
            const response = await fetch(`${API_BASE_URL}/graduation/disqualifications`, {
                method: 'GET',
                headers: createHeaders(),
            });

            return handleResponse(response);
        },

        // 항목별 통과 여부 조회
        getPassStatus: async () => {
            const response = await fetch(`${API_BASE_URL}/graduation/pass`, {
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
        getById: async (curriculumId: number) => {
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
        delete: async (curriculumId: number) => {
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
        addToCurriculum: async (curriculumId: number, lectureData: Record<string, unknown>) => {
            const response = await fetch(`${API_BASE_URL}/curriculums/${curriculumId}/lectures`, {
                method: 'POST',
                headers: createHeaders(),
                body: JSON.stringify(lectureData),
            });

            return handleResponse(response);
        },

        // 강의 수정
        update: async (curriculumId: number, lectureId: number, lectureData: Record<string, unknown>) => {
            const response = await fetch(`${API_BASE_URL}/curriculums/${curriculumId}/lectures/${lectureId}`, {
                method: 'PUT',
                headers: createHeaders(),
                body: JSON.stringify(lectureData),
            });

            return handleResponse(response);
        },

        // 강의 삭제
        delete: async (curriculumId: number, lectureId: number) => {
            const response = await fetch(`${API_BASE_URL}/curriculums/${curriculumId}/lectures/${lectureId}`, {
                method: 'DELETE',
                headers: createHeaders(),
            });

            return handleResponse(response);
        },

        // 강의 상세 정보 조회
        getDetails: async (lectureId: number) => {
            const response = await fetch(`${API_BASE_URL}/lectures/details?lect_id=${lectureId}`, {
                method: 'GET',
                headers: createHeaders(),
            });

            return handleResponse(response);
        },

        // 선후수 과목 조회
        getPreRequisite: async (lectureId: number) => {
            const response = await fetch(`${API_BASE_URL}/lectures/pre-requisite?lect_id=${lectureId}`, {
                method: 'GET',
                headers: createHeaders(),
            });

            return handleResponse(response);
        },
    },

    // 강의 정보 관련 API
    courses: {
        // 최근 강의 목록 조회
        getRecent: async (year: number, semester: number, major: string) => {
            const response = await fetch(
                `${API_BASE_URL}/courses?year=${year}&semester=${semester}&major=${major}`,
                {
                    method: 'GET',
                    headers: createHeaders(),
                }
            );

            return handleResponse(response);
        },

        // 특정 강의 기본 정보 조회
        getRecentByCode: async (code: string) => {
            const response = await fetch(`${API_BASE_URL}/courses/${code}`, {
                method: 'GET',
                headers: createHeaders(),
            });

            return handleResponse(response);
        },

        // 특정 강의 S3 강의계획서 조회
        getSyllabi: async (code: string, semester: string) => {
            const response = await fetch(
                `${API_BASE_URL}/courses/${code}/syllabi?semester=${semester}`,
                {
                    method: 'GET',
                    headers: createHeaders(),
                }
            );

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

        // 관심 분야 삭제
        deletePreferences: async () => {
            const response = await fetch(`${API_BASE_URL}/users/preference`, {
                method: 'DELETE',
                headers: createHeaders(),
            });

            return handleResponse(response);
        },

        // 대화 로그 조회
        getChatLogs: async (userId: number) => {
            const response = await fetch(`${API_BASE_URL}/chat/chatting-logs/${userId}`, {
                method: 'GET',
                headers: createHeaders(),
            });

            return handleResponse(response);
        },
    },

    // 강의평 관련 API
    reviews: {
        // 강의 코드로 리뷰 조회
        getByCourse: async (courseCode: string) => {
            const response = await fetch(`${API_BASE_URL}/reviews/${courseCode}`, {
                method: 'GET',
                headers: createHeaders(),
            });
            return handleResponse(response);
        },

        // 강의 코드로 리뷰 작성
        create: async (courseCode: string, formData: FormData) => {
            const response = await fetch(`${API_BASE_URL}/reviews/${courseCode}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                },
                body: formData,
            });
            return handleResponse(response);
        },

        // 리뷰 ID로 수정
        update: async (reviewId: number, data: { content?: string; rating?: number }) => {
            const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
                method: 'PUT',
                headers: createHeaders(),
                body: JSON.stringify(data),
            });
            return handleResponse(response);
        },

        // 리뷰 ID로 삭제
        delete: async (reviewId: number) => {
            const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: createHeaders(),
            });
            return handleResponse(response);
        },
    },

    // 자료실 관련 API
    resources: {
        getByCourse: async (courseId: string) => {
        const response = await fetch(`${API_BASE_URL}/resources/${courseId}`, {
            method: 'GET',
            headers: createHeaders(),
        });
        return handleResponse(response);
        },

        create: async (courseId: string, formData: FormData) => {
        const response = await fetch(`${API_BASE_URL}/resources/${courseId}`, {
            method: 'POST',
            headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            },
            body: formData,
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

// 인증 상태 확인 유틸리티
export const isAuthenticated = (): boolean => {
    return !!getAuthToken();
};

// 사용자 정보 가져오기 유틸리티
export const getUserInfo = (): any | null => {
    if (typeof window !== 'undefined') {
        const userInfo = localStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo) : null;
    }
    return null;
};

// 인터셉터: 401 에러 시 토큰 갱신 시도
export const setupApiInterceptors = () => {
    const originalFetch = window.fetch;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const response = await originalFetch(input, init);

        if (response.status === 401) {
            const refreshed = await refreshToken();
            if (refreshed) {
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