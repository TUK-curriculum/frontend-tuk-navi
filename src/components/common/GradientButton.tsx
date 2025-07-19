import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { motion } from 'framer-motion';

const MotionButton = motion(Button);

const GradientButton = (props: ButtonProps) => (
    <MotionButton
        whileHover={{ scale: 1.06, boxShadow: '0 0 16px 2px #0ea5e9' }}
        whileTap={{ scale: 0.98 }}
        variant="contained"
        disableElevation
        sx={{
            background: 'linear-gradient(90deg, #0ea5e9 0%, #38bdf8 50%, #a855f7 100%)',
            color: '#fff',
            fontWeight: 700,
            borderRadius: 4.5,
            boxShadow: '0 2px 12px 0 rgba(14,165,233,0.18), 0 0 8px 0 #0ea5e9',
            letterSpacing: '-0.01em',
            transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
            textShadow: '0 1px 8px rgba(14,165,233,0.10)',
            '&:hover': {
                background: 'linear-gradient(90deg,#0ea5e9 0%,#a855f7 100%)',
                boxShadow: '0 4px 24px 0 rgba(14,165,233,0.18), 0 0 16px 0 #a855f7',
                filter: 'brightness(1.08)',
            },
            ...props.sx,
        }}
        {...props}
    >
        {props.children}
    </MotionButton>
);

export default GradientButton; 