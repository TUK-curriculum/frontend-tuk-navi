export enum ErrorCode {
    NETWORK_ERROR = 'NETWORK_ERROR',
    AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    NOT_FOUND = 'NOT_FOUND',
    SERVER_ERROR = 'SERVER_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class ApiError extends Error {
    constructor(
        public code: ErrorCode,
        public message: string,
        public statusCode?: number,
        public details?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
        Object.setPrototypeOf(this, ApiError.prototype);
    }

    static fromResponse(response: Response, data?: any): ApiError {
        const statusCode = response.status;
        const message = data?.message || response.statusText;

        switch (statusCode) {
            case 401:
                return new ApiError(ErrorCode.AUTHENTICATION_ERROR, message, statusCode, data);
            case 403:
                return new ApiError(ErrorCode.AUTHORIZATION_ERROR, message, statusCode, data);
            case 404:
                return new ApiError(ErrorCode.NOT_FOUND, message, statusCode, data);
            case 422:
            case 400:
                return new ApiError(ErrorCode.VALIDATION_ERROR, message, statusCode, data);
            case 500:
            case 502:
            case 503:
                return new ApiError(ErrorCode.SERVER_ERROR, message, statusCode, data);
            default:
                return new ApiError(ErrorCode.UNKNOWN_ERROR, message, statusCode, data);
        }
    }

    static networkError(message: string = '네트워크 연결에 실패했습니다.'): ApiError {
        return new ApiError(ErrorCode.NETWORK_ERROR, message);
    }
} 