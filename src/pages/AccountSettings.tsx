import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Chip, MenuItem, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/SeparatedDataContext';
import EditIcon from '@mui/icons-material/Edit';
import InterestSelection from './InterestSelection';

const grades = ['1학년', '2학년', '3학년', '4학년', '졸업생'];
const interestsList = [
    'AI/머신러닝', '데이터분석', '정보보안', '웹개발', '모바일앱개발',
    '게임개발', '클라우드컴퓨팅', '블록체인', 'IoT', '로봇공학',
    '사이버보안', '네트워크', '데이터베이스', 'UI/UX디자인', '프로젝트관리'
];

interface AccountSettingsProps {
    open: boolean;
    onClose: () => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ open, onClose }) => {
    const { user } = useAuth();
    const { userData, updateUserField } = useData();
    const [form, setForm] = useState({
        nickname: '', name: '', studentId: '', major: '', grade: '', interests: [] as string[], enrollmentYear: '', graduationYear: '', phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        if (userData?.profile) {
            console.log('📝 [AccountSettings] Loading profile data:', userData.profile);
            setForm({
                nickname: userData.profile.nickname || '',
                name: userData.profile.name || '',
                studentId: userData.profile.studentId || '',
                major: userData.profile.major || '',
                grade: userData.profile.grade ? String(userData.profile.grade) : '',
                interests: userData.profile.interests || [],
                enrollmentYear: userData.profile.enrollmentYear || '',
                graduationYear: userData.profile.graduationYear || '',
                phone: userData.profile.phone || ''
            });
        } else {
            console.log('⚠️ [AccountSettings] No profile data available');
        }
        setNewPassword('');
        setEditMode(false);
    }, [userData, open]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name: 'enrollmentDate' | 'graduationDate', value: Date | null) => {
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleInterestToggle = (interest: string) => {
        setForm(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    };

    const handleSave = async () => {
        if (!user?.email || !userData) return;
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // 백엔드에 프로필 업데이트
            const { apiService } = await import('../services/ApiService');
            const backendUpdates: any = {};

            if (form.name !== userData.profile.name) backendUpdates.username = form.name;
            if (form.phone !== userData.profile.phone) backendUpdates.phone = form.phone;
            if (form.major !== userData.profile.major) backendUpdates.major = form.major;

            if (Object.keys(backendUpdates).length > 0) {
                console.log('📡 [AccountSettings] Updating backend profile:', backendUpdates);
                await apiService.updateProfile(backendUpdates);
            }

            // 로컬 스토리지 프로필 업데이트
            const updatedProfile = {
                ...userData.profile,
                ...form,
                enrollmentYear: form.enrollmentYear,
                graduationYear: form.graduationYear,
                interests: form.interests,
                name: form.name,
                phone: form.phone,
            };
            updateUserField('profile', updatedProfile);

            // 비밀번호 변경 처리
            if (newPassword.trim()) {
                const updatedSettings = {
                    ...userData.settings,
                    password: newPassword
                };
                updateUserField('settings', updatedSettings);
            }

            setSuccess('계정 정보가 저장되었습니다!');
            setEditMode(false);
        } catch (error) {
            setError('저장에 실패했습니다.');
            console.error('계정 정보 저장 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (userData?.profile) {
            setForm({
                nickname: userData.profile.nickname || '',
                name: userData.profile.name || '',
                studentId: userData.profile.studentId || '',
                major: userData.profile.major || '',
                grade: userData.profile.grade || '',
                interests: userData.profile.interests || [],
                enrollmentYear: userData.profile.enrollmentYear || '',
                graduationYear: userData.profile.graduationYear || '',
                phone: userData.profile.phone || ''
            });
        }
        setEditMode(false);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 800, fontSize: 22, display: 'flex', alignItems: 'center', gap: 1 }}>
                    계정 설정
                    {!editMode && (
                        <IconButton size="small" onClick={() => setEditMode(true)} sx={{ ml: 1 }}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    )}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 2 }}>
                        <Typography color="text.secondary" fontWeight={700}>아이디(이메일)</Typography>
                        <Typography>{user?.email || '-'}</Typography>
                    </Box>
                    {!editMode ? (
                        <Box sx={{ p: 1 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={6}><Typography color="text.secondary">닉네임</Typography><Typography>{form.nickname || '-'}</Typography></Grid>
                                <Grid item xs={6}><Typography color="text.secondary">이름</Typography><Typography>{form.name || '-'}</Typography></Grid>
                                <Grid item xs={6}><Typography color="text.secondary">학번</Typography><Typography>{form.studentId || '-'}</Typography></Grid>
                                <Grid item xs={6}><Typography color="text.secondary">전공</Typography><Typography>{form.major || '-'}</Typography></Grid>
                                <Grid item xs={6}><Typography color="text.secondary">학년</Typography><Typography>{form.grade || '-'}</Typography></Grid>
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <Typography color="text.secondary">관심 분야</Typography>
                                        <IconButton
                                            size="small"
                                            onClick={() => setIsOnboardingModalOpen(true)}
                                            sx={{
                                                color: 'primary.main',
                                                '&:hover': {
                                                    backgroundColor: 'primary.main',
                                                    color: 'white'
                                                }
                                            }}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {form.interests.length === 0 ?
                                            <Typography color="text.disabled">-</Typography> :
                                            form.interests.map(i => <Chip key={i} label={i} size="small" />)
                                        }
                                    </Box>
                                </Grid>
                                <Grid item xs={6}><Typography color="text.secondary">입학년도</Typography><Typography>{form.enrollmentYear || '-'}</Typography></Grid>
                                <Grid item xs={6}><Typography color="text.secondary">졸업예정년도</Typography><Typography>{form.graduationYear || '-'}</Typography></Grid>
                                <Grid item xs={6}><Typography color="text.secondary">전화번호</Typography><Typography>{form.phone || '-'}</Typography></Grid>
                            </Grid>
                        </Box>
                    ) : (
                        <Box sx={{ p: 1 }}>
                            <TextField label="닉네임" name="nickname" value={form.nickname} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
                            <TextField
                                label="이름"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                fullWidth
                                sx={{
                                    mb: 2,
                                    '& .MuiInputBase-input.Mui-disabled': {
                                        WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                                    }
                                }}
                                disabled={true}
                                helperText="회원가입 시 입력한 정보입니다"
                            />
                            <TextField
                                label="학번"
                                name="studentId"
                                value={form.studentId}
                                onChange={handleChange}
                                fullWidth
                                sx={{
                                    mb: 2,
                                    '& .MuiInputBase-input.Mui-disabled': {
                                        WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                                    }
                                }}
                                disabled={true}
                                helperText="회원가입 시 입력한 정보입니다"
                            />
                            <TextField
                                label="전공"
                                name="major"
                                value={form.major}
                                onChange={handleChange}
                                fullWidth
                                sx={{
                                    mb: 2,
                                    '& .MuiInputBase-input.Mui-disabled': {
                                        WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                                    }
                                }}
                                disabled={true}
                                helperText="회원가입 시 입력한 정보입니다"
                            />
                            <TextField
                                select
                                label="학년"
                                name="grade"
                                value={form.grade}
                                onChange={handleChange}
                                fullWidth
                                sx={{
                                    mb: 2,
                                    '& .MuiInputBase-input.Mui-disabled': {
                                        WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                                    }
                                }}
                                disabled={true}
                                helperText="회원가입 시 입력한 정보입니다"
                            >
                                {grades.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                            </TextField>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" mb={1}>관심 분야</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {interestsList.map(interest => (
                                        <Chip
                                            key={interest}
                                            label={interest}
                                            color={form.interests.includes(interest) ? 'primary' : 'default'}
                                            onClick={() => handleInterestToggle(interest)}
                                            variant={form.interests.includes(interest) ? 'filled' : 'outlined'}
                                            sx={{ cursor: 'pointer' }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <TextField label="입학년도" name="enrollmentYear" type="number" value={form.enrollmentYear} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
                                <TextField label="졸업예정년도" name="graduationYear" type="number" value={form.graduationYear} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
                            </Box>
                            <TextField label="전화번호" name="phone" value={form.phone} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
                            <TextField label="새 비밀번호 (변경 시 입력)" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} fullWidth sx={{ mb: 2 }} />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    {!editMode ? (
                        <Button onClick={onClose} color="primary" variant="outlined">닫기</Button>
                    ) : (
                        <>
                            <Button onClick={handleCancel} color="inherit">취소</Button>
                            <Button onClick={handleSave} color="primary" variant="contained" disabled={loading}>{loading ? '저장 중...' : '저장하기'}</Button>
                        </>
                    )}
                </DialogActions>
                <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                    <Alert severity="success" sx={{ width: '100%' }}>{success}</Alert>
                </Snackbar>
                <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                    <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>
                </Snackbar>
            </Dialog>

            {/* 온보딩 편집 모달 */}
            {isOnboardingModalOpen && (
                <InterestSelection onClose={() => setIsOnboardingModalOpen(false)} />
            )}
        </LocalizationProvider>
    );
};

export default AccountSettings; 