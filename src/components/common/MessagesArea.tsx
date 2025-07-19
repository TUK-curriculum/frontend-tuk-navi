import React, { useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

interface MessagesAreaProps {
    messageList: unknown[];
    loading: boolean;
    renderMessage: (msg: unknown, i: number) => React.ReactNode;
    sx?: SxProps<Theme>;
}

const MessagesArea = ({ messageList, loading, renderMessage, sx }: MessagesAreaProps) => {
    const messagesEndRef = useRef(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messageList]);
    return (
        <Box
            sx={{
                flex: 1,
                overflowY: 'auto',
                px: 2,
                py: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                minHeight: 0,
                background: '#f8fafc',
                ...sx,
            }}
        >
            {messageList.map((msg, i) => renderMessage(msg, i))}
            <div ref={messagesEndRef} />
            {loading && <Typography sx={{ color: 'grey.500', fontSize: 15, mt: 2 }}>AI 응답 생성중...</Typography>}
        </Box>
    );
};

export default MessagesArea; 