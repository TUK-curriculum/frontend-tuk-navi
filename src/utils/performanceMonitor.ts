/**
 * Performance monitoring utilities for TUK NAVI
 * Provides functions for measuring and monitoring application performance
 */

export interface PerformanceMetrics {
    loadTime: number;
    renderTime: number;
    memoryUsage?: number;
    fps?: number;
}

export interface ComponentPerformance {
    componentName: string;
    renderCount: number;
    renderTime: number;
    lastRenderTime: number;
}

class PerformanceMonitor {
    private metrics: Map<string, ComponentPerformance> = new Map();
    private observers: PerformanceObserver[] = [];
    private isMonitoring = false;
    private fpsRafId: number | null = null;

    /**
     * Start monitoring performance
     */
    startMonitoring(): void {
        if (this.isMonitoring) return;

        this.isMonitoring = true;

        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            const longTaskObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    console.warn('Long task detected:', entry);
                }
            });

            try {
                longTaskObserver.observe({ entryTypes: ['longtask'] });
                this.observers.push(longTaskObserver);
            } catch (e) {
                console.warn('Long task monitoring not supported');
            }
        }
    }

    /**
     * Stop monitoring and clean up resources
     */
    stopMonitoring(): void {
        if (!this.isMonitoring) return;

        this.isMonitoring = false;

        // Disconnect all observers
        this.observers.forEach(observer => {
            try {
                observer.disconnect();
            } catch (e) {
                console.warn('Error disconnecting observer:', e);
            }
        });
        this.observers = [];

        // Cancel any active animation frames
        if (this.fpsRafId !== null) {
            cancelAnimationFrame(this.fpsRafId);
            this.fpsRafId = null;
        }
    }

    /**
     * Measure component render performance
     */
    measureComponentRender(componentName: string, renderFn: () => void): void {
        const startTime = performance.now();
        renderFn();
        const endTime = performance.now();

        const renderTime = endTime - startTime;

        const existing = this.metrics.get(componentName);
        const updated: ComponentPerformance = {
            componentName,
            renderCount: (existing?.renderCount || 0) + 1,
            renderTime: (existing?.renderTime || 0) + renderTime,
            lastRenderTime: renderTime
        };

        this.metrics.set(componentName, updated);

        // Log slow renders
        if (renderTime > 16) { // 60fps threshold
            console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
        }
    }

    /**
     * Get performance metrics for a component
     */
    getComponentMetrics(componentName: string): ComponentPerformance | undefined {
        return this.metrics.get(componentName);
    }

    /**
     * Get all performance metrics
     */
    getAllMetrics(): ComponentPerformance[] {
        return Array.from(this.metrics.values());
    }

    /**
     * Clear all metrics
     */
    clearMetrics(): void {
        this.metrics.clear();
    }

    /**
     * Export metrics as JSON
     */
    exportMetrics(): string {
        return JSON.stringify({
            timestamp: new Date().toISOString(),
            metrics: Array.from(this.metrics.entries())
        }, null, 2);
    }

    /**
     * Monitor FPS with proper cleanup
     */
    startFPSMonitoring(callback: (fps: number) => void): () => void {
        let frameCount = 0;
        let lastTime = performance.now();
        let isActive = true;

        const measureFPS = () => {
            if (!isActive) return;

            frameCount++;
            const currentTime = performance.now();

            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                callback(fps);
                frameCount = 0;
                lastTime = currentTime;
            }

            this.fpsRafId = requestAnimationFrame(measureFPS);
        };

        this.fpsRafId = requestAnimationFrame(measureFPS);

        // Return cleanup function
        return () => {
            isActive = false;
            if (this.fpsRafId !== null) {
                cancelAnimationFrame(this.fpsRafId);
                this.fpsRafId = null;
            }
        };
    }

    /**
     * Monitor bundle size
     */
    measureBundleSize(): void {
        if ('performance' in window && 'getEntriesByType' in performance) {
            const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
            const scripts = resources.filter(resource => resource.name.includes('.js'));
            const totalSize = scripts.reduce((sum, script) => sum + (script.transferSize || 0), 0);

            console.log(`Bundle size: ${(totalSize / 1024).toFixed(2)}KB`);
        }
    }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook for measuring component performance
 */
export const usePerformanceMonitor = (componentName: string) => {
    const renderCount = React.useRef(0);

    React.useEffect(() => {
        renderCount.current++;
        performanceMonitor.measureComponentRender(componentName, () => {
            // This will be called during render
        });
    });

    return {
        renderCount: renderCount.current,
        metrics: performanceMonitor.getComponentMetrics(componentName)
    };
};

/**
 * Higher-order component for performance monitoring
 */
export const withPerformanceMonitoring = <P extends object>(
    WrappedComponent: React.ComponentType<P>,
    componentName?: string
) => {
    const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';

    const PerformanceMonitoredComponent = React.forwardRef<any, P>((props, ref) => {
        usePerformanceMonitor(displayName);

        return <WrappedComponent { ...props } ref = { ref } />;
    });

    PerformanceMonitoredComponent.displayName = `withPerformanceMonitoring(${displayName})`;

    return PerformanceMonitoredComponent;
};

/**
 * Measure function execution time
 */
export const measureExecutionTime = <T>(fn: () => T, label?: string): T => {
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();

    const executionTime = endTime - startTime;
    console.log(`${label || 'Function'} execution time: ${executionTime.toFixed(2)}ms`);

    return result;
};

/**
 * Async version of measureExecutionTime
 */
export const measureAsyncExecutionTime = async <T>(
    fn: () => Promise<T>,
    label?: string
): Promise<T> => {
    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();

    const executionTime = endTime - startTime;
    console.log(`${label || 'Async function'} execution time: ${executionTime.toFixed(2)}ms`);

    return result;
}; 