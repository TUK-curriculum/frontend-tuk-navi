import React, { useState, useMemo } from 'react';
import { Box, Typography, Card, Grid, Chip, Button, TextField, FormControl, InputLabel, Select, MenuItem, useTheme, IconButton, Tooltip, CircularProgress, Alert, SelectChangeEvent } from '@mui/material';
import { AddCircle, Edit, Delete, School } from '@mui/icons-material';
import GlassCard from '../components/common/GlassCard';
import { useAuth } from '../contexts/AuthContext';
import { courseService } from '../services/CourseService';
import { graduationService } from '../services/GraduationService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Course } from '../types/course';
import { CourseCreateDTO, CourseUpdateDTO } from '../repositories/CourseRepository';
import { RequiredMissing } from '@/repositories/GraduationRepository';

const CompletedCourses: React.FC = () => {
    const theme = useTheme();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const [courseForm, setCourseForm] = useState<Partial<CourseCreateDTO>>({
        name: '', credits: 3, type: 'GR',
    });
    const [editId, setEditId] = useState<number | null>(null);
    const courseTypes = ['전공필수', '전공선택', '교양필수', '교양선택', '계열기초'];

    // Query for completed courses
    const { data: completedCourses = [], isLoading: isLoadingCompleted, error: errorCompleted } = useQuery<Course[]>({
        queryKey: ['completedCourses', user?.email],
        queryFn: () => courseService.getCompletedCourses(user!.id!),
        enabled: !!user?.email,
    });

    // Query for graduation requirement courses (all selectable courses)
    const { data: requirementData, isLoading: isLoadingRequirements, error: errorRequirements } =
        useQuery<RequiredMissing>({
            queryKey: ['graduationRequirements'],
            queryFn: () => graduationService.getRequirements(),
            staleTime: Infinity,
    })
    const requirementCourses = requirementData?.missing ?? [];

    // Mutations
    const addMutation = useMutation({
        mutationFn: (newCourse: CourseCreateDTO) => courseService.createCourse(newCourse),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['completedCourses', user?.email] });
            setCourseForm({ name: '', credits: 3, type: 'GR' });
        },
    });

    const updateMutation = useMutation({
        mutationFn: (updatedCourse: CourseUpdateDTO) =>
            courseService.updateCourse(updatedCourse.id, updatedCourse),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['completedCourses', user?.email] });
            setEditId(null);
            setCourseForm({ name: '', credits: 3, type: 'GR' });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (courseId: number) => courseService.deleteCourse(courseId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['completedCourses', user?.email] });
        },
    });

    // Memoize the yearSemesterMap to avoid re-computation on every render
    const yearSemesterMap = useMemo(() => {
        const map: { [key: string]: RequiredMissing["missing"] } = {};
        for (let year = 1; year <= 4; year++) {
            for (let sem = 1; sem <= 2; sem++) {
                const key = `${year}-${sem}`;
                map[key] = requirementCourses.filter(
                    (c) => (c as any).year === year && (c as any).semester === sem
                );
            }
        }
        return map;
    }, [requirementCourses]);

    const handleAddOrEditCourse = () => {
        if (!courseForm.name || !courseForm.credits) return;
        if (editId !== null) {
            const payload: CourseUpdateDTO = { ...courseForm, id: editId };
            updateMutation.mutate(payload)
        } else {
            const payload: CourseCreateDTO = {
                name: courseForm.name!,
                credits: courseForm.credits!,
                type: courseForm.type as any,
                day: courseForm.day as any,
                startPeriod: courseForm.startPeriod!,
                endPeriod: courseForm.endPeriod!,
                room: courseForm.room!,
                code: courseForm.code!,
                instructor: courseForm.instructor!
            };
            addMutation.mutate(payload);
        }
    };

    const handleAddAllCourses = (coursesToAdd: typeof requirementCourses) => {
        coursesToAdd.forEach(c => addMutation.mutate(mapRequirementToDTO(c)));
    };

    const mapRequirementToDTO = (req: { courseCode: string; name: string; category: string }): CourseCreateDTO => ({
        name: req.name,
        code: req.courseCode,
        type: req.category as Course['type'],
        credits: 3,
        instructor: '',
        room: '',
        day: undefined,
        startPeriod: undefined,
        endPeriod: undefined,
    });

    const handleAddYearSemesterCourses = (year: number, semester: number, allCourses: typeof requirementCourses) => {
        const courses = allCourses.filter(c => (c as any).year === year && (c as any).semester === semester);
        const existing = new Set(completedCourses.map(c => c.name + '_' + c.type));
        const toAdd = courses.filter(c => !existing.has(c.name + '_' + c.category));
        toAdd.forEach(c => addMutation.mutate(mapRequirementToDTO(c)));
    };

    const handleEditCourse = (course: Course) => {
        setEditId(course.id);
        setCourseForm({
            name: course.name,
            code: course.code,
            type: course.type,
            credits: course.credits,
            instructor: course.instructor,
            room: course.room,
            day: course.day,
            startPeriod: course.startPeriod,
            endPeriod: course.endPeriod,
        });
    };

    const handleDeleteCourse = (courseId: number) => {
        deleteMutation.mutate(courseId);
    };

    const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCourseForm(prev => ({
            ...prev,
            [name!]: name === 'credits' ? Number(value) : value,
        }));
    };

    const handleSelectChange = (e: SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        setCourseForm(prev => ({ ...prev, [name!]: value }));
    };

    const handleCourseSelect = (e: SelectChangeEvent<string>) => {
        const selected = requirementCourses.find(c => c.name === e.target.value);
        if (selected) {
            setCourseForm({
            name: selected.name,
            code: selected.courseCode,
            type: selected.category as any, // Course['type']으로 캐스팅
            credits: 3, // 기본값
            instructor: '',
            room: '',
            day: undefined,
            startPeriod: undefined,
            endPeriod: undefined,
            });
        }
    };

    const handleCourseFormChange = (
        e: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent
    ) => {
        const { name, value } = e.target;
        setCourseForm(prev => ({
            ...prev,
            [name!]: name === 'credits' ? Number(value) : value,
        }));
    };

    if (isLoadingCompleted || isLoadingRequirements) return <CircularProgress />;
    if (errorCompleted || errorRequirements) return <Alert severity="error">{(errorCompleted as any)?.message || (errorRequirements as any)?.message}</Alert>;

    return (
        <Box sx={{ pt: 6, pb: 6, minHeight: '100vh', background: 'linear-gradient(120deg, #f0f6ff 0%, #f7f0ff 100%)' }}>
            <Box sx={{ maxWidth: 1100, mx: 'auto', p: 3 }}>
                <Typography variant="h4" fontWeight={900} sx={{ mb: 3, color: theme.palette.primary.main, letterSpacing: 1 }}>
                    <School sx={{ mr: 1, fontSize: 36, verticalAlign: 'middle' }} /> 이수과목 관리
                </Typography>
                <GlassCard sx={{ mb: 4, borderRadius: 4, boxShadow: 4, p: 0 }}>
                    <Box sx={{ p: { xs: 3, md: 5 } }}>
                        <Button variant="contained" color="primary" sx={{ mb: 3, fontWeight: 700, fontSize: 18, borderRadius: 3 }} onClick={() => handleAddAllCourses(requirementCourses)} startIcon={<AddCircle />}>
                            모든 졸업요건 과목 전체 자동 추가
                        </Button>
                        {[1, 2, 3, 4].map(year => (
                            [1, 2].map(semester => {
                                const key = `${year}-${semester}`;
                                return (
                                    <Box key={key} sx={{ mb: 5, mt: 3, p: 2, borderRadius: 4, background: 'rgba(255,255,255,0.85)', boxShadow: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Typography variant="h6" fontWeight={800} sx={{ color: theme.palette.secondary.main, mr: 2 }}>{year}학년 {semester}학기</Typography>
                                            <Button size="small" variant="outlined" color="secondary" sx={{ fontWeight: 700, borderRadius: 2 }} onClick={() => handleAddYearSemesterCourses(year, semester, requirementCourses)}>
                                                {year}학년 {semester}학기 전체 추가
                                            </Button>
                                        </Box>
                                        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                            <Grid item xs={12} sm={4}>
                                                <FormControl fullWidth>
                                                    <InputLabel>과목 선택</InputLabel>
                                                    <Select
                                                        value={courseForm.name}
                                                        label="과목 선택"
                                                        onChange={handleCourseSelect}
                                                    >
                                                        <MenuItem value=""><em>직접 입력</em></MenuItem>
                                                        {(yearSemesterMap[key] || []).map((c, idx) => (
                                                            <MenuItem key={c.name + '_' + c.category + '_' + idx} value={c.name}>
                                                                {c.name} (3학점, {c.category})
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={6} sm={3}>
                                                <TextField
                                                    fullWidth
                                                    label="학점"
                                                    name="credits"
                                                    type="number"
                                                    value={courseForm.credits}
                                                    onChange={handleTextFieldChange}
                                                    inputProps={{ min: 1, max: 6 }}
                                                />
                                            </Grid>
                                            <Grid item xs={6} sm={3}>
                                                <FormControl fullWidth>
                                                    <InputLabel>구분</InputLabel>
                                                    <Select
                                                        name="type"
                                                        value={courseForm.type}
                                                        label="구분"
                                                        onChange={handleCourseFormChange}
                                                    >
                                                        {courseTypes.map(type => (
                                                            <MenuItem key={type} value={type}>{type}</MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} sm={2}>
                                                <Button
                                                    fullWidth
                                                    variant={editId !== null ? 'contained' : 'outlined'}
                                                    color="primary"
                                                    onClick={handleAddOrEditCourse}
                                                    sx={{ height: '100%' }}
                                                >
                                                    {editId !== null ? '수정' : '추가'}
                                                </Button>
                                            </Grid>
                                        </Grid>
                                        {/* 학년-학기별 이수과목 리스트 */}
                                        <Box sx={{ mt: 1 }}>
                                            {yearSemesterMap[key]?.length === 0 ? (
                                                <Typography color="text.secondary">아직 등록된 {year}학년 {semester}학기 이수과목이 없습니다.</Typography>
                                            ) : (
                                                <Grid container spacing={2}>
                                                    {(yearSemesterMap[key] || []).map((c, idx) => {
                                                        const dto = mapRequirementToDTO(c);

                                                        return (
                                                            <Grid item xs={12} sm={6} md={4} key={dto.name + '_' + dto.type + '_' + idx}>
                                                                <Card variant="outlined" sx={{ p: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, background: '#f8fafc', boxShadow: 1 }}>
                                                                    <Box sx={{ flexGrow: 1 }}>
                                                                        <Typography fontWeight={700} sx={{ fontSize: 18, color: theme.palette.primary.dark }}>{dto.name}</Typography>
                                                                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                                                            <Chip label={dto.type} color="info" size="small" sx={{ fontWeight: 700 }} />
                                                                            <Chip label={`${dto.credits}학점`} color="success" size="small" />
                                                                        </Box>
                                                                    </Box>
                                                                    <Tooltip title="수정 (추가된 후만 가능)">
                                                                        <span>
                                                                            <IconButton color="info" disabled>
                                                                                <Edit />
                                                                            </IconButton>
                                                                        </span>
                                                                    </Tooltip>
                                                                    <Tooltip title="삭제 (추가된 후만 가능)">
                                                                        <span>
                                                                            <IconButton color="error" disabled>
                                                                                <Delete />
                                                                            </IconButton>
                                                                        </span>
                                                                    </Tooltip>
                                                                </Card>
                                                            </Grid>
                                                        );
                                                    })}
                                                </Grid>
                                            )}
                                        </Box>
                                    </Box>
                                );
                            })
                        ))}
                    </Box>
                </GlassCard>
            </Box>
        </Box>
    );
};

export default CompletedCourses; 