import React, { useMemo } from 'react';
import { Card as MuiCard, CardProps as MuiCardProps, styled } from '@mui/material';
import { motion } from 'framer-motion';
import type { ComponentProps } from 'react';


// Styled Card with Codeit-style design
const StyledCard = styled(MuiCard)<CardProps>(({ theme, variant, elevation, interactive }) => ({
    borderRadius: 16,
    border: `1px solid ${theme.custom.colors.border.light}`,
    background: theme.custom.colors.background.paper,
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease-in-out',

    // Elevation variants
    ...(elevation === 'low' && {
        boxShadow: `0 2px 8px ${theme.custom.colors.shadows.light}`,
    }),
    ...(elevation === 'medium' && {
        boxShadow: `0 4px 16px ${theme.custom.colors.shadows.medium}`,
    }),
    ...(elevation === 'high' && {
        boxShadow: `0 8px 32px ${theme.custom.colors.shadows.dark}`,
    }),

    // Variant styles
    ...(variant === 'default' && {
        background: theme.custom.colors.background.paper,
    }),

    ...(variant === 'gradient' && {
        background: theme.custom.colors.gradients.background,
    }),

    ...(variant === 'glass' && {
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        border: `1px solid rgba(255, 255, 255, 0.2)`,
    }),

    // Interactive styles
    ...(interactive && {
        cursor: 'pointer',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 40px ${theme.custom.colors.shadows.dark}`,
        },
        '&:active': {
            transform: 'translateY(-2px)',
        },
    }),

    // Hover effects for all cards
    '&:hover': {
        borderColor: theme.custom.colors.primary[300],
    },

    // Content padding
    '& .MuiCardContent-root': {
        padding: theme.spacing(3),
    },

    // Header styles
    '& .MuiCardHeader-root': {
        padding: theme.spacing(3, 3, 0, 3),
    },

    // Action styles
    '& .MuiCardActions-root': {
        padding: theme.spacing(0, 3, 3, 3),
    },

    // Media styles
    '& .MuiCardMedia-root': {
        borderBottom: `1px solid ${theme.custom.colors.border.light}`,
    },
}));

// Motion Card wrapper
const MotionCard = motion(StyledCard);

// Extended card props
export interface CustomCardProps extends Omit<MuiCardProps, 'variant'> {
    variant?: 'default' | 'gradient' | 'glass';
    elevation?: 'low' | 'medium' | 'high';
    motionProps?: ComponentProps<typeof motion.div>;
    delay?: number;
    interactive?: boolean;
}

const Card: React.FC<CustomCardProps> = React.memo(({
    children,
    variant = 'default',
    elevation = 'medium',
    motionProps,
    delay = 0,
    interactive = false,
    className,
    ...props
}) => {
    const cardProps = useMemo(() => ({
        variant,
        elevation,
        interactive,
        className,
        ...props,
    }), [variant, elevation, interactive, className, props]);

    const motionAnimationProps = useMemo(() => ({
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: {
            duration: 0.4,
            delay: delay * 0.1,
            ease: [0.4, 0, 0.2, 1]
        },
        whileHover: {
            y: -4,
            transition: { duration: 0.2 }
        },
        whileTap: {
            y: -2,
            transition: { duration: 0.1 }
        },
        ...motionProps
    }), [delay, motionProps]);

    if (interactive) {
        return (
            <MotionCard
                {...cardProps}
                {...motionAnimationProps}
            >
                {children}
            </MotionCard>
        );
    }

    return (
        <StyledCard {...cardProps}>
            {children}
        </StyledCard>
    );
});

Card.displayName = 'Card';

export default Card; 