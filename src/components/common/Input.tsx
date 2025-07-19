import React, { useCallback, useMemo } from 'react';
import { TextField, TextFieldProps, Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import styled from '@emotion/styled';

// Styled input with motion
// const StyledTextField = styled(motion(TextField)) <{
//     variant?: string;
//     hasError?: boolean;
// }>`
//   .MuiOutlinedInput-root {
//     border-radius: ${({ theme }) => theme.custom.spacing.borderRadius.md};
//     transition: all 0.3s cubic-bezier(.4,0,.2,1);
//     font-family: 'Pretendard, Noto Sans KR, SUIT, sans-serif';
//     font-size: 1rem;
//     & input::placeholder {
//       color: #B0B8C1;
//       font-weight: 400;
//       opacity: 1;
//       font-size: 1rem;
//     }
//     & .MuiInputAdornment-root {
//       min-width: 22px;
//       min-height: 22px;
//       svg {
//         font-size: 22px;
//       }
//       margin-right: 10px;
//       margin-left: 10px;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       }
//     &.Mui-focused {
//       .MuiOutlinedInput-notchedOutline {
//         border-color: ${({ theme }) => theme.palette.primary.main};
//         border-width: 2px;
//         box-shadow: 0 0 0 3px #38bdf822;
//       }
//       background: #f0f9ff;
//     }
//     &.Mui-error {
//       .MuiOutlinedInput-notchedOutline {
//         border-color: ${({ theme }) => theme.palette.error.main};
//       }
//     }
//     padding-left: 0;
//     padding-right: 0;
//   }
//   .MuiInputLabel-root {
//     transition: all 0.3s cubic-bezier(.4,0,.2,1);
//     &.Mui-focused {
//       color: ${({ theme }) => theme.palette.primary.main};
//     }
//     &.Mui-error {
//       color: ${({ theme }) => theme.palette.error.main};
//     }
//   }
// `;

// Error message animation
const ErrorMessage = styled(motion.div)`
  color: ${({ theme }) => theme.palette.error.main};
  font-size: 0.75rem;
  margin-top: 4px;
  margin-left: 14px;
`;

// Input variants
const inputVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.2,
            ease: [0.4, 0, 0.2, 1]
        }
    },
    focus: {
        scale: 1.01,
        transition: {
            duration: 0.1
        }
    }
};

// Error message variants
const errorVariants = {
    initial: { opacity: 0, height: 0 },
    animate: {
        opacity: 1,
        height: 'auto',
        transition: {
            duration: 0.2,
            ease: [0.4, 0, 0.2, 1]
        }
    },
    exit: {
        opacity: 0,
        height: 0,
        transition: {
            duration: 0.15,
            ease: [0.4, 0, 0.2, 1]
        }
    }
};

// Extended input props
export interface InputProps extends Omit<TextFieldProps, 'variant'> {
    variant?: 'outlined' | 'filled' | 'standard';
    size?: 'small' | 'medium';
    error?: boolean;
    errorMessage?: string;
    success?: boolean;
    successMessage?: string;
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'start' | 'end';
    motionProps?: Record<string, unknown>;
}

const Input: React.FC<InputProps> = React.memo(({
    size = 'medium',
    error = false,
    errorMessage,
    success = false,
    successMessage,
    icon,
    iconPosition = 'start',
    motionProps,
    ...props
}) => {
    const [focused, setFocused] = React.useState(false);

    const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        setFocused(true);
        props.onFocus?.(e);
    }, [props.onFocus]);

    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        setFocused(false);
        props.onBlur?.(e);
    }, [props.onBlur]);

    const boxSx = useMemo(() => ({
        display: 'flex',
        alignItems: 'center',
        border: error ? '2px solid #ef4444' : focused ? '2px solid #38bdf8' : '1.5px solid #e5e7eb',
        borderRadius: 3.5,
        background: focused ? '#f0f9ff' : '#fff',
        boxShadow: focused ? '0 0 0 3px #38bdf822' : '0 1.5px 8px #0ea5e911',
        transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
        px: 2.2,
        py: size === 'small' ? 0.7 : 1.2,
        minHeight: size === 'small' ? 38 : 48,
        width: '100%',
        fontFamily: 'Pretendard, Noto Sans KR, SUIT, sans-serif',
    }), [error, focused, size]);

    const inputStyle = useMemo(() => ({
        flex: 1,
        border: 'none',
        outline: 'none',
        background: 'transparent',
        fontSize: size === 'small' ? 15 : 17,
        color: '#22223b',
        fontFamily: 'inherit',
        padding: 0,
        minWidth: 0,
    }), [size]);

    const iconBoxSx = useMemo(() => ({
        color: '#0ea5e9',
        fontSize: 22,
        display: 'flex',
        alignItems: 'center'
    }), []);

    // Enhanced InputProps with icon (not using MUI adornment, but custom flex)
    return (
        <motion.div
            variants={inputVariants}
            initial="initial"
            animate="animate"
            whileFocus="focus"
            {...motionProps}
        >
            <Box
                sx={boxSx}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
            >
                {icon && iconPosition === 'start' && (
                    <Box sx={{ ...iconBoxSx, mr: 1.2 }}>{icon}</Box>
                )}
                <input
                    {...props}
                    style={inputStyle}
                    placeholder={props.placeholder}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
                {icon && iconPosition === 'end' && (
                    <Box sx={{ ...iconBoxSx, ml: 1.2 }}>{icon}</Box>
                )}
            </Box>
            <AnimatePresence>
                {error && errorMessage && (
                    <ErrorMessage
                        key="error"
                        variants={errorVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        {errorMessage}
                    </ErrorMessage>
                )}
                {success && successMessage && !error && (
                    <motion.div
                        key="success"
                        variants={errorVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        style={{
                            color: '#4CAF50',
                            fontSize: '0.75rem',
                            marginTop: '4px',
                            marginLeft: '14px'
                        }}
                    >
                        {successMessage}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
});

Input.displayName = 'Input';

export default Input; 