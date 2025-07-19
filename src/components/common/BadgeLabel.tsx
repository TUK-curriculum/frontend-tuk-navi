import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { motion } from 'framer-motion';

const MotionChip = motion(Chip);

const BadgeLabel: React.FC<ChipProps> = ({ label, color = 'primary', icon, ...props }) => (
    <MotionChip
        label={label}
        color={color}
        icon={icon}
        whileHover={{ scale: 1.08 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        sx={{
            fontWeight: 700,
            fontSize: '0.95rem',
            borderRadius: 2,
            px: 1.5,
            ...props.sx,
        }}
        {...props}
    />
);

export default BadgeLabel; 