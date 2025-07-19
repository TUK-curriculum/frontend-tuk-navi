import React, { useEffect, useState } from 'react';
import {
    Box, Card, Typography, Grid, LinearProgress, Chip, Divider, Button, Paper, Avatar, Tooltip, Dialog, DialogContent
} from '@mui/material';
import { School, AssignmentTurnedIn, CheckCircle, Warning, Edit, Info, Person } from '@mui/icons-material';
import Graduation from './Graduation';
import { useData } from '../contexts/SeparatedDataContext';
import { useAuth } from '../contexts/AuthContext';

// 데이터 타입 정의
interface GraduationStudent {
    id: string;
    name: string;
    dept: string;
    curriculumYear: number;
}

interface GraduationCredits {
    major: number;
    liberal: number;
    basic: number;
    total: number;
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
    const { userData, updateProfile } = useData();
    const [student, setStudent] = useState<GraduationStudent | null>(null);
    const [credits, setCredits] = useState<GraduationCredits | null>(null);
    const [requiredCourses, setRequiredCourses] = useState<Course[]>([]);
    const [extra, setExtra] = useState<GraduationExtra>({});
    const [saveStatus, setSaveStatus] = useState('');
    const [open, setOpen] = useState(false);
    const [profileImg, setProfileImg] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // 데이터 불러오기 함수
    const loadGraduationData = () => {
        const graduationInfo = userData?.graduationInfo;
        if (graduationInfo) {
            setCredits({
                major: graduationInfo.majorRequired,
                liberal: graduationInfo.generalRequired,
                basic: graduationInfo.generalElective,
                total: graduationInfo.totalCredits
            });
        }
        // 프로필 정보도 userData에서 가져오기
        if (userData?.profile) {
            setStudent({
                id: userData.profile.studentId,
                name: userData.profile.name,
                dept: userData.profile.major,
                curriculumYear: userData.profile.grade
            });
        }
    };

    // 실시간 데이터 업데이트 이벤트 리스너
    useEffect(() => {
        loadGraduationData();

        // 실시간 데이터 업데이트 이벤트 리스너 등록
        const handleDataUpdate = (event: CustomEvent) => {
            const updatedData = event.detail;
            setStudent(updatedData.graduationStudent || null);
            setCredits(updatedData.graduationCredits || null);
            setRequiredCourses(updatedData.graduationRequiredCourses || []);
            setExtra(updatedData.graduationExtra || {});
        };

        window.addEventListener('graduationDataUpdate', handleDataUpdate as EventListener);

        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener('graduationDataUpdate', handleDataUpdate as EventListener);
        };
    }, []);

    // 프로필 이미지 불러오기
    useEffect(() => {
        if (!user?.email) return;
        if (userData?.profile?.avatar) setProfileImg(userData.profile.avatar);
    }, [user?.email, userData?.profile?.avatar]);

    // 프로필 이미지 업로드
    const handleProfileImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && user?.email) {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    setProfileImg(reader.result);
                    updateProfile({ avatar: reader.result });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // 프로필 이미지 클릭 시 파일 선택
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    // 필수과목 이수 현황 계산
    const completedCodes = requiredCourses.map(c => c.code);

    // 졸업요건 진척도 계산
    const totalRequired = 130;
    const majorRequired = 69;
    const liberalRequired = 37;
    const total = credits?.total || 0;
    const major = credits?.major || 0;
    const liberal = credits?.liberal || 0;
    const basic = credits?.basic || 0;
    const completionRate = Math.round((total / totalRequired) * 100);

    // 저장(수정) 버튼
    const handleSave = () => {
        setSaveStatus('저장되었습니다!');
        setTimeout(() => setSaveStatus(''), 2000);
    };

    // 졸업관리 모달 열기/닫기
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        // 모달 닫힌 후 데이터 갱신 (이미 실시간 업데이트되므로 불필요하지만 안전을 위해)
        setTimeout(() => loadGraduationData(), 300);
    };

    return (
        <Box maxWidth={900} mx="auto" px={2} py={4}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    마이페이지 (졸업 현황)
                </Typography>
                <Button variant="contained" color="primary" onClick={handleOpen} sx={{ minWidth: 180 }}>
                    졸업관리 시작하기
                </Button>
            </Box>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogContent sx={{ p: 0 }}>
                    <Graduation />
                </DialogContent>
            </Dialog>

            <Grid container spacing={3}>
                {/* 학적 정보 */}
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
                        <Typography variant="h6" gutterBottom>학적 정보</Typography>
                        <Divider sx={{ mb: 2 }} />
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
                            교육과정년도: {student?.curriculumYear || '-'}
                        </Typography>
                    </Card>
                </Grid>

                {/* 학점 현황 */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ p: 3, mb: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <School color="primary" /> 학점 현황
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="subtitle2">총 이수학점</Typography>
                                <Typography variant="h5" fontWeight="bold">{total}/{totalRequired}</Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min((total / totalRequired) * 100, 100)}
                                    color="primary"
                                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                                />
                                <Typography variant="caption" color="text.secondary">{completionRate}%</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="subtitle2">전공 학점</Typography>
                                <Typography variant="h5" fontWeight="bold">{major}/{majorRequired}</Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min((major / majorRequired) * 100, 100)}
                                    color="secondary"
                                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="subtitle2">교양 학점</Typography>
                                <Typography variant="h5" fontWeight="bold">{liberal}/{liberalRequired}</Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min((liberal / liberalRequired) * 100, 100)}
                                    color="success"
                                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="subtitle2">기초/계열 학점</Typography>
                                <Typography variant="h5" fontWeight="bold">{basic}</Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={100}
                                    color="info"
                                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                                />
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>

                {/* 필수과목 이수 현황 */}
                <Grid item xs={12}>
                    <Card sx={{ p: 3, mb: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AssignmentTurnedIn color="primary" /> 필수과목 이수 현황
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {requiredCourses.length === 0 ? (
                                <Typography color="text.secondary">
                                    저장된 필수과목 정보가 없습니다. 졸업관리에서 과목을 선택해주세요.
                                </Typography>
                            ) : (
                                requiredCourses.map(course => {
                                    const completed = completedCodes.includes(course.code);
                                    return (
                                        <Tooltip key={course.code} title={course.name} arrow>
                                            <Chip
                                                label={`${course.name} (${course.credit}학점)`}
                                                color={completed ? 'success' : 'default'}
                                                icon={completed ? <CheckCircle sx={{ color: 'success.main' }} /> : <Warning sx={{ color: 'warning.main' }} />}
                                                variant={completed ? 'outlined' : 'outlined'}
                                                sx={{
                                                    fontWeight: completed ? 'bold' : undefined,
                                                    bgcolor: completed ? 'success.lighter' : 'background.paper',
                                                    color: completed ? 'success.main' : 'text.secondary',
                                                    borderColor: completed ? 'success.light' : 'grey.300',
                                                }}
                                            />
                                        </Tooltip>
                                    );
                                })
                            )}
                        </Box>
                    </Card>
                </Grid>

                {/* 기타 졸업요건 */}
                <Grid item xs={12}>
                    <Card sx={{ p: 3, mb: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Info color="primary" /> 기타 졸업요건
                        </Typography>
                        <Grid container spacing={2}>
                            {[
                                { key: 'capstone', label: '졸업작품(캡스톤디자인) 이수' },
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

                {/* 저장/수정 버튼 */}
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Edit />}
                            onClick={handleSave}
                        >
                            수정/저장
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
