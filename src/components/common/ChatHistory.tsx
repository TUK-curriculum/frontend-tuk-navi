import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Grid, Button } from '@mui/material';

const mockChatHistory = [
    { date: '2025-07-05', question: 'AI가 추천한 커리큘럼을 다시 보고 싶어요.', answer: '최근 추천 커리큘럼: AI 트랙, 필수: 인공지능개론, 선택: 자연어처리 등' },
    { date: '2025-07-03', question: '졸업까지 남은 과목이 뭐야?', answer: '누락 과목: 딥러닝, 컴퓨터비전' },
];

const ChatHistory = ({ history = mockChatHistory }) => (
    <Card sx={{ borderRadius: 4, boxShadow: 2, mb: 3 }}>
        <CardContent>
            <Typography variant="h6" fontWeight={700} mb={2}>최근 챗봇 상담/대화 이력</Typography>
            <Grid container spacing={2}>
                {history.map((item, idx) => (
                    <Grid item xs={12} key={idx}>
                        <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fafc', boxShadow: 1, mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Chip label={item.date} color="info" size="small" />
                                <Button size="small" variant="outlined">복기</Button>
                            </Box>
                            <Typography variant="body2" fontWeight={600} color="primary.main">Q. {item.question}</Typography>
                            <Typography variant="body2" fontWeight={500} color="text.secondary" sx={{ mt: 0.5 }}>A. {item.answer}</Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </CardContent>
    </Card>
);

export default ChatHistory; 