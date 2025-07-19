import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Chip, Button, Stack } from '@mui/material';
import { School, Person, Numbers, CalendarToday, AccessTime, Room } from '@mui/icons-material';

interface Course {
    id: string;
    name: string;
    code: string;
    instructor: string;
    credits: number;
    day: string;
    startPeriod: number;
    endPeriod: number;
    room: string;
    type: 'required' | 'elective' | 'liberal';
}

const dayNames = {
    monday: '월요일',
    tuesday: '화요일',
    wednesday: '수요일',
    thursday: '목요일',
    friday: '금요일',
};

interface CourseDetailModalProps {
    open: boolean;
    course: Course | null;
    onClose: () => void;
    onDelete?: (id: string) => void;
}

const typeColor = (type: string) =>
    type === 'required' ? 'error' : type === 'elective' ? 'primary' : 'success';

const typeLabel = (type: string) =>
    type === 'required' ? '필수' : type === 'elective' ? '선택' : '교양';

const CourseDetailModal: React.FC<CourseDetailModalProps> = ({ open, course, onClose, onDelete }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{
            sx: {
                borderRadius: 5,
                p: 0,
                boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
                minWidth: { xs: 0, sm: 380 },
            }
        }}>
            <DialogTitle sx={{ fontWeight: 900, fontSize: 22, letterSpacing: '-0.01em', pb: 0.5, textAlign: 'center', pt: 3 }}>
                {course && (
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                        <Typography variant="h5" fontWeight={900} sx={{ fontSize: 22 }}>{course.name}</Typography>
                        <Chip label={typeLabel(course.type)} color={typeColor(course.type)} size="small" sx={{ fontWeight: 700, fontSize: 15, borderRadius: 2, px: 1.5 }} />
                    </Stack>
                )}
            </DialogTitle>
            <DialogContent sx={{ pt: 2, pb: 1.5 }}>
                {course && (
                    <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Numbers sx={{ color: 'primary.main', fontSize: 20 }} />
                            <Typography variant="body2" color="text.secondary">과목코드</Typography>
                            <Typography variant="body2" fontWeight={700}>{course.code}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Person sx={{ color: 'primary.main', fontSize: 20 }} />
                            <Typography variant="body2" color="text.secondary">담당교수</Typography>
                            <Typography variant="body2" fontWeight={700}>{course.instructor}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <School sx={{ color: 'primary.main', fontSize: 20 }} />
                            <Typography variant="body2" color="text.secondary">학점</Typography>
                            <Typography variant="body2" fontWeight={700}>{course.credits}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <CalendarToday sx={{ color: 'primary.main', fontSize: 20 }} />
                            <Typography variant="body2" color="text.secondary">요일</Typography>
                            <Typography variant="body2" fontWeight={700}>{dayNames[course.day as keyof typeof dayNames]}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <AccessTime sx={{ color: 'primary.main', fontSize: 20 }} />
                            <Typography variant="body2" color="text.secondary">시간</Typography>
                            <Typography variant="body2" fontWeight={700}>{course.startPeriod}~{course.endPeriod}교시</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Room sx={{ color: 'primary.main', fontSize: 20 }} />
                            <Typography variant="body2" color="text.secondary">강의실</Typography>
                            <Typography variant="body2" fontWeight={700}>{course.room}</Typography>
                        </Stack>
                    </Stack>
                )}
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 2, gap: 2 }}>
                <Button onClick={onClose} variant="contained" color="primary" sx={{ fontWeight: 700, borderRadius: 3, minWidth: 100 }}>닫기</Button>
                {onDelete && course && (
                    <Button onClick={() => onDelete(course.id)} variant="outlined" color="error" sx={{ fontWeight: 700, borderRadius: 3, minWidth: 100 }}>삭제</Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default CourseDetailModal; 