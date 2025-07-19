import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { motion } from 'framer-motion';

const MotionChip = motion(Chip);

const StyledChip: React.FC<ChipProps> = ({ ...props }) => (
  <MotionChip
    whileHover={{ scale: 1.08 }}
    transition={{ type: 'spring', stiffness: 300, damping: 18 }}
    sx={{
      borderRadius: 2,
      fontWeight: 700,
      fontSize: '1rem',
      px: 2,
      py: 1,
      m: 1,
      ...props.sx,
    }}
    {...props}
  />
);
export default StyledChip; 