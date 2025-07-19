// src/utils/performance.ts
// 성능 모니터링 및 최적화 유틸리티

interface PerformanceMetric {
    name: string;
    value: number;
    rating: string;
    timestamp: number;
    page: string;
}

interface ErrorLog {
    timestamp: number;
    message: string;
    stack?: string;
    page: string;
    userAgent: string;
}

class PerformanceMonitor {
    private metrics: PerformanceMetric[] = [];
    private errors: ErrorLog[] = [];
    private isProduction: boolean;

    constructor(isProduction: boolean = false) {
        this.isProduction = isProduction;
        this.initializeMonitoring();
    }

    private initializeMonitoring(): void {
        if (typeof window === 'undefined') return;

        // Initialize error tracking
        this.initErrorTracking();

        // Initialize performance observer
        this.initPerformanceObserver();
    }

    private initErrorTracking(): void {
        // Global error handler
        window.addEventListener('error', (event) => {
            const errorData: ErrorLog = {
                timestamp: Date.now(),
                message: event.message,
                stack: event.error?.stack,
                page: window.location.pathname,
                userAgent: navigator.userAgent,
            };

            this.errors.push(errorData);
            this.handleError(errorData);
        });

        // Promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            const errorData: ErrorLog = {
                timestamp: Date.now(),
                message: `Unhandled Promise Rejection: ${event.reason}`,
                stack: event.reason?.stack,
                page: window.location.pathname,
                userAgent: navigator.userAgent,
            };

            this.errors.push(errorData);
            this.handleError(errorData);
        });
    }

    private initPerformanceObserver(): void {
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        if (entry.entryType === 'navigation') {
                            this.logNavigationTiming(entry as PerformanceNavigationTiming);
                        } else if (entry.entryType === 'resource') {
                            this.logResourceTiming(entry as PerformanceResourceTiming);
                        }
                    });
                });

                observer.observe({ entryTypes: ['navigation', 'resource'] });
            } catch (error) {
                console.warn('PerformanceObserver not supported:', error);
            }
        }
    }

    private logNavigationTiming(entry: PerformanceNavigationTiming): void {
        if (!this.isProduction) {
            console.group('📊 Navigation Timing');
            console.log('DNS Lookup:', entry.domainLookupEnd - entry.domainLookupStart);
            console.log('TCP Connection:', entry.connectEnd - entry.connectStart);
            console.log('Server Response:', entry.responseStart - entry.requestStart);
            console.log('DOM Processing:', entry.domComplete - entry.domLoading);
            console.log('Page Load:', entry.loadEventEnd - entry.loadEventStart);
            console.groupEnd();
        }
    }

    private logResourceTiming(entry: PerformanceResourceTiming): void {
        // Log slow resource loading
        if (entry.duration > 1000) {
            console.warn(`🐌 Slow resource loading (${entry.duration.toFixed(2)}ms):`, entry.name);
        }
    }

    private handleError(errorData: ErrorLog): void {
        if (this.isProduction) {
            this.sendErrorToService(errorData);
        } else {
            console.group('🚨 Error Captured');
            console.error('Message:', errorData.message);
            console.error('Stack:', errorData.stack);
            console.groupEnd();
        }
    }

    private sendErrorToService(errorData: ErrorLog): void {
        // Send to error reporting service in production
        console.error('Production error:', errorData);
    }

    // Public methods
    public trackCustomEvent(name: string, value: number, metadata?: Record<string, any>): void {
        const customMetric = {
            name,
            value,
            rating: value > 1000 ? 'poor' : value > 500 ? 'needs-improvement' : 'good',
            metadata,
            timestamp: Date.now(),
            page: window.location.pathname,
        };

        this.metrics.push(customMetric);

        if (!this.isProduction) {
            console.log('📈 Custom Event:', customMetric);
        }
    }

    public getMetrics(): PerformanceMetric[] {
        return [...this.metrics];
    }

    public getErrors(): ErrorLog[] {
        return [...this.errors];
    }

    public generateReport(): string {
        const report = {
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            metrics: this.metrics.slice(-10),
            errors: this.errors.slice(-5),
            performance: {
                memory: (performance as any).memory ? {
                    used: (performance as any).memory.usedJSHeapSize,
                    total: (performance as any).memory.totalJSHeapSize,
                    limit: (performance as any).memory.jsHeapSizeLimit,
                } : undefined,
            },
        };

        return JSON.stringify(report, null, 2);
    }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor(process.env.NODE_ENV === 'production');

export default performanceMonitor; 