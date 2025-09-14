import React, { useReducer, useState } from 'react';
import {
    Box, Card, Typography, Stepper, Step, StepLabel,
    Button, TextField, Grid, Switch, FormControlLabel,
    LinearProgress, Chip, Divider, Alert, Paper,
    Autocomplete, FormControl, InputLabel, Select, MenuItem,
    CircularProgress, IconButton
} from '@mui/material';
import {
    School, Assessment, TableChart, Psychology, BugReport,
    CheckCircle, Warning, Info, Refresh, Edit
} from '@mui/icons-material';
import courseCatalog from '../data/courseCatalog.json';
import { useData } from '../contexts/SeparatedDataContext';
import { useAuth } from '../contexts/AuthContext';
import { apiService, BackendGraduationStatus, BackendRecord } from '../services/ApiService';

// Course 타입은 store에서 import (full type)
import type { Course as StoreCourse } from '../stores/graduationStore';
import { mapRecordToCourse } from '@/utils/mapper';

// 타입 정의
interface GraduationState {
    step: number;
    id: number;
    name: string;
    dept: string;
    curriculumYear: number;
    major: number;
    liberal: number;
    searchTerm: string;
    filterType: string;
}

type GraduationAction =
    | { type: 'SET_FIELD'; field: keyof GraduationState; value: any }
    | { type: 'NEXT_STEP' }
    | { type: 'PREV_STEP' }
    | { type: 'RESET' };

const initialState: GraduationState = {
    step: 0,
    id: Date.now(),
    name: '',
    dept: '컴퓨터공학부',
    curriculumYear: 2025,
    major: 0,
    liberal: 0,
    searchTerm: '',
    filterType: '전체',
};

function reducer(state: GraduationState, action: GraduationAction): GraduationState {
    switch (action.type) {
        case 'SET_FIELD':
            return { ...state, [action.field]: action.value };
        case 'NEXT_STEP':
            return { ...state, step: state.step + 1 };
        case 'PREV_STEP':
            return { ...state, step: state.step - 1 };
        case 'RESET':
            return { ...initialState };
        default:
            return state;
    }
}

// 입력 검증 함수들
const validateStudentId = (id: number): boolean => {
    return /^\d{10}$/.test(String(id));
};

const validateName = (name: string): boolean => {
    return /^[가-힣a-zA-Z\s]+$/.test(name) && name.trim().length > 0;
};

const validateCurriculumYear = (year: number): boolean => {
    return year >= 2000 && year <= 2030;
};

const mapExtraForBackend = (extra: Record<string, boolean>) => ({
    capstoneCompleted: extra.capstone ?? false,
    englishRequirementMet: extra.english ?? false,
    internshipCompleted: extra.internship ?? false,
});

const mapDiagnosisForBackend = (diagnosis: any) => ({
    disqualifications: diagnosis.lackItems || [],
});


// Step1 컴포넌트 - 입력 검증 추가
interface Step1Props {
    id: number;
    name: string;
    dept: string;
    curriculumYear: number;
    onChange: (field: keyof GraduationState, value: any) => void;
}

function Step1({ id, name, dept, curriculumYear, onChange }: Step1Props) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    // 학번 입력 처리
    const handleStudentIdChange = (value: string) => {
        // 숫자만 입력 허용
        if (/^\d*$/.test(value) && value.length <= 10) {
            onChange('id', value);
            if (value.length === 10) {
                setErrors(prev => ({ ...prev, id: '' }));
            } else if (value.length > 0) {
                setErrors(prev => ({ ...prev, id: '' }));
            }
        }
    };

    // 이름 입력 처리
    const handleNameChange = (value: string) => {
        // 숫자나 특수문자가 포함된 경우 입력 차단
        if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
            return; // 입력을 허용하지 않음
        }

        // 한글, 영문, 공백만 허용
        onChange('name', value);

        // 입력 완료 후 검증
        if (value === '' || /^[가-힣a-zA-Z\s]+$/.test(value)) {
            setErrors(prev => ({ ...prev, name: '' }));
        } else {
            setErrors(prev => ({ ...prev, name: '한글, 영문, 공백만 입력 가능합니다.' }));
        }
    };

    // 입학년도도 입력 처리
    const handleCurriculumYearChange = (value: string) => {
        const numValue = parseInt(value);
        if (!isNaN(numValue)) {
            onChange('curriculumYear', numValue);
            if (numValue >= 2000 && numValue <= 2030) {
                setErrors(prev => ({ ...prev, curriculumYear: '' }));
            } else {
                setErrors(prev => ({ ...prev, curriculumYear: '' }));
            }
        }
    };

    return (
        <Card sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <School color="primary" /> 학적 정보
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="학번"
                        fullWidth
                        value={id}
                        onChange={e => handleStudentIdChange(e.target.value)}
                        placeholder="10자리 숫자 입력"
                        error={!!errors.id}
                        helperText={errors.id || '회원가입 시 입력한 정보입니다'}
                        disabled={true}
                        sx={{
                            '& .MuiInputBase-input.Mui-disabled': {
                                WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                            }
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="성명"
                        fullWidth
                        value={name}
                        onChange={e => handleNameChange(e.target.value)}
                        placeholder="한글 또는 영문 입력"
                        error={!!errors.name}
                        helperText={errors.name || '회원가입 시 입력한 정보입니다'}
                        disabled={true}
                        sx={{
                            '& .MuiInputBase-input.Mui-disabled': {
                                WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                            }
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Autocomplete
                        options={['컴퓨터공학부', '소프트웨어공학과', '인공지능학과']}
                        value={dept}
                        onChange={(_, v) => onChange('dept', v || '컴퓨터공학부')}
                        disabled={true}
                        renderInput={params =>
                            <TextField
                                {...params}
                                label="학과/전공"
                                fullWidth
                                helperText="회원가입 시 입력한 정보입니다"
                                sx={{
                                    '& .MuiInputBase-input.Mui-disabled': {
                                        WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                                    }
                                }}
                            />
                        }
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        type="number"
                        label="입학년도"
                        fullWidth
                        value={curriculumYear}
                        onChange={e => handleCurriculumYearChange(e.target.value)}
                        error={!!errors.curriculumYear}
                        helperText={errors.curriculumYear || ''}
                        inputProps={{ min: 2000, max: 2030 }}
                    />
                </Grid>
            </Grid>
        </Card>
    );
}

interface Step2Props {
    major: number;
    liberal: number;
}

function Step2({ major, liberal }: Step2Props) {
    const total = (major || 0) + (liberal || 0);

    const creditFields = [
        { key: 'major', label: '전공 학점', value: major, required: 69, color: 'secondary' },
        { key: 'liberal', label: '교양 학점', value: liberal, required: 37, color: 'success' },
    ];

    return (
        <Card sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assessment color="primary" /> 학점 현황
        </Typography>
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4} key="total">
            <TextField
                label="총 이수학점"
                fullWidth
                value={total}
                InputProps={{ readOnly: true }}
                helperText={`필수: 130학점`}
            />
            <Box mt={1}>
                <LinearProgress
                    variant="determinate"
                    value={Math.min((total / 130) * 100, 100)}
                    color="primary"
                    sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary">
                    {total}/130 ({Math.round((total / 130) * 100)}%)
                </Typography>
            </Box>
            </Grid>

            {creditFields.map(field => (
            <Grid item xs={12} sm={6} md={4} key={field.key}>
                <TextField
                    type="number"
                    label={field.label}
                    fullWidth
                    value={field.value}
                    InputProps={{ readOnly: true }}
                    helperText={`필수: ${field.required}학점`}
                />
                {field.required > 0 && (
                <Box mt={1}>
                    <LinearProgress
                        variant="determinate"
                        value={Math.min(((field.value || 0) / field.required) * 100, 100)}
                        color={field.color as any}
                        sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                        {field.value}/{field.required} (
                        {Math.round(((field.value || 0) / field.required) * 100)}%)
                    </Typography>
                </Box>
                )}
            </Grid>
            ))}
        </Grid>

        <Box mt={3}>
            <Typography variant="subtitle1" gutterBottom>전체 졸업 진척도</Typography>
            <LinearProgress
                variant="determinate"
                value={Math.min((total / 130) * 100, 100)}
                sx={{ height: 12, borderRadius: 6 }}
                color="primary"
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                총 {total}학점 / 130학점 ({Math.round((total / 130) * 100)}%)
            </Typography>
        </Box>
        </Card>
    );
}


interface Step3Props {
    completedRequired: StoreCourse[];
    missingRequired: StoreCourse[];
}

function Step3({ completedRequired, missingRequired }: Step3Props) {
    return (
        <Card sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TableChart color="primary" /> 필수 과목 현황
        </Typography>

        <Grid container spacing={2}>
            {/* 이수 과목 */}
            <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, minHeight: 300 }}>
                <Typography variant="subtitle2" gutterBottom>
                    ✅ 이수한 필수 과목 ({completedRequired.length}개)
                </Typography>
                <Divider sx={{ mb: 2 }} />
                    {completedRequired.length === 0 ? (
                <Typography color="text.secondary">아직 이수한 필수 과목이 없습니다.</Typography>
                ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {completedRequired.map((course) => (
                    <Chip
                        key={course.code}
                        label={`${course.name} (${course.credit}학점)`}
                        color="success"
                        variant="outlined"
                    />
                    ))}
                </Box>
                )}
            </Paper>
            </Grid>

            {/* 미이수 과목 */}
            <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, minHeight: 300 }}>
                <Typography variant="subtitle2" gutterBottom>
                    ❌ 미이수 필수 과목 ({missingRequired.length}개)
                </Typography>
                <Divider sx={{ mb: 2 }} />
                    {missingRequired.length === 0 ? (
                <Typography color="text.secondary">모든 필수 과목을 이수했습니다!</Typography>
                ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {missingRequired.map((course) => (
                    <Chip
                        key={course.code}
                        label={`${course.name} (${course.credit}학점)`}
                        color="error"
                        variant="outlined"
                    />
                    ))}
                </Box>
                )}
            </Paper>
            </Grid>
        </Grid>
        </Card>
    );
}

interface Step4Props {
    extra: Record<string, boolean>;
    setExtra: (extra: Record<string, boolean>) => void;
}

function Step4({ extra, setExtra }: Step4Props) {
    const items = [
        {
            key: 'capstone',
            label: '졸업작품(캡스톤디자인) 이수',
            description: '종합설계 1, 2를 모두 이수해야 합니다.',
            required: true
        },
        {
            key: 'english',
            label: '공인어학성적 요건 충족',
            description: 'TOEIC 550점 이상 또는 이에 준하는 성적이 필요합니다.',
            required: true
        },
        {
            key: 'internship',
            label: '현장실습/실무 경험 이수',
            description: '인턴십, 현장프로젝트 등 1개 이상 실습과목 이수가 권장됩니다.',
            required: false
        }
    ];

    return (
        <Card sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Psychology color="primary" /> 기타 요건
            </Typography>
            <Grid container spacing={2}>
                {items.map((item) => (
                    <Grid item xs={12} key={item.key}>
                        <Paper sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={extra[item.key]}
                                            onChange={e => setExtra({ ...extra, [item.key]: e.target.checked })}
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="body1" fontWeight="bold">
                                                {item.label}
                                                {item.required && <span style={{ color: 'red' }}> *</span>}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {item.description}
                                            </Typography>
                                        </Box>
                                    }
                                />
                                {extra[item.key] && (
                                    <CheckCircle color="success" />
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Card>
    );
}

interface Diagnosis {
    completionRate: number;
    totalCompleted: number;
    totalRequired: number;
    majorCompleted: number;
    majorRequired: number;
    liberalCompleted: number;
    liberalRequired: number;
    lackItems: string[];
}

interface Step5Props {
    diagnosis?: Diagnosis;
    onSave: () => void;
    saveStatus: string;
}

function Step5({ diagnosis, onSave, saveStatus }: Step5Props) {
    const safeDiagnosis: Diagnosis = diagnosis ?? {
        lackItems: [],
        completionRate: 0,
        totalCompleted: 0,
        totalRequired: 130,
        majorCompleted: 0,
        majorRequired: 69,
        liberalCompleted: 0,
        liberalRequired: 37
    };

    return (
        <Card sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BugReport color="primary" /> 졸업 진단 결과
            </Typography>
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <CircularProgress
                        variant="determinate"
                        value={safeDiagnosis.completionRate ?? 0}
                        size={60}
                        color={safeDiagnosis.completionRate >= 100 ? 'success' : 'primary'}
                    />
                    <Box>
                        <Typography variant="h4" fontWeight="bold">
                            {safeDiagnosis.completionRate}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            졸업 요건 완료율
                        </Typography>
                    </Box>
                </Box>
            </Box>
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                    { label: '총 학점', completed: safeDiagnosis.totalCompleted, required: safeDiagnosis.totalRequired, color: 'primary' },
                    { label: '전공 학점', completed: safeDiagnosis.majorCompleted, required: safeDiagnosis.majorRequired, color: 'secondary' },
                    { label: '교양 학점', completed: safeDiagnosis.liberalCompleted, required: safeDiagnosis.liberalRequired, color: 'success' }
                ].map((item, idx) => (
                    <Grid item xs={12} md={4} key={item.label}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6" color={`${item.color}.main`}>
                                {item.completed}/{item.required}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {item.label}
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={Math.min((item.completed / item.required) * 100, 100)}
                                color={item.color as any}
                                sx={{ mt: 1 }}
                            />
                        </Paper>
                    </Grid>
                ))}
            </Grid>
            {safeDiagnosis.lackItems.length === 0 ? (
                <Alert severity="success" icon={<CheckCircle />}>
                    모든 졸업 요건을 충족했습니다! 졸업 신청이 가능합니다.
                </Alert>
            ) : (
                <Alert severity="warning" icon={<Warning />}>
                    <Typography variant="subtitle2" gutterBottom>
                        부족한 요건이 있습니다:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {safeDiagnosis.lackItems.map((item, index) => (
                            <Chip
                                key={index}
                                label={item}
                                size="small"
                                color="warning"
                                variant="outlined"
                            />
                        ))}
                    </Box>
                </Alert>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                <Button variant="contained" color="primary" onClick={onSave}>저장</Button>
                {saveStatus && <Typography color="success.main" sx={{ alignSelf: 'center' }}>{saveStatus}</Typography>}
            </Box>
        </Card>
    );
}

// 실시간 데이터 저장 함수
const saveToDataContext = (updateGraduationInfo: (info: any) => void, data: any) => {
    try {
        updateGraduationInfo(data);
        // 커스텀 이벤트 발생 - 마이페이지에서 이벤트 리스너로 감지
        window.dispatchEvent(new CustomEvent('graduationDataUpdate', { detail: data }));
    } catch (error) {
        console.error('데이터 저장 중 오류:', error);
    }
};

interface GraduationProps {
  onClose: () => void;
}

export default function Graduation({ onClose }: GraduationProps) {
    const [state, dispatch] = useReducer(reducer, initialState)
    const [saveStatus, setSaveStatus] = useState('');
    const { user } = useAuth();

    // graduation 관련 상태/메서드 useData에서 추출
    const {
        graduationInfo,
        updateGraduationInfo,
        completedCourses,
        addCompletedCourse,
        removeCompletedCourse
    } = useData();

    console.log('[DEBUG] graduationInfo.extra:', graduationInfo?.extra);

    const [completedRequired, setCompletedRequired] = useState<StoreCourse[]>([]);
    const [missingRequired, setMissingRequired] = useState<StoreCourse[]>([]);

    const [graduationExtra, setGraduationExtra] = useState<Record<string, boolean>>({
        capstone: false,
        english: false,
        internship: false,
    });

    React.useEffect(() => {
    if (graduationInfo.extra) {
            setGraduationExtra({
                capstone: graduationInfo.extra.capstoneCompleted ?? false,
                english: graduationInfo.extra.englishRequirementMet ?? false,
                internship: graduationInfo.extra.internshipCompleted ?? false,
            });
        }
    }, [graduationInfo.extra]);

    React.useEffect(() => {
        const loadRequired = async () => {
        try {
            const { data: res } = await apiService.getRequired();
            setMissingRequired(
                (res?.data?.missing || []).map((r: any) => ({
                code: r.courseCode,
                name: r.name,
                credit: r.credits,
                type: r.type === 'MR' ? '전공필수' : '교양필수',
                year: 0,
                semester: 0,
                professor: '',
                description: '',
                }))
            );

            const records = await apiService.getRecords();
            const completed = records
                .filter((r) => (r.type === 'MR' || r.type === 'GR') && r.grade !== 'F' && r.grade !== 'NP')
                .map(mapRecordToCourse);

            setCompletedRequired(completed);
        } catch (err) {
            console.error('필수 과목 불러오기 실패:', err);
        }
        };

        loadRequired();
    }, []);

    const major = graduationInfo.majorRequired ?? 0;
    const liberal = graduationInfo.generalRequired ?? 0;

    const graduationDiagnosis = graduationInfo.diagnosis || {
        lackItems: [],
        completionRate: 0,
        totalCompleted: 0,
        totalRequired: 130,
        majorCompleted: 0,
        majorRequired: 69,
        liberalCompleted: 0,
        liberalRequired: 37
    };

    const [diagnosis, setDiagnosis] = useState<Diagnosis>({
        lackItems: [],
        completionRate: 0,
        totalCompleted: 0,
        totalRequired: 130,
        majorCompleted: 0,
        majorRequired: 69,
        liberalCompleted: 0,
        liberalRequired: 37
    });

    const runGraduationDiagnosis = () => {
        const total = state.major + state.liberal;
        const requiredTotal = 130;
        const lackItems: string[] = [];

        if (total < requiredTotal) {
            lackItems.push(`총 학점 부족 (현재: ${total}, 필요: ${requiredTotal})`);
        }
        if (state.major < 69) {
            lackItems.push(`전공 학점 부족 (현재: ${state.major}, 필요: 69)`);
        }
        if (state.liberal < 37) {
            lackItems.push(`교양 학점 부족 (현재: ${state.liberal}, 필요: 37)`);
        }

        Object.entries(graduationExtra).forEach(([key, value]) => {
            if (!value) {
                switch (key) {
                    case 'capstone': lackItems.push('졸업작품(캡스톤디자인) 미이수'); break;
                    case 'english': lackItems.push('공인어학성적 미충족'); break;
                    case 'internship': lackItems.push('현장실습 미이수'); break;
                }
            }
        });

        const newDiagnosis: Diagnosis = {
            lackItems,
            completionRate: Math.round((total / requiredTotal) * 100),
            totalCompleted: total,
            totalRequired: requiredTotal,
            majorCompleted: state.major,
            majorRequired: 69,
            liberalCompleted: state.liberal,
            liberalRequired: 37
        };

        setDiagnosis(newDiagnosis);
        updateGraduationInfo({ diagnosis: newDiagnosis });
    };

    const resetGraduationData = () => {
        updateGraduationInfo({
            totalCredits: 0,
            majorRequired: 0,
            majorElective: 0,
            generalRequired: 0,
            generalElective: 0,
            totalRequired: 130,
            progress: 0,
            remainingCredits: 130,
            extra: {},
            diagnosis: {}
        });
    };

    // 회원가입 프로필 정보로 기본 정보 자동 세팅
    React.useEffect(() => {
        const loadProfile = async () => {
            try {
            const profile = await apiService.getProfile();

            if (profile) {
                dispatch({ type: 'SET_FIELD', field: 'id', value: profile.studentId });
                dispatch({ type: 'SET_FIELD', field: 'name', value: profile.name });
                dispatch({ type: 'SET_FIELD', field: 'dept', value: profile.major });
                
                // 입학년도 처리
                if (profile.enrollmentYear) {
                dispatch({ type: 'SET_FIELD', field: 'curriculumYear', value: profile.enrollmentYear });
                }
            }
            } catch (err) {
            console.error('프로필 불러오기 실패:', err);
            }
        };

        loadProfile();
    }, []);

    React.useEffect(() => {
        const loadCredits = async () => {
            try {
                const summary = await apiService.getSummary();
                dispatch({ type: 'SET_FIELD', field: 'major', value: summary.majorCredits });
                dispatch({ type: 'SET_FIELD', field: 'liberal', value: summary.liberalCredits });
            } catch (err) {
                console.error('학점 요약 불러오기 실패:', err);
            }
        };

        loadCredits();
    }, []);

    // 저장 함수: 졸업관리 입력 정보를 DataContext에 저장
    const saveGraduationInfo = async () => {
        const total = state.major + state.liberal;
        const requiredTotal = 130;

        const lackItems: string[] = [];
        if (total < requiredTotal) {
            lackItems.push(`총 학점 부족 (현재: ${total}, 필요: ${requiredTotal})`);
        }
        if (state.major < 69) {
            lackItems.push(`전공 학점 부족 (현재: ${state.major}, 필요: 69)`);
        }
        if (state.liberal < 37) {
            lackItems.push(`교양 학점 부족 (현재: ${state.liberal}, 필요: 37)`);
        }

        Object.entries(graduationExtra).forEach(([key, value]) => {
            if (!value) {
                switch (key) {
                    case 'capstone': lackItems.push('졸업작품(캡스톤디자인) 미이수'); break;
                    case 'english': lackItems.push('공인어학성적 미충족'); break;
                    case 'internship': lackItems.push('현장실습 미이수'); break;
                }
            }
        });

        const latestDiagnosis: Diagnosis = {
            lackItems,
            completionRate: Math.round((total / requiredTotal) * 100),
            totalCompleted: total,
            totalRequired: requiredTotal,
            majorCompleted: state.major,
            majorRequired: 69,
            liberalCompleted: state.liberal,
            liberalRequired: 37,
        };

        const backendData = {
            totalCredits: total,
            majorRequired: state.major,
            generalRequired: state.liberal,
            totalRequired: requiredTotal,
            extra: mapExtraForBackend(graduationExtra),
            diagnosis: mapDiagnosisForBackend(latestDiagnosis),
        };

        try {
            await apiService.saveGraduationInfo(backendData);
            updateGraduationInfo(backendData);
            setDiagnosis(latestDiagnosis);
            onClose();
        } catch (err) {
            console.error('저장 실패:', err);
        }
    };


    // 각 단계별 입력 검증
    const canProceedToNext = (): boolean => {
        switch (state.step) {
            case 0: // 학적 정보
                return validateStudentId(state.id) &&
                    validateName(state.name) &&
                    state.dept.trim() !== '' &&
                    validateCurriculumYear(state.curriculumYear);
            case 1: // 학점 입력
                return state.major >= 0 && state.liberal >= 0;
            case 2: // 과목 선택
                return true; // 선택 과목이므로 필수 아님
            case 3: // 기타 요건
                return true; // 선택 사항이므로 필수 아님
            default:
                return true;
        }
    };

    // step 이동 시 DataContext에 반영 + 실시간 저장
    const handleNext = async () => {
        if (!canProceedToNext()) {
            return;
        }
        if (state.step === 0) {
            updateGraduationInfo({
                // graduationStudent → GraduationInfo의 flat 필드로 매핑
                // id, name, dept, curriculumYear 등은 graduationInfo에 직접 저장하지 않으므로 필요시 profile 등으로 이동
            });
        }
        if (state.step === 1) {
            const total = state.major + state.liberal;
            updateGraduationInfo({
                majorRequired: state.major,
                generalRequired: state.liberal,
                totalCredits: total,
                totalRequired: total
            });
        }
        if (state.step === 3) {
            runGraduationDiagnosis();

            try {
                const res = await apiService.getGraduationStatus();
                if (res) {
                    updateGraduationInfo(res);
                    setDiagnosis(res.diagnosis);
                }
            } catch (err) {
                console.error('졸업 상태 조회 실패:', err);
            }
        }
        dispatch({ type: 'NEXT_STEP' });
    };

    const handlePrev = () => dispatch({ type: 'PREV_STEP' });
    const handleReset = () => {
        dispatch({ type: 'RESET' });
        resetGraduationData();
    };

    // 필터링된 과목
    const filteredCourses = courseCatalog.filter((course: any) => {
        const matchesSearch = course.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
            course.code.toLowerCase().includes(state.searchTerm.toLowerCase());
        const matchesType = state.filterType === '전체' || course.type === state.filterType;
        return matchesSearch && matchesType;
    }) as StoreCourse[];

    const steps = [
        { label: '기본 정보', component: <Step1 {...state} onChange={(f, v) => dispatch({ type: 'SET_FIELD', field: f, value: v })} /> },
        { label: '학점 입력', component: <Step2 major={state.major} liberal={state.liberal} /> },
        { label: '필수 과목 현황', component: <Step3 completedRequired={completedRequired} missingRequired={missingRequired} /> },
        { label: '기타 요건', component: <Step4 extra={graduationExtra} setExtra={setGraduationExtra} /> },
        { label: '결과', component: <Step5 diagnosis={diagnosis} onSave={saveGraduationInfo} saveStatus={saveStatus} /> }
    ];

    return (
        <Box maxWidth={1200} mx="auto" px={2} py={4}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    졸업 요건 진단
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    한국공학대학교 컴퓨터공학부 졸업 요건을 단계별로 확인해보세요
                </Typography>
            </Box>

            <Stepper activeStep={state.step} sx={{ mb: 4 }}>
                {steps.map((stepItem, index) => (
                    <Step key={index}>
                        <StepLabel>{stepItem.label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {steps[state.step].component}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Box>
                    <Button variant="outlined" onClick={handleReset} startIcon={<Refresh />}>
                        초기화
                    </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        disabled={state.step === 0}
                        onClick={handlePrev}
                        variant="outlined"
                    >
                        이전
                    </Button>
                    {state.step < steps.length - 1 ? (
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            disabled={!canProceedToNext()}
                        >
                            {state.step === 3 ? '진단 실행' : '다음'}
                        </Button>
                    ) : (
                        <Button variant="outlined" onClick={handleReset}>
                            다시 시작
                        </Button>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
