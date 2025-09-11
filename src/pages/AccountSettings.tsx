// src/pages/AccountSettings.tsx

import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, Button, MenuItem, Alert, Dialog, DialogTitle, 
  DialogContent, DialogActions, IconButton, Grid, Select, FormControl, InputLabel,
  CircularProgress, Divider, Chip
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/SeparatedDataContext';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { apiService } from '../services/ApiService';
import { PreferredProfessor } from '../types/professor';
import { professorService } from '@/services/ProfessorService';

const grades = [1, 2, 3, 4, 5];
const semesters = [1, 2];

// 선택 가능 교수 목록
const availableProfessors = [
  { id: 115, name: '공기석' },
  { id: 145, name: '김영곤' },
  { id: 108, name: '나보균' },
  { id: 120, name: '노영주' },
  { id: 101, name: '민정환' }, 
  { id: 100, name: '박경원' },
  { id: 127, name: '박성호' },
  { id: 114, name: '박정민' },
  { id: 111, name: '방영철' },
  { id: 109, name: '배유석' },
  { id: 104, name: '서대영' },
  { id: 105, name: '오세춘' },
  { id: 106, name: '이동훈' },
  { id: 126, name: '이보경' },
  { id: 124, name: '이상호' },
  { id: 28, name: '이수길' },
  { id: 107, name: '이정준' },
  { id: 137, name: '이진호' },
  { id: 116, name: '전광일' },
  { id: 128, name: '정성택' },
  { id: 118, name: '정의훈' },
  { id: 117, name: '최우진' },
  { id: 125, name: '최종필' },
  { id: 121, name: '최진구' },
  { id: 401, name: '하재운' },
  { id: 119, name: '한경숙' },
  { id: 130, name: '한익주' },
  { id: 102, name: '허훈식' }
];

interface AccountSettingsProps {
  open: boolean;
  onClose: () => void;
}

interface ProfileForm {
  name: string;
  studentId: string;
  major: string;
  grade: number;
  semester: number;
  phone: string;
  completedCredits: number;
  career: string;
  industry: string;
  remainingSemesters: number;
  maxCreditsPerTerm: number;
  enrollmentYear: number | null;
  graduationYear: number | null;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ open, onClose }) => {
  const { user } = useAuth();
  const [form, setForm] = useState<ProfileForm>({
    name: '',
    studentId: '',
    major: '',
    grade: 1,
    semester: 1,
    phone: '',
    completedCredits: 0,
    career: '',
    industry: '',
    remainingSemesters: 0,
    maxCreditsPerTerm: 18,
    enrollmentYear: null,
    graduationYear: null
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [selectedProfessors, setSelectedProfessors] = useState<PreferredProfessor[]>([]);
  const [initialPreferred, setInitialPreferred] = useState<PreferredProfessor[]>([]);
  
  // 프로필 데이터 로드
  const loadProfileFromBackend = async () => {
    try {
      setInitialLoading(true);
      const profile = await apiService.getProfile();
      
      if (profile) {
        setForm({
          name: profile.name || '',
          studentId: profile.studentId || '',
          major: profile.major || '',
          grade: profile.grade || 1,
          semester: profile.semester || 1,
          phone: profile.phone || '',
          completedCredits: profile.completedCredits || 0,
          career: profile.career || '',
          industry: profile.industry || '',
          remainingSemesters: profile.remainingSemesters || 0,
          maxCreditsPerTerm: profile.maxCreditsPerTerm || 18,
          enrollmentYear: profile.enrollmentYear || null,
          graduationYear: profile.graduationYear || null
        });
      }
    } catch (err: any) {
      console.error('프로필 로드 실패:', err);
      setError('프로필 정보를 불러오는데 실패했습니다.');
    } finally {
      setInitialLoading(false);
    }
  };

  const loadPreferredProfessors = async () => {
    try {
        const preferred = await professorService.getPreferredProfessors();
        setSelectedProfessors(preferred);
        setInitialPreferred(preferred);
    } catch (err) {
        console.error('선호교수 불러오기 실패:', err);
    }
  };

  useEffect(() => {
    if (open) {
      loadProfileFromBackend();
      loadPreferredProfessors();
      setEditMode(false);
      setError('');
      setSuccess('');
    }
  }, [open]);

  const handleChange = (field: keyof ProfileForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleProfessorToggle = (professorId: number) => {
    setSelectedProfessors(prev => {
        const exists = prev.find(p => p.professor_id === professorId);
        if (exists) {
          return prev.filter(p => p.professor_id !== professorId);
        } else {
          const prof = availableProfessors.find(p => p.id === professorId);
          return prof
            ? [...prev, { preferred_id: 0, professor_id: prof.id, name: prof.name, lecture_count: 0 }]
            : prev;
        }
    });
  };

  const handleSave = async () => {
    if (!user?.email) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
        const toAdd = selectedProfessors.filter(
          p => !initialPreferred.some(ip => ip.professor_id === p.professor_id)
        );
        const toRemove = initialPreferred.filter(
          ip => !selectedProfessors.some(p => p.professor_id === ip.professor_id)
        );

        for (const p of toAdd) {
          await professorService.addPreferredProfessor(p.professor_id);
        }
        for (const ip of toRemove) {
          await professorService.removePreferredProfessor(ip.preferred_id);
        }

        // 프로필 저장
        await apiService.updateProfile({
        name: form.name,
        studentId: form.studentId,
        major: form.major,
        grade: form.grade,
        semester: form.semester,
        phone: form.phone,
        completedCredits: form.completedCredits,
        career: form.career,
        industry: form.industry,
        remainingSemesters: form.remainingSemesters,
        maxCreditsPerTerm: form.maxCreditsPerTerm,
        enrollmentYear: form.enrollmentYear || undefined,
        graduationYear: form.graduationYear || undefined
        });

        setSuccess('프로필이 성공적으로 저장되었습니다!');
        setEditMode(false);
        apiService.clearProfileCache();
        setInitialPreferred(selectedProfessors);
    } catch (error: any) {
        console.error('프로필 저장 실패:', error);
        setError(error.message || '저장에 실패했습니다.');
    } finally {
        setLoading(false);
    }
  };


  const handleCancel = () => {
    loadProfileFromBackend();
    setEditMode(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, fontSize: 22, display: 'flex', alignItems: 'center', gap: 1 }}>
          계정 설정
          {!editMode && !initialLoading && (
            <IconButton size="small" onClick={() => setEditMode(true)} sx={{ ml: 1 }}>
              <EditIcon fontSize="small" />
            </IconButton>
          )}
        </DialogTitle>
        
        <DialogContent>
          {initialLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                  {success}
                </Alert>
              )}

              {/* 기본 정보 */}
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                기본 정보
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography color="text.secondary" fontWeight={700} sx={{ mb: 1 }}>
                    이메일
                  </Typography>
                  <Typography>{user?.email || '-'}</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="이름"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    disabled={!editMode || loading}
                    fullWidth
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="학번"
                    value={form.studentId}
                    disabled
                    fullWidth
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="전공"
                    value={form.major}
                    disabled
                    fullWidth
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>학년</InputLabel>
                    <Select
                      value={form.grade}
                      label="학년"
                      onChange={(e) => handleChange('grade', e.target.value)}
                      disabled={!editMode || loading}
                    >
                      {grades.map(grade => (
                        <MenuItem key={grade} value={grade}>{grade}학년</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>학기</InputLabel>
                    <Select
                      value={form.semester}
                      label="학기"
                      onChange={(e) => handleChange('semester', e.target.value)}
                      disabled={!editMode || loading}
                    >
                      {semesters.map(semester => (
                        <MenuItem key={semester} value={semester}>{semester}학기</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="연락처"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    disabled={!editMode || loading}
                    fullWidth
                    size="small"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* 선호교수 설정 */}
                <Typography variant="h6" gutterBottom>
                    선호 교수
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    시간표 생성 시 선택된 교수님의 강의가 우선적으로 배정됩니다.
                </Typography>

                {editMode ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2 }}>
                    {availableProfessors.map(professor => (
                    <Chip
                        key={professor.id}
                        label={professor.name}
                        color={selectedProfessors.some(p => p.professor_id === professor.id) ? 'primary' : 'default'}
                        variant={selectedProfessors.some(p => p.professor_id === professor.id) ? 'filled' : 'outlined'}
                        onClick={() => handleProfessorToggle(professor.id)}
                        sx={{ cursor: 'pointer', fontWeight: 600 }}
                    />
                    ))}
                </Box>
                ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2 }}>
                    {initialPreferred.length > 0 ? (
                    initialPreferred.map(p => {
                        const professor = availableProfessors.find(ap => ap.id === p.professor_id);
                        return professor ? (
                        <Chip
                            key={p.professor_id}
                            label={p.name}
                            color="primary"
                            variant="filled"
                        />
                        ) : null;
                    })
                    ) : (
                    <Typography variant="body2" color="text.secondary">
                        설정된 교수가 없습니다.
                    </Typography>
                    )}
                </Box>
                )}
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          {editMode ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                onClick={handleCancel}
                disabled={loading}
                startIcon={<CancelIcon />}
              >
                취소
              </Button>
              <Button
                onClick={handleSave}
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
              >
                {loading ? '저장 중...' : '저장'}
              </Button>
            </Box>
          ) : (
            <Button onClick={onClose}>
              닫기
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default AccountSettings;