import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Grid, Tooltip, LinearProgress } from '@mui/material';

// 예시 mock 데이터
const mockHistory = [
    { date: '2025-07-05', type: '커리큘럼', summary: 'AI 트랙, 필수: 인공지능개론, 선택: 자연어처리 등', satisfaction: 92 },
    { date: '2025-06-30', type: '시간표', summary: '월: 머신러닝, 화: 데이터마이닝', satisfaction: 89 },
];

const RecommendationHistory = ({ history = mockHistory }) => (
    <Card sx={{ borderRadius: 4, boxShadow: 2, mb: 3 }}>
        <CardContent>
            <Typography variant="h6" fontWeight={700} mb={2}>최근 AI 추천 이력</Typography>
            <Grid container spacing={2}>
                {history.map((item, idx) => (
                    <Grid item xs={12} md={6} key={idx}>
                        <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fafc', boxShadow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Chip label={item.type} color={item.type === '커리큘럼' ? 'primary' : 'secondary'} size="small" />
                                <Typography variant="body2" color="text.secondary">{item.date}</Typography>
                                <Tooltip title={`만족도: ${item.satisfaction}%`}><LinearProgress variant="determinate" value={item.satisfaction} sx={{ height: 8, borderRadius: 4, width: 60, ml: 1, background: '#e0e7ef', '& .MuiLinearProgress-bar': { background: '#38bdf8' } }} /></Tooltip>
                                <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700 }}>{item.satisfaction}%</Typography>
                            </Box>
                            <Typography variant="body2" fontWeight={600}>{item.summary}</Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </CardContent>
    </Card>
);

export default RecommendationHistory; 