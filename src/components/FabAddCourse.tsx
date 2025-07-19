import React from 'react';
import { Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const FabAddCourse: React.FC<{ onClick: () => void; sx?: React.CSSProperties; 'aria-label'?: string }> = ({ onClick, sx, ...props }) => (
    <Fab
        color="primary"
        aria-label={props['aria-label'] || '과목 추가'}
        onClick={onClick}
        sx={{
            position: 'fixed',
            bottom: { xs: 20, md: 32 },
            right: { xs: 20, md: 32 },
            zIndex: 1400,
            width: 56,
            height: 56,
            background: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            color: '#3B82F6',
            fontSize: 32,
            '&:hover': { background: 'rgba(255,255,255,0.8)' },
            ...sx,
        }}
        {...props}
    >
        <AddIcon fontSize="large" />
    </Fab>
);

export default FabAddCourse; 