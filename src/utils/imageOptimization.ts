/**
 * Image optimization utilities for TUK NAVI
 * Provides functions for lazy loading, preloading, and optimizing images
 */

export interface ImageConfig {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    priority?: boolean;
    placeholder?: string;
}

/**
 * Creates an optimized image element with lazy loading
 */
export const createOptimizedImage = (config: ImageConfig): HTMLImageElement => {
    const img = new Image();

    if (config.width) img.width = config.width;
    if (config.height) img.height = config.height;
    img.alt = config.alt;
    img.loading = config.priority ? 'eager' : 'lazy';

    // Add placeholder if provided
    if (config.placeholder) {
        img.src = config.placeholder;
    }

    // Set actual image source
    img.src = config.src;

    return img;
};

/**
 * Preloads critical images for better performance
 */
export const preloadCriticalImages = (imageUrls: string[]): void => {
    imageUrls.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = url;
        document.head.appendChild(link);
    });
};

/**
 * Generates a low-quality placeholder for images
 */
export const generatePlaceholder = (width: number, height: number): string => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
        // Create a simple gradient placeholder
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#f0f0f0');
        gradient.addColorStop(1, '#e0e0e0');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    return canvas.toDataURL();
};

/**
 * Optimizes image loading with intersection observer
 */
export const createImageObserver = (
    imageElement: HTMLImageElement,
    onLoad?: () => void,
    onError?: () => void
): IntersectionObserver => {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target as HTMLImageElement;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                        onLoad?.();
                    }
                }
            });
        },
        {
            rootMargin: '50px 0px',
            threshold: 0.01
        }
    );

    observer.observe(imageElement);
    return observer;
};

/**
 * Compresses image data URL for better performance
 */
export const compressImage = async (
    file: File,
    maxWidth: number = 800,
    quality: number = 0.8
): Promise<string> => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            const { width, height } = img;
            const ratio = Math.min(maxWidth / width, maxWidth / height);

            canvas.width = width * ratio;
            canvas.height = height * ratio;

            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', quality));
        };

        img.src = URL.createObjectURL(file);
    });
};

/**
 * Checks if image is cached in browser
 */
export const isImageCached = (src: string): boolean => {
    const img = new Image();
    img.src = src;
    return img.complete;
};

/**
 * Image loading states
 */
export enum ImageLoadingState {
    LOADING = 'loading',
    LOADED = 'loaded',
    ERROR = 'error'
}

/**
 * Hook for managing image loading state
 */
export const useImageLoading = (src: string) => {
    const [state, setState] = React.useState<ImageLoadingState>(ImageLoadingState.LOADING);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!src) return;

        const img = new Image();

        img.onload = () => {
            setState(ImageLoadingState.LOADED);
            setError(null);
        };

        img.onerror = () => {
            setState(ImageLoadingState.ERROR);
            setError('Failed to load image');
        };

        img.src = src;
    }, [src]);

    return { state, error };
}; 