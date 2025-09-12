import React from 'react';
import { Box, Typography } from '@mui/material';
import GlassCard from './GlassCard';

export interface CourseChipProps {
    course: {
        id: number;
        name: string;
        code: string;
        instructor: string;
        credits: number;
        day: string;
        startPeriod: number;
        endPeriod: number;
        room: string;
        type: 'required' | 'elective' | 'liberal';
    };
    onClick?: () => void;
    sx?: React.CSSProperties;
}

const typeColors: Record<string, string> = {
    required: '#DC2626',
    elective: '#3B82F6',
    liberal: '#34D399',
};
const typeInfo: Record<string, { label: string; emoji: string }> = {
    required: { label: '필수', emoji: '🔴' },
    elective: { label: '선택', emoji: '🔵' },
    liberal: { label: '교양', emoji: '🟢' },
};

const GlassCourseChip: React.FC<CourseChipProps> = ({ course, onClick, sx }) => {
    // 교시 라벨 표시
    const periodLabel = course.startPeriod === course.endPeriod
        ? `${course.startPeriod}교시`
        : `${course.startPeriod}~${course.endPeriod}교시`;
    return (
        <GlassCard
            tabIndex={0}
            aria-label={`${course.name} ${course.type} ${periodLabel}`}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.3,
                px: 1.2,
                py: 1.2,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${typeColors[course.type]}10 0%, ${typeColors[course.type]}20 100%)`,
                border: `1.5px solid ${typeColors[course.type]}30`,
                boxShadow: `0 2px 8px ${typeColors[course.type]}10`,
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.2s',
                overflow: 'hidden',
                minHeight: 32,
                maxHeight: 60,
                ...sx,
            }}
            onClick={onClick}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mb: 0.2, flexWrap: 'wrap' }}>
                <Box sx={{ fontSize: 14, mr: 0.3 }}>{typeInfo[course.type].emoji}</Box>
                <Typography sx={{ fontWeight: 600, color: typeColors[course.type], fontSize: '0.85rem', mr: 0.7 }}>
                    {typeInfo[course.type].label}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, ml: 0.7, fontSize: '0.8rem' }}>
                    {periodLabel}
                </Typography>
            </Box>
            <Typography variant="body1" fontWeight={600} sx={{
                color: '#1e293b',
                fontSize: '0.95rem',
                lineHeight: 1.2,
                mb: 0.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
            }}>
                {course.name}
            </Typography>
            <Typography variant="caption" sx={{
                color: '#64748b',
                fontSize: '0.8rem',
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
            }}>
                {course.room}
            </Typography>
            <Typography variant="caption" sx={{
                color: '#64748b',
                fontSize: '0.8rem',
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
            }}>
                {course.instructor}
            </Typography>
        </GlassCard>
    );
};

export default GlassCourseChip; 