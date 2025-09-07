// 성능 최적화 유틸리티

import { lazy, ComponentType, LazyExoticComponent } from 'react';

// 지연 로딩 헬퍼
export const createLazyComponent = <T extends ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>
): LazyExoticComponent<T> => {
    return lazy(importFunc);
};

// Debounce 함수
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: ReturnType<typeof setTimeout>; 
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

// Throttle 함수
export const throttle = <T extends (...args: any[]) => any>(
    func: T,
    limit: number
): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// 메모리 사용량 모니터링
export const monitorMemoryUsage = () => {
    if ('memory' in performance) {
        const memory = (performance as any).memory;
        console.log('Memory Usage:', {
            used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)} MB`,
            total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)} MB`,
            limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)} MB`
        });
    }
};

// 성능 측정 헬퍼
export const measurePerformance = (name: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
};

// 이미지 지연 로딩
export const lazyLoadImages = () => {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target as HTMLImageElement;
                img.src = img.dataset.src || '';
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
};

// 번들 크기 최적화를 위한 조건부 import
export const conditionalImport = async <T>(
    condition: boolean,
    importFunc: () => Promise<T>
): Promise<T | null> => {
    if (condition) {
        return await importFunc();
    }
    return null;
};

// React 컴포넌트 성능 측정 HOC
export const withPerformanceTracking = <P extends object>(
    WrappedComponent: ComponentType<P>,
    componentName: string
) => {
    return (props: P) => {
        const start = performance.now();

        const component = WrappedComponent(props);

        const end = performance.now();
        if (process.env.NODE_ENV === 'development') {
            console.log(`${componentName} render time: ${end - start}ms`);
        }

        return component;
    };
};

// 캐시 클리어 함수
export const clearCache = () => {
    // Service Worker 캐시 클리어
    if ('serviceWorker' in navigator && 'caches' in window) {
        caches.keys().then(names => {
            names.forEach(name => {
                caches.delete(name);
            });
        });
    }

    // Local Storage 클리어 (선택적)
    if (window.localStorage) {
        const itemsToKeep = ['accessToken', 'refreshToken', 'userEmail'];
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
            if (!itemsToKeep.includes(key)) {
                localStorage.removeItem(key);
            }
        });
    }
};

// 메모리 누수 방지를 위한 cleanup 헬퍼
export const createCleanupTracker = () => {
    const listeners: (() => void)[] = [];

    const addCleanup = (cleanup: () => void) => {
        listeners.push(cleanup);
    };

    const cleanup = () => {
        listeners.forEach(fn => fn());
        listeners.length = 0;
    };

    return { addCleanup, cleanup };
}; 