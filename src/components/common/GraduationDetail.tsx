import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Chip, Grid, LinearProgress, Collapse, Button } from '@mui/material';

const mockGraduation = [
    { label: '전공필수', value: 24, total: 30, missing: ['컴퓨터비전', '딥러닝'] },
    { label: '전공선택', value: 18, total: 24, missing: ['빅데이터분석'] },
    { label: '교양필수', value: 12, total: 12, missing: [] },
    { label: '교양선택', value: 10, total: 10, missing: [] },
];

const GraduationDetail = ({ graduation = mockGraduation }) => {
    const [open, setOpen] = useState(Array(graduation.length).fill(false));
    const handleToggle = idx => setOpen(open => open.map((v, i) => i === idx ? !v : v));
    return (
        <Card sx={{ borderRadius: 4, boxShadow: 2, mb: 3 }}>
            <CardContent>
                <Typography variant="h6" fontWeight={700} mb={2}>졸업요건/이수내역 상세</Typography>
                <Grid container spacing={2}>
                    {graduation.map((item, idx) => (
                        <Grid item xs={12} md={6} key={item.label}>
                            <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fafc', boxShadow: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Chip label={item.label} color="primary" size="small" />
                                    <LinearProgress variant="determinate" value={Math.round(item.value / item.total * 100)} sx={{ height: 8, borderRadius: 4, width: 60, ml: 1, background: '#e0e7ef', '& .MuiLinearProgress-bar': { background: '#60a5fa' } }} />
                                    <Typography variant="caption" sx={{ color: '#60a5fa', fontWeight: 700 }}>{item.value}/{item.total}학점</Typography>
                                    {item.missing.length > 0 && (
                                        <Button size="small" onClick={() => handleToggle(idx)} sx={{ ml: 1 }} variant="outlined">누락 과목</Button>
                                    )}
                                </Box>
                                <Collapse in={open[idx]}>
                                    {item.missing.length > 0 ? (
                                        <Box sx={{ mt: 1 }}>
                                            <Typography variant="body2" color="error" fontWeight={600}>누락 과목: {item.missing.join(', ')}</Typography>
                                            <Typography variant="body2" color="info.main">AI 추천: "딥러닝" 수강을 권장합니다.</Typography>
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" color="success.main">모든 과목 이수 완료!</Typography>
                                    )}
                                </Collapse>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    );
};

export default GraduationDetail; 