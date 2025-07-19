import React from 'react';
import { Box } from '@mui/material';

interface MessageRowProps {
    from: 'user' | 'ai';
    children: React.ReactNode;
}

const MessageRow: React.FC<MessageRowProps> = ({ from, children }) => (
    <Box
        sx={{
            display: 'flex',
            justifyContent: from === 'user' ? 'flex-end' : 'flex-start',
            width: '100%',
            mb: 1.5,
        }}
    >
        {children}
    </Box>
);

export default MessageRow; 