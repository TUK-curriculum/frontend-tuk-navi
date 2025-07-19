import React from 'react';
import { Card, CardContent, CardProps } from '@mui/material';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

const StyledCard: React.FC<CardProps> = ({ children, ...props }) => (
    <MotionCard
        whileHover={{ scale: 1.03, boxShadow: '0 8px 32px rgba(30,80,200,0.14)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        sx={{
            borderRadius: 4,
            boxShadow: '0 4px 24px rgba(30,80,200,0.08)',
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.18)',
            p: { xs: 3, md: 6 },
            m: { xs: 2, md: 4 },
            ...props.sx,
        }}
        {...props}
    >
        <CardContent>{children}</CardContent>
    </MotionCard>
);
export default StyledCard; 