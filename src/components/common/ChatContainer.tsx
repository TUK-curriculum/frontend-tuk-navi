import React from 'react';
import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

interface ChatContainerProps {
    children: React.ReactNode;
    sx?: SxProps<Theme>;
    isModal?: boolean;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ children, sx, isModal = false }) => {
    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: 700,
                minHeight: 600,
                margin: isModal ? 0 : '60px auto 0 auto',
                borderRadius: '2rem',
                boxShadow: '0 8px 32px 0 rgba(0,0,0,0.08)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                background: 'white',
                p: 0,
                ...sx,
            }}
        >
            {children}
        </Box>
    );
};

export default ChatContainer; 