import { mockDataManager } from '../mocks/MockDataManager';
import { environment } from './environment';

// Store the original fetch function
const originalFetch = window.fetch;

// Override fetch to intercept requests in mock mode
export const setupMockInterceptor = (): void => {
    if (!environment.mockMode) {
        return;
    }

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const request = new Request(input, init);

        // Check if this is an API request
        if (request.url.startsWith(environment.apiUrl)) {
            // Try to handle with mock data manager
            const mockResponse = await mockDataManager.handleRequest(request);

            if (mockResponse) {
                console.log('[Mock Interceptor]', request.method, request.url);
                return mockResponse;
            }
        }

        // Fall back to original fetch for non-API requests or unhandled routes
        return originalFetch(input, init);
    };

    console.log('[Mock Interceptor] Enabled in development mode');
};

// Restore original fetch function
export const disableMockInterceptor = (): void => {
    window.fetch = originalFetch;
    console.log('[Mock Interceptor] Disabled');
}; 