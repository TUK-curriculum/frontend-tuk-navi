import { Box, Typography, Divider } from '@mui/material';
import React from 'react';

interface ChatbotCardProps {
    icon?: React.ReactNode;
    title?: string;
    description?: string;
    children?: React.ReactNode;
    sx?: object;
    onClick?: () => void;
}

const ChatbotCard: React.FC<ChatbotCardProps> = ({ icon, title, description, children, sx, onClick }) => (
    <Box
        sx={{
            minWidth: 260,
            maxWidth: 380,
            p: 3,
            borderRadius: 4,
            boxShadow: '0 4px 24px 0 rgba(80,110,240,0.10)',
            border: '1.5px solid #e0e7ef',
            background: 'linear-gradient(135deg, #f8fafc 60%, #e0f2fe 100%)',
            transition: 'box-shadow 0.22s, border-color 0.22s, filter 0.22s, transform 0.18s',
            '&:hover': {
                border: '2.5px solid #1da1f2', // 더 진한 파랑
                boxShadow: '0 8px 36px 0 rgba(29,161,242,0.18), 0 0 0 2px #bae6fd', // 그림자 강조
                filter: 'brightness(1.04)', // 약간 밝게
                transform: 'translateY(-3px) scale(1.035)',
            },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            mb: 3,
            cursor: onClick ? 'pointer' : undefined,
            ...sx,
        }}
        onClick={onClick}
    >
        {(icon || title) && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {icon && <Box sx={{ fontSize: 28, mr: 1 }}>{icon}</Box>}
                {title && <Typography variant="h6" fontWeight={900}>{title}</Typography>}
            </Box>
        )}
        {description && (
            <Typography variant="body2" color="text.secondary" mb={1.5}>{description}</Typography>
        )}
        <Divider sx={{ my: 1 }} />
        {children}
    </Box>
);

export default ChatbotCard; 