import React from 'react';
import { Card, Box } from '@mui/material';

const GlassCard = React.memo((props: React.ComponentProps<typeof Card>) => (
    <Card
        elevation={0}
        sx={{
            borderRadius: 7,
            background: 'rgba(255,255,255,0.95)',
            boxShadow: '0 8px 32px 0 rgba(31,38,135,0.10)',
            backdropFilter: 'blur(14px) saturate(160%)',
            border: '1.5px solid #e5e7eb',
            position: 'relative',
            overflow: 'hidden',
            transition: 'box-shadow 0.3s cubic-bezier(.4,0,.2,1)',
            '&:hover': {
                boxShadow: '0 16px 48px 0 rgba(31,38,135,0.13)',
                border: '1.5px solid #d1d5db',
            },
            '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(120deg,rgba(14,165,233,0.04),rgba(168,85,247,0.03))',
                zIndex: 0,
            },
            ...props.sx,
        }}
        {...props}
    >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
            {props.children}
        </Box>
    </Card>
));

export default GlassCard; 