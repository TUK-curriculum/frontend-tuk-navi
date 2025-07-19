import React, { useCallback, useMemo } from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, styled } from '@mui/material';
import { motion } from 'framer-motion';

// Styled Button with Codeit-style design
const StyledButton = styled(MuiButton)<ButtonProps>(({ theme, variant, size, fullWidth, fontFamily }) => ({
    textTransform: 'none',
    fontWeight: 600,
    borderRadius: 12,
    border: 'none',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
    fontFamily: fontFamily || 'Pretendard, Noto Sans KR, SUIT, sans-serif',

    // Size variants
    ...(size === 'small' && {
        padding: '8px 16px',
        fontSize: '13px',
        minHeight: 36,
    }),
    ...(size === 'medium' && {
        padding: '12px 24px',
        fontSize: '14px',
        minHeight: 44,
    }),
    ...(size === 'large' && {
        padding: '16px 32px',
        fontSize: '16px',
        minHeight: 52,
    }),

    // Variant styles
    ...(variant === 'contained' && {
        background: theme.custom.colors.gradients.primary,
        color: theme.custom.colors.text.inverse,
        boxShadow: `0 2px 8px ${theme.custom.colors.shadows.medium}`,
        '&:hover': {
            background: theme.custom.colors.gradients.primary,
            opacity: 0.96,
            transform: 'translateY(-2px) scale(1.03)',
            boxShadow: `0 8px 32px ${theme.custom.colors.shadows.dark}`,
            outline: '2.5px solid #38bdf8',
        },
        '&:focus-visible': {
            outline: '2.5px solid #6366f1',
            boxShadow: `0 0 0 4px #6366f122`,
        },
        '&:active': {
            transform: 'scale(0.98)',
            boxShadow: `0 2px 8px ${theme.custom.colors.shadows.medium}`,
        },
        '&:disabled': {
            background: theme.custom.colors.neutral[300],
            color: theme.custom.colors.neutral[500],
            boxShadow: 'none',
        },
    }),

    ...(variant === 'outlined' && {
        background: 'transparent',
        border: `2px solid ${theme.custom.colors.primary[300]}`,
        color: theme.custom.colors.primary[600],
        '&:hover': {
            background: theme.custom.colors.primary[50],
            borderColor: theme.custom.colors.primary[500],
            transform: 'translateY(-1px) scale(1.02)',
            boxShadow: `0 4px 12px ${theme.custom.colors.shadows.light}`,
        },
        '&:focus-visible': {
            outline: '2.5px solid #38bdf8',
            boxShadow: `0 0 0 4px #38bdf822`,
        },
        '&:active': {
            transform: 'scale(0.98)',
        },
        '&:disabled': {
            borderColor: theme.custom.colors.neutral[300],
            color: theme.custom.colors.neutral[400],
        },
    }),

    ...(variant === 'text' && {
        background: 'transparent',
        color: theme.custom.colors.primary[600],
        padding: '8px 16px',
        '&:hover': {
            background: theme.custom.colors.primary[50],
            transform: 'translateY(-1px) scale(1.01)',
        },
        '&:focus-visible': {
            outline: '2.5px solid #38bdf8',
        },
        '&:active': {
            transform: 'scale(0.98)',
        },
        '&:disabled': {
            color: theme.custom.colors.neutral[400],
        },
    }),

    // Full width
    ...(fullWidth && {
        width: '100%',
    }),

    // Loading state
    '&.loading': {
        pointerEvents: 'none',
        opacity: 0.7,
    },

    // Icon spacing
    '& .MuiButton-startIcon': {
        marginRight: 10,
    },
    '& .MuiButton-endIcon': {
        marginLeft: 10,
    },
}));

// Motion Button wrapper
const MotionButton = motion(StyledButton);

// Extended button props
export interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
    variant?: 'contained' | 'outlined' | 'text';
    size?: 'small' | 'medium' | 'large';
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'start' | 'end';
    animate?: boolean;
    fontFamily?: string;
}

const Button: React.FC<ButtonProps> = React.memo(({
    children,
    variant = 'contained',
    size = 'medium',
    loading = false,
    icon,
    iconPosition = 'start',
    animate = true,
    disabled,
    className,
    fontFamily,
    ...props
}) => {

    const buttonProps = useMemo(() => ({
        variant,
        size,
        disabled: disabled || loading,
        className: `${className || ''} ${loading ? 'loading' : ''}`,
        startIcon: icon && iconPosition === 'start' ? icon : undefined,
        endIcon: icon && iconPosition === 'end' ? icon : undefined,
        fontFamily,
        ...props,
    }), [variant, size, disabled, loading, className, icon, iconPosition, fontFamily, props]);

    const motionProps = useMemo(() => ({
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.98 },
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.2 }
    }), []);

    if (animate) {
        return (
            <MotionButton
                {...buttonProps}
                {...motionProps}
            >
                {children}
            </MotionButton>
        );
    }

    return (
        <StyledButton {...buttonProps}>
            {children}
        </StyledButton>
    );
});

Button.displayName = 'Button';

export default Button; 