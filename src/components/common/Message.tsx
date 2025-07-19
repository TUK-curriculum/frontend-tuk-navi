import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import mascot from '../../assets/chatbot.png';

interface MessageProps {
    from: 'user' | 'ai';
    children: React.ReactNode;
    sx?: SxProps<Theme>;
}

interface MessageBubbleProps {
    from: 'user' | 'ai';
    type?: 'error' | 'loading' | 'curriculum-suggestion' | 'text';
    text?: string;
    payload?: string;
    content?: {
        title?: string;
        message?: string;
        description?: string;
        subjects?: string[];
        totalCredits?: number;
        graduationRate?: number;
    };
}

const MessageBubble: React.FC<MessageBubbleProps> = React.memo((props) => {
    const isUser = props.from === 'user';

    // 에러 메시지
    if (props.type === 'error') {
        return (
            <Box sx={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', width: '100%' }}>
                <Box sx={{
                    maxWidth: 600,
                    px: 2,
                    py: 1.5,
                    borderRadius: 3,
                    background: '#fee2e2',
                    color: '#b91c1c',
                    opacity: 1,
                    boxShadow: '0 2px 8px 0 rgba(239,68,68,0.10)',
                    fontWeight: 500,
                    fontSize: 16,
                    mb: 1,
                    animation: 'fadeIn 0.7s',
                    '@keyframes fadeIn': {
                        from: { opacity: 0, transform: 'translateY(16px)' },
                        to: { opacity: 1, transform: 'none' },
                    },
                }}>
                    {props.text || props.payload || '에러가 발생했습니다.'}
                </Box>
            </Box>
        );
    }

    // 로딩 메시지
    if (props.type === 'loading') {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
                <Box sx={{
                    maxWidth: 400,
                    px: 2,
                    py: 1.5,
                    borderRadius: 3,
                    background: '#f1f5f9',
                    color: '#64748b',
                    opacity: 1,
                    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.07)',
                    fontWeight: 500,
                    fontSize: 16,
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    animation: 'fadeIn 0.7s',
                    '@keyframes fadeIn': {
                        from: { opacity: 0, transform: 'translateY(16px)' },
                        to: { opacity: 1, transform: 'none' },
                    },
                }}>
                    <CircularProgress size={18} sx={{ mr: 1 }} />
                    AI가 답변을 준비 중입니다...
                </Box>
            </Box>
        );
    }

    // 커리큘럼 카드형 메시지
    if (props.type === 'curriculum-suggestion' && props.content) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
                <Box sx={{
                    maxWidth: 900,
                    p: 2,
                    borderRadius: 3,
                    background: '#f8fafc',
                    color: '#22223b',
                    opacity: 1,
                    boxShadow: '0 2px 8px 0 rgba(59,130,246,0.10)',
                    mb: 1,
                    animation: 'fadeIn 0.7s',
                    '@keyframes fadeIn': {
                        from: { opacity: 0, transform: 'translateY(16px)' },
                        to: { opacity: 1, transform: 'none' },
                    },
                }}>
                    <Typography variant="h6" fontWeight={800} gutterBottom sx={{ color: '#22223b', opacity: 1 }}>
                        {props.content.title}
                    </Typography>
                    <Typography variant="body2" color="#22223b" gutterBottom sx={{ opacity: 1 }}>
                        {props.content.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                        {props.content.subjects?.map((subject, i) => (
                            <Box key={i} sx={{
                                bgcolor: '#e0e7ff',
                                color: '#22223b',
                                fontWeight: 700,
                                fontSize: 15,
                                borderRadius: 2,
                                px: 1.5,
                                py: 0.5,
                                opacity: 1
                            }}>
                                {subject}
                            </Box>
                        ))}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
                        <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ opacity: 1 }}>
                            총 학점: {props.content.totalCredits}
                        </Typography>
                        <Typography variant="body2" fontWeight={700} color="success.main" sx={{ opacity: 1 }}>
                            졸업률: {props.content.graduationRate}%
                        </Typography>
                    </Box>
                </Box>
            </Box>
        );
    }

    // 기본 텍스트 메시지
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                width: '100%',
            }}
        >
            <Box
                sx={{
                    maxWidth: 600,
                    px: 2,
                    py: 1.5,
                    borderRadius: 3,
                    background: isUser ? '#dff1ff' : '#f1f5f9',
                    color: isUser ? '#22223b' : '#22223b',
                    opacity: 1,
                    boxShadow: isUser ? '0 2px 8px 0 rgba(59,130,246,0.10)' : '0 1px 3px 0 rgba(0,0,0,0.07)',
                    fontWeight: 500,
                    fontSize: 16,
                    mb: 1,
                    animation: 'fadeIn 0.7s',
                    '@keyframes fadeIn': {
                        from: { opacity: 0, transform: 'translateY(16px)' },
                        to: { opacity: 1, transform: 'none' },
                    },
                }}
            >
                {props.text || props.content?.message || props.content?.title}
            </Box>
        </Box>
    );
});

MessageBubble.displayName = 'MessageBubble';

const Message: React.FC<MessageProps> = React.memo(({ from, children, sx }) => {
    const isUser = from === 'user';
    return (
        <Box
            sx={{
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '75%',
                my: 1.2,
                px: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                ...sx,
            }}
        >
            {/* 상단 아이콘 */}
            {!isUser ? (
                <img
                    src={mascot}
                    alt="AI 마스코트"
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #e0f2fe 60%, #bae6fd 100%)',
                        boxShadow: '0 4px 24px #38bdf855, 0 0 16px #60a5fa88',
                        objectFit: 'cover',
                        filter: 'drop-shadow(0 2px 12px #38bdf8aa) drop-shadow(0 0 12px #bae6fd88)',
                        marginBottom: 6,
                        transition: 'box-shadow 0.2s',
                    }}
                />
            ) : (
                <Box
                    sx={{
                        width: 36,
                        height: 36,
                        bgcolor: 'primary.main',
                        color: '#fff',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 16,
                        boxShadow: '0 2px 8px rgba(14,165,233,0.10)',
                        mb: 0.5,
                        userSelect: 'none',
                    }}
                >
                    나
                </Box>
            )}

            {/* 메시지 버블 */}
            <Box
                sx={{
                    maxWidth: 520,
                    p: 2.2,
                    borderRadius: 2.5,
                    background: isUser ? '#dff1ff' : '#fff',
                    color: '#22223b',
                    fontWeight: isUser ? 600 : 600,
                    fontFamily: 'Pretendard, Noto Sans KR, sans-serif',
                    fontSize: 16,
                    boxShadow: isUser
                        ? '0 2px 12px rgba(60,60,130,0.08)'
                        : '0 2px 8px rgba(0,0,0,0.08)',
                    border: isUser ? undefined : '1px solid #e0e0e0',
                    lineHeight: 1.65,
                    wordBreak: 'break-word',
                    mb: 0.5,
                    transition: 'transform 0.18s, box-shadow 0.18s',
                    '&:hover': !isUser ? {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.13)',
                    } : undefined,
                }}
            >
                {children}
            </Box>
        </Box>
    );
});

Message.displayName = 'Message';

export default Message; 