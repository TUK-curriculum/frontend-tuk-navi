import React, { useEffect, useState } from 'react';
import {
    Box, Card, Typography, Grid, LinearProgress, Chip, Divider, Button, Paper, Avatar, Tooltip, Dialog, DialogContent, Alert, CircularProgress
} from '@mui/material';
import { School, AssignmentTurnedIn, CheckCircle, Warning, Edit, Info, Person, Refresh } from '@mui/icons-material';
import Graduation from './Graduation';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../utils/apiClient';
import { apiService } from '../services/ApiService'; 

interface GraduationStudent {
    id: string;
    name: string;
    dept: string;
    curriculumYear: number;
}

interface GraduationCredits {
    major: number;
    liberal: number;
    total: number;
    averageGrade?: number;
}

interface GraduationExtra {
    [key: string]: boolean;
}

interface Course {
    code: string;
    name: string;
    credit: number;
    type: string;
    year?: number;
}

export default function Profile() {
    const { user } = useAuth();
    const [student, setStudent] = useState<GraduationStudent | null>(null);
    const [credits, setCredits] = useState<GraduationCredits | null>(null);
    const [requiredCourses, setRequiredCourses] = useState<Course[]>([]);
    const [extra, setExtra] = useState<GraduationExtra>({});
    const [saveStatus, setSaveStatus] = useState('');
    const [open, setOpen] = useState(false);
    const [profileImg, setProfileImg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [backendConnected, setBackendConnected] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const loadDataFromBackend = async () => {
        setLoading(true);
        setError(null);

        try {
            // 프로필 정보 조회 
            const profileData = await apiService.getProfile();
            console.log('백엔드 프로필 데이터:', profileData);

            if (profileData) {
                setStudent({
                    id: profileData.studentId || '',
                    name: profileData.name || '정보 없음',
                    dept: profileData.major || '',
                    curriculumYear: profileData.grade || 1
                });
                setBackendConnected(true);
            }

            // 학점 요약 조회
            try {
                const summary = await apiService.getSummary();
                setCredits({
                    major: summary.majorCredits,
                    liberal: summary.liberalCredits,
                    total: summary.totalCredits,
                    averageGrade: summary.averageGrade
                });
                console.log('백엔드 학점 요약 데이터:', summary);
            } catch (summaryError) {
                console.warn('학점 요약 조회 실패:', summaryError);
            }

            // 졸업 요건 조회
            try {
                const res = await apiClient.graduation.getStatus();
                console.log('졸업 요건 데이터:', res);

                if (res?.success && res.data) {
                const { disqualifications = [], flags, pass } = res.data;

                setCredits(prev => ({
                    major: pass.major.actual,
                    liberal: pass.liberal.actual,
                    total: pass.total.actual,
                    averageGrade: prev?.averageGrade
                }));

                setRequiredThresholds({
                    majorRequired: pass.major.threshold,
                    liberalRequired: pass.liberal.threshold,
                    totalRequired: pass.total.threshold
                });

                const english = flags?.englishRequirementMet ?? !disqualifications.includes('어학자격 미취득');
                const internship = flags?.internshipCompleted ?? !disqualifications.includes('현장실무교과 미이수');
                const capstone = flags?.capstoneCompleted ?? !disqualifications.includes('종합설계 미이수');
                setExtra({ english, internship, capstone });
            }
            } catch (e) {
                console.warn('졸업 정보 조회 실패:', e);
            }

            // 필수과목 조회
            try {
            const requiredData = await apiClient.graduation.getRequired();
            console.log('백엔드 필수과목 데이터:', requiredData);

            if (requiredData?.success && requiredData.data?.missing) {
                const seen = new Set<string>();
                const courses = requiredData.data.missing
                .map((course: any) => ({
                    code: course.courseCode || course.code,
                    name: course.courseName || course.name,
                    credit: course.credits || course.credit || 3,
                    type: course.category || '필수'
                }))
                .filter((course: any) => {
                    if (seen.has(course.code)) return false;
                    seen.add(course.code);
                    return true;
                });

                setRequiredCourses(courses);
            }
            } catch (requiredError) {
            console.warn('필수과목 정보 조회 실패:', requiredError);
            }

        } catch (err) {
            console.error('백엔드 연결 실패:', err);
            setError(`백엔드 연결 실패: ${err}`);
            setBackendConnected(false);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        loadDataFromBackend();
    };

    useEffect(() => {
        loadDataFromBackend();
    }, []);

    const handleProfileImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && user?.email) {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    setProfileImg(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const completedCodes = requiredCourses.map(c => c.code);

    const [requiredThresholds, setRequiredThresholds] = useState({
        totalRequired: 130,
        majorRequired: 69,
        liberalRequired: 37,
    });

    const total = credits?.total || 0;
    const major = credits?.major || 0;
    const liberal = credits?.liberal || 0;
    const completionRate = Math.round((total / requiredThresholds.totalRequired) * 100);

    const handleSave = async () => {
        setLoading(true);
        try {
            const updates = {
                username: student?.name,
                major: student?.dept,
                phone: ''
            };

            const result = await apiService.updateProfile(updates);
            console.log('백엔드 저장 성공:', result);
            setSaveStatus('저장되었습니다.');
        } catch (err) {
            console.error('백엔드 저장 실패:', err);
            setSaveStatus('저장에 실패했습니다.');
        } finally {
            setLoading(false);
            setTimeout(() => setSaveStatus(''), 2000);
        }
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setTimeout(() => loadDataFromBackend(), 300);
    };

    return (
        <Box maxWidth={900} mx="auto" px={2} py={4}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    마이페이지 (졸업 현황)
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                        variant="outlined" 
                        startIcon={<Refresh />} 
                        onClick={handleRefresh}
                        disabled={loading}
                        sx={{ minWidth: 120 }}
                    >
                        {loading ? <CircularProgress size={20} /> : '새로고침'}
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleOpen} sx={{ minWidth: 180 }}>
                        졸업관리 시작하기
                    </Button>
                </Box>
            </Box>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogContent sx={{ p: 0 }}>
                    <Graduation />
                </DialogContent>
            </Dialog>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ p: 3, mb: 2, textAlign: 'center' }}>
                        <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, cursor: 'pointer' }} onClick={handleAvatarClick}>
                            {profileImg ? (
                                <img src={profileImg} alt="프로필" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            ) : (
                                <Person fontSize="large" />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleProfileImgChange}
                            />
                        </Avatar>
                        <Typography variant="h6" gutterBottom>
                            학적 정보
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {loading ? (
                            <CircularProgress size={24} />
                        ) : (
                            <>
                                <Typography variant="subtitle1">
                                    <b>{student?.name || '정보 없음'}</b>
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    학번: {student?.id || '-'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    학과: {student?.dept || '-'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    학년: {student?.curriculumYear || '-'}
                                </Typography>
                            </>
                        )}
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Card sx={{ p: 3, mb: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <School color="primary" /> 
                            학점 현황
                            {loading && <CircularProgress size={16} />}
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="subtitle2">총 이수학점</Typography>
                                <Typography variant="h5" fontWeight="bold">{total}/{requiredThresholds.totalRequired}</Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min((total / requiredThresholds.totalRequired) * 100, 100)}
                                    color="primary"
                                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                                />
                                <Typography variant="caption" color="text.secondary">{completionRate}%</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="subtitle2">전공 학점</Typography>
                                <Typography variant="h5" fontWeight="bold">{major}/{requiredThresholds.majorRequired}</Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min((major / requiredThresholds.majorRequired) * 100, 100)}
                                    color="secondary"
                                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="subtitle2">교양 학점</Typography>
                                <Typography variant="h5" fontWeight="bold">{liberal}/{requiredThresholds.liberalRequired}</Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min((liberal / requiredThresholds.liberalRequired) * 100, 100)}
                                    color="success"
                                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="subtitle2">평균 평점</Typography>
                                <Typography variant="h5" fontWeight="bold">
                                    {`${credits?.averageGrade ? Number(credits.averageGrade).toFixed(2) : '0'}/4.5`}
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={credits?.averageGrade ? (Number(credits.averageGrade) / 4.5) * 100 : 0}
                                    color="info"
                                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                                />
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card sx={{ p: 3, mb: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AssignmentTurnedIn color="primary" /> 
                            필수 과목 미이수 현황
                            {loading && <CircularProgress size={16} />}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {loading ? (
                                <CircularProgress size={24} />
                            ) : requiredCourses.length === 0 ? (
                                <Typography color="text.secondary">
                                    필수 과목 정보를 불러올 수 없습니다.
                                </Typography>
                            ) : (
                                requiredCourses.map(course => (
                                <Tooltip key={course.code} title={course.name} arrow>
                                    <Chip
                                    label={`${course.name} (${course.credit}학점)`}
                                    color="default"
                                    icon={<Warning />}
                                    variant="outlined"
                                    />
                                </Tooltip>
                                ))
                            )}
                        </Box>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card sx={{ p: 3, mb: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Info color="primary" /> 
                            기타 졸업요건
                        </Typography>
                        <Grid container spacing={2}>
                            {[
                                { key: 'capstone', label: '졸업작품(종합설계) 이수' },
                                { key: 'english', label: '공인어학성적 요건 충족' },
                                { key: 'internship', label: '현장실습/실무 경험 이수' }
                            ].map(item => (
                                <Grid item xs={12} sm={4} key={item.key}>
                                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography variant="subtitle1">{item.label}</Typography>
                                        {extra[item.key] ? (
                                            <CheckCircle color="success" />
                                        ) : (
                                            <Warning color="warning" />
                                        )}
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Edit />}
                            onClick={handleSave}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={20} /> : '저장'}
                        </Button>
                        {saveStatus && (
                            <Typography color="success.main" sx={{ alignSelf: 'center' }}>
                                {saveStatus}
                            </Typography>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}