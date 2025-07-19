import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { motion } from 'framer-motion';

const MotionButton = motion(Button);

const StyledButton: React.FC<ButtonProps> = ({ children, ...props }) => (
    <MotionButton
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        sx={{
            borderRadius: 3,
            background: 'linear-gradient(90deg, #0ea5e9 0%, #38bdf8 100%)',
            color: '#fff',
            fontWeight: 700,
            px: 5,
            py: 2,
            boxShadow: '0 2px 8px rgba(30,80,200,0.10)',
            '&:hover': {
                background: 'linear-gradient(90deg, #38bdf8 0%, #0ea5e9 100%)',
                boxShadow: '0 4px 16px rgba(30,80,200,0.18)',
            },
            ...props.sx,
        }}
        {...props}
    >
        {children}
    </MotionButton>
);
export default StyledButton; 