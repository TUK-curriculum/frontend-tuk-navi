import { environment } from '../config/environment';

interface MockResponse<T = any> {
    data: T;
    status: number;
    headers?: Record<string, string>;
    delay?: number;
}

type MockHandler = (
    request: Request,
    params?: Record<string, string>
) => MockResponse | Promise<MockResponse>;

export class MockDataManager {
    private static instance: MockDataManager;
    private routes: Map<string, Map<string, MockHandler>> = new Map();
    private defaultDelay: number = 300;

    private constructor() {
        this.setupRoutes();
    }

    static getInstance(): MockDataManager {
        if (!MockDataManager.instance) {
            MockDataManager.instance = new MockDataManager();
        }
        return MockDataManager.instance;
    }

    private setupRoutes(): void {
        // Routes will be registered by individual mock modules
    }

    register(method: string, pattern: string, handler: MockHandler): void {
        if (!this.routes.has(method)) {
            this.routes.set(method, new Map());
        }
        this.routes.get(method)?.set(pattern, handler);
    }

    async handleRequest(request: Request): Promise<Response | null> {
        if (!environment.mockMode) {
            return null;
        }

        const url = new URL(request.url);
        const method = request.method.toUpperCase();
        const pathname = url.pathname.replace(environment.apiUrl, '');

        // Find matching route
        const methodRoutes = this.routes.get(method);
        if (!methodRoutes) {
            return null;
        }

        for (const [pattern, handler] of methodRoutes) {
            const params = this.matchPath(pathname, pattern);
            if (params) {
                try {
                    const mockResponse = await handler(request, params);

                    // Simulate network delay
                    if (mockResponse.delay || this.defaultDelay) {
                        await new Promise(resolve =>
                            setTimeout(resolve, mockResponse.delay || this.defaultDelay)
                        );
                    }

                    return new Response(
                        JSON.stringify(mockResponse.data),
                        {
                            status: mockResponse.status || 200,
                            headers: {
                                'Content-Type': 'application/json',
                                ...mockResponse.headers,
                            },
                        }
                    );
                } catch (error) {
                    console.error('Mock handler error:', error);
                    return new Response(
                        JSON.stringify({ error: 'Mock handler error' }),
                        { status: 500 }
                    );
                }
            }
        }

        return null;
    }

    private matchPath(pathname: string, pattern: string): Record<string, string> | null {
        // Convert pattern to regex
        const paramNames: string[] = [];
        const regexPattern = pattern.replace(/:([^/]+)/g, (_, paramName) => {
            paramNames.push(paramName);
            return '([^/]+)';
        });

        const regex = new RegExp(`^${regexPattern}$`);
        const match = pathname.match(regex);

        if (!match) {
            return null;
        }

        const params: Record<string, string> = {};
        paramNames.forEach((name, index) => {
            params[name] = match[index + 1];
        });

        return params;
    }

    // Helper methods for common responses
    static success<T>(data: T, status = 200): MockResponse<T> {
        return { data, status };
    }

    static error(message: string, status = 400): MockResponse {
        return {
            data: { error: message },
            status,
        };
    }

    static notFound(message = 'Resource not found'): MockResponse {
        return MockDataManager.error(message, 404);
    }

    static unauthorized(message = 'Unauthorized'): MockResponse {
        return MockDataManager.error(message, 401);
    }

    static paginated<T>(
        items: T[],
        page = 1,
        limit = 20,
        total?: number
    ): MockResponse {
        const actualTotal = total || items.length;
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedItems = items.slice(start, end);

        return MockDataManager.success({
            data: paginatedItems,
            pagination: {
                page,
                limit,
                total: actualTotal,
                totalPages: Math.ceil(actualTotal / limit),
            },
        });
    }
}

// Export singleton instance
export const mockDataManager = MockDataManager.getInstance(); 