import React, { useRef, useEffect, useState } from 'react';
import { Box, Skeleton, CircularProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useImageLoading, ImageLoadingState } from '../../utils/imageOptimization';

interface OptimizedImageProps {
    src: string;
    alt: string;
    width?: number | string;
    height?: number | string;
    priority?: boolean;
    placeholder?: string;
    className?: string;
    style?: React.CSSProperties;
    onLoad?: () => void;
    onError?: () => void;
    showLoadingSpinner?: boolean;
    borderRadius?: number | string;
    objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

const OptimizedImage: React.FC<OptimizedImageProps> = React.memo(({
    src,
    alt,
    width,
    height,
    priority = false,
    placeholder,
    className,
    style,
    onLoad,
    onError,
    showLoadingSpinner = true,
    borderRadius = 0,
    objectFit = 'cover'
}) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const [isIntersecting, setIsIntersecting] = useState(false);
    const { state, error } = useImageLoading(isIntersecting ? src : '');

    useEffect(() => {
        if (!imgRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsIntersecting(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '50px 0px',
                threshold: 0.01
            }
        );

        observer.observe(imgRef.current);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (state === ImageLoadingState.LOADED) {
            onLoad?.();
        } else if (state === ImageLoadingState.ERROR) {
            onError?.();
        }
    }, [state, onLoad, onError]);

    const containerStyle: React.CSSProperties = {
        position: 'relative',
        width: width || 'auto',
        height: height || 'auto',
        borderRadius: borderRadius,
        overflow: 'hidden',
        ...style
    };

    const imageStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        objectFit,
        borderRadius: borderRadius,
        transition: 'opacity 0.3s ease-in-out'
    };

    return (
        <Box sx={containerStyle} className={className}>
            <AnimatePresence mode="wait">
                {state === ImageLoadingState.LOADING && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#f5f5f5'
                        }}
                    >
                        {showLoadingSpinner ? (
                            <CircularProgress size={40} />
                        ) : (
                            <Skeleton
                                variant="rectangular"
                                width="100%"
                                height="100%"
                                animation="wave"
                            />
                        )}
                    </motion.div>
                )}

                {state === ImageLoadingState.LOADED && (
                    <motion.img
                        key="loaded"
                        ref={imgRef}
                        src={src}
                        alt={alt}
                        style={imageStyle}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        loading={priority ? 'eager' : 'lazy'}
                    />
                )}

                {state === ImageLoadingState.ERROR && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#f5f5f5',
                            color: '#666',
                            fontSize: '14px'
                        }}
                    >
                        이미지를 불러올 수 없습니다
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hidden image for intersection observer */}
            {!isIntersecting && (
                <img
                    ref={imgRef}
                    src={placeholder || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmNWY1ZjUiLz48L3N2Zz4='}
                    alt=""
                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                />
            )}
        </Box>
    );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage; 