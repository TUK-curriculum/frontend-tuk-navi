import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Chip, Button } from '@mui/material';
import GlassCard from '../components/common/GlassCard';

const dayNames = {
    monday: '월요일',
    tuesday: '화요일',
    wednesday: '수요일',
    thursday: '목요일',
    friday: '금요일',
    saturday: '토요일',
    sunday: '일요일'
};

const CourseDetail: React.FC = () => {
    const { id } = useParams<{ id: number }>();
    const navigate = useNavigate();

    if (!id) {
        return (
            <Box sx={{ p: 8, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={900} color="error.main">존재하지 않는 과목입니다.</Typography>
                <Button onClick={() => navigate(-1)} sx={{ mt: 3 }}>돌아가기</Button>
            </Box>
        );
    }

    return (
        <Box sx={{ pt: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: 'linear-gradient(120deg, #f7fbff 0%, #f0f6ff 100%)' }}>
            <GlassCard sx={{ maxWidth: 480, width: '100%', mt: 6, p: 5, borderRadius: 5, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                <Typography variant="h4" fontWeight={900} gutterBottom>{id}</Typography>
                <Chip label="필수" color="error" size="small" sx={{ fontWeight: 700, mb: 2 }} />
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>과목코드: {id}</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>담당교수: {id}</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>학점: {id}</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>요일: {dayNames[id as keyof typeof dayNames]}</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>시간: {id} ~ {id}</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>강의실: {id}</Typography>
                <Button variant="contained" sx={{ mt: 3, fontWeight: 700 }} onClick={() => navigate(-1)}>돌아가기</Button>
            </GlassCard>
        </Box>
    );
};

export default CourseDetail; 