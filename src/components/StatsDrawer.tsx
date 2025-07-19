import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import CountUp from 'react-countup';

interface Course {
    id: string;
    name: string;
    code: string;
    instructor: string;
    credits: number;
    day: string;
    startTime: string;
    endTime: string;
    room: string;
    type: 'required' | 'elective' | 'liberal';
}

const StatsDrawer: React.FC<{ courses: Course[] }> = ({ courses }) => (
    <Box
        sx={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: { xs: 12, md: 24 },
            display: 'flex',
            justifyContent: 'center',
            gap: { xs: 1, md: 3 },
            zIndex: 1200,
            pointerEvents: 'none',
            px: 2,
        }}
        aria-label="시간표 통계"
    >
        {[{
            label: '등록된 과목',
            value: courses.length,
            color: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
            bar: 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)',
        }, {
            label: '총 학점',
            value: courses.reduce((sum, c) => sum + c.credits, 0),
            color: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            bar: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
        }, {
            label: '필수 과목',
            value: courses.filter(c => c.type === 'required').length,
            color: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
            bar: 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)',
        }].map((stat) => (
            <Paper
                key={stat.label}
                sx={{
                    minWidth: 120,
                    p: { xs: 2, md: 3 },
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: `0 8px 32px rgba(59,130,246,0.10), 0 4px 16px rgba(0,0,0,0.05)`,
                    textAlign: 'center',
                    pointerEvents: 'auto',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: stat.bar,
                        borderRadius: '4px 4px 0 0',
                    },
                }}
                aria-label={stat.label}
            >
                <Typography variant="h4" fontWeight={900} sx={{
                    background: stat.color,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 0.5,
                }}>
                    <CountUp end={stat.value} duration={0.4} />
                </Typography>
                <Typography variant="subtitle2" fontWeight={700} color="text.secondary">{stat.label}</Typography>
            </Paper>
        ))}
    </Box>
);

export default StatsDrawer; 