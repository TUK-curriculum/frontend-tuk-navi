import React from 'react';
import { Button, ButtonProps } from '@mui/material';

const GradientButton: React.FC<ButtonProps> = (props) => (
    <Button
        {...props}
        sx={{
            ...props.sx,
            background: 'linear-gradient(90deg, #38bdf8 0%, #818cf8 100%)',
            color: '#fff',
            boxShadow: '0 2px 8px #38bdf855',
            fontWeight: 700,
            fontSize: '1rem',
            borderRadius: '12px',
            transition: '0.2s',
            '&:hover': {
                background: 'linear-gradient(90deg, #818cf8 0%, #38bdf8 100%)',
                boxShadow: '0 4px 20px #818cf877',
            },
        }}
    />
);

export default GradientButton; 