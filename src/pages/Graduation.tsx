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

// Course 타입은 store에서 import (full type)
import type { Course as StoreCourse } from '../stores/graduationStore';

// 타입 정의
interface GraduationState {
    step: number;
    id: number;
    name: string;
    dept: string;
    curriculumYear: number;
    major: number;
    liberal: number;
    basic: number;
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
    basic: 0,
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
    basic: number;
    onChange: (field: keyof GraduationState, value: any) => void;
}

function Step2({ major, liberal, basic, onChange }: Step2Props) {
    const [majorInput, setMajorInput] = useState(major.toString());
    const [liberalInput, setLiberalInput] = useState(liberal.toString());
    const [basicInput, setBasicInput] = useState(basic.toString());

    const handleInput = (field: keyof GraduationState, value: string, setInput: (v: string) => void) => {
        if (/^\d*$/.test(value)) {
            setInput(value);
            onChange(field, value === '' ? 0 : Number(value));
        }
    };

    const total = (Number(majorInput) || 0) + (Number(liberalInput) || 0) + (Number(basicInput) || 0);

    const creditFields = [
        { key: 'major', label: '전공 학점', value: majorInput, set: setMajorInput, required: 69, color: 'secondary' },
        { key: 'liberal', label: '교양 학점', value: liberalInput, set: setLiberalInput, required: 37, color: 'success' },
        { key: 'basic', label: '기초/계열 학점', value: basicInput, set: setBasicInput, required: 0, color: 'info' }
    ];

    return (
        <Card sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assessment color="primary" /> 학점 입력
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3} key="total">
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
                            color={"primary" as any}
                            sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                            {total}/130 ({Math.round((total / 130) * 100)}%)
                        </Typography>
                    </Box>
                </Grid>
                {creditFields.map(field => (
                    <Grid item xs={12} sm={6} md={3} key={field.key}>
                        <TextField
                            type="text"
                            label={field.label}
                            fullWidth
                            value={field.value}
                            onChange={e => handleInput(field.key as keyof GraduationState, e.target.value, field.set)}
                            inputProps={{ inputMode: 'numeric', pattern: '\\d*', maxLength: 3 }}
                            helperText={`필수: ${field.required}학점`}
                        />
                        {field.required > 0 && (
                            <Box mt={1}>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min(((Number(field.value) || 0) / field.required) * 100, 100)}
                                    color={field.color as any}
                                    sx={{ height: 8, borderRadius: 4 }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                    {field.value}/{field.required} ({Math.round(((Number(field.value) || 0) / field.required) * 100)}%)
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
                    color={"primary" as any}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    총 {total}학점 / 130학점 ({Math.round((total / 130) * 100)}%)
                </Typography>
            </Box>
        </Card>
    );
}

interface Step3Props {
    searchTerm: GraduationState['searchTerm'];
    filterType: GraduationState['filterType'];
    onChange: (field: keyof GraduationState, value: any) => void;
    filteredCourses: StoreCourse[];
    completedCourses: StoreCourse[];
    addCourse: (course: StoreCourse) => void;
    removeCourse: (code: string) => void;
}

function Step3({ searchTerm, filterType, onChange, filteredCourses, completedCourses, addCourse, removeCourse }: Step3Props) {
    const isRequired = (course: StoreCourse) => course.type === '전공필수' || course.type === '교양필수';
    const requiredCourses = filteredCourses.filter(isRequired);

    const yearGroups: { [key: string]: StoreCourse[] } = {};
    requiredCourses.forEach(course => {
        const year = (typeof course.year === 'number' && course.year >= 1 && course.year <= 4) ? `${course.year}학년` : '기타';
        if (!yearGroups[year]) yearGroups[year] = [];
        yearGroups[year].push(course);
    });

    const yearOrder = ['1학년', '2학년', '3학년', '4학년', '기타'];

    return (
        <Card sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TableChart color="primary" /> 필수 과목 선택
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
                        <Typography variant="subtitle2" gutterBottom>필수 과목 카탈로그</Typography>
                        <Box sx={{ mb: 2 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="과목명 또는 학수번호로 검색..."
                                value={searchTerm}
                                onChange={e => onChange('searchTerm', e.target.value)}
                                sx={{ mb: 1 }}
                            />
                            <FormControl size="small" fullWidth>
                                <InputLabel>이수구분</InputLabel>
                                <Select
                                    value={filterType}
                                    onChange={e => onChange('filterType', e.target.value)}
                                    label="이수구분"
                                >
                                    <MenuItem value="전체">전체</MenuItem>
                                    <MenuItem value="전공필수">전공필수</MenuItem>
                                    <MenuItem value="교양필수">교양필수</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        {yearOrder.filter(y => yearGroups[y] && yearGroups[y].length > 0).map(year => (
                            <Box key={year} sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>{year}</Typography>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        sx={{ minWidth: 0, px: 1, py: 0, fontSize: 12 }}
                                        onClick={() => {
                                            // 해당 학년의 모든 과목을 추가
                                            yearGroups[year].forEach(course => addCourse(course));
                                        }}
                                    >
                                        전체 추가
                                    </Button>
                                </Box>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {yearGroups[year].map((course) => (
                                        <Chip
                                            key={course.code}
                                            label={`${course.name} (${course.credit}학점)`}
                                            size="small"
                                            onClick={() => addCourse(course)}
                                            color={course.type === '전공필수' ? 'error' : 'primary'}
                                            variant="outlined"
                                            sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        ))}
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, minHeight: 400 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            선택된 필수 과목 ({completedCourses.length}개)
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {completedCourses.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Info color="action" sx={{ fontSize: 48, mb: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                    왼쪽에서 필수 과목을 클릭하여 추가하세요
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {completedCourses.map((course) => (
                                    <Paper key={course.code} sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body2" fontWeight="bold">
                                                {course.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {course.code} • {course.credit}학점 • {course.type}
                                            </Typography>
                                        </Box>
                                        <IconButton size="small" onClick={() => removeCourse(course.code)} color="error">
                                            <Edit fontSize="small" />
                                        </IconButton>
                                    </Paper>
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
    diagnosis: Diagnosis;
    onSave: () => void;
    saveStatus: string;
}

function Step5({ diagnosis, onSave, saveStatus }: Step5Props) {
    return (
        <Card sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BugReport color="primary" /> 졸업 진단 결과
            </Typography>
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <CircularProgress
                        variant="determinate"
                        value={diagnosis.completionRate}
                        size={60}
                        color={diagnosis.completionRate >= 100 ? 'success' : 'primary'}
                    />
                    <Box>
                        <Typography variant="h4" fontWeight="bold">
                            {diagnosis.completionRate}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            졸업 요건 완료율
                        </Typography>
                    </Box>
                </Box>
            </Box>
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                    { label: '총 학점', completed: diagnosis.totalCompleted, required: diagnosis.totalRequired, color: 'primary' },
                    { label: '전공 학점', completed: diagnosis.majorCompleted, required: diagnosis.majorRequired, color: 'secondary' },
                    { label: '교양 학점', completed: diagnosis.liberalCompleted, required: diagnosis.liberalRequired, color: 'success' }
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
            {diagnosis.lackItems.length === 0 ? (
                <Alert severity="success" icon={<CheckCircle />}>
                    모든 졸업 요건을 충족했습니다! 졸업 신청이 가능합니다.
                </Alert>
            ) : (
                <Alert severity="warning" icon={<Warning />}>
                    <Typography variant="subtitle2" gutterBottom>
                        부족한 요건이 있습니다:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {diagnosis.lackItems.map((item, index) => (
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

export default function Graduation() {
    const [state, dispatch] = useReducer(reducer, initialState);
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

    // graduationExtra, graduationDiagnosis 등은 graduationInfo의 extra, diagnosis 필드로 통합
    const graduationExtra = graduationInfo.extra || {};
    const setGraduationExtra = (extra: Record<string, boolean>) => {
        updateGraduationInfo({ extra });
    };
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
    const runGraduationDiagnosis = () => {
        // 진단 로직 구현
        const total = state.major + state.liberal + state.basic;
        const requiredTotal = 130;
        const lackItems: string[] = [];

        // 총 학점 체크
        if (total < requiredTotal) {
            lackItems.push(`총 학점 부족 (현재: ${total}, 필요: ${requiredTotal})`);
        }

        // 전공 학점 체크 (일반적으로 69학점 이상)
        const requiredMajor = 69;
        if (state.major < requiredMajor) {
            lackItems.push(`전공 학점 부족 (현재: ${state.major}, 필요: ${requiredMajor})`);
        }

        // 교양 학점 체크 (일반적으로 37학점 이상)
        const requiredLiberal = 37;
        if (state.liberal < requiredLiberal) {
            lackItems.push(`교양 학점 부족 (현재: ${state.liberal}, 필요: ${requiredLiberal})`);
        }

        // 기초 학점 체크 (일반적으로 24학점 이상)
        const requiredBasic = 24;
        if (state.basic < requiredBasic) {
            lackItems.push(`기초 학점 부족 (현재: ${state.basic}, 필요: ${requiredBasic})`);
        }

        // 기타 요건 체크
        Object.entries(graduationExtra).forEach(([key, value]) => {
            if (!value) {
                switch (key) {
                    case 'capstone':
                        lackItems.push('졸업작품(캡스톤디자인) 미이수');
                        break;
                    case 'english':
                        lackItems.push('공인어학성적 미충족');
                        break;
                    case 'internship':
                        lackItems.push('현장실습 미이수');
                        break;
                    case 'volunteer':
                        lackItems.push('사회봉사 미이수');
                        break;
                }
            }
        });

        // 진단 결과 저장
        const diagnosis = {
            lackItems,
            completionRate: Math.round((total / requiredTotal) * 100),
            totalCompleted: total,
            totalRequired: requiredTotal,
            majorCompleted: state.major,
            majorRequired: 69,
            liberalCompleted: state.liberal,
            liberalRequired: 37
        };

        updateGraduationInfo({ diagnosis });
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
        if (user && user.profile) {
            if (user.profile.studentId) {
                dispatch({ type: 'SET_FIELD', field: 'id', value: user.profile.studentId });
            }
            if (user.name) {
                dispatch({ type: 'SET_FIELD', field: 'name', value: user.name });
            }
            if (user.profile.major) {
                dispatch({ type: 'SET_FIELD', field: 'dept', value: user.profile.major });
            }
            // 입학년도: 여러 필드 중 우선순위로 세팅 (profileAny로 접근)
            let year: number | undefined = undefined;
            const profileAny = user.profile as any;
            if (profileAny && profileAny.enrollmentYear) {
                year = Number(profileAny.enrollmentYear);
            } else if (profileAny && profileAny.enrollmentDate) {
                const d = new Date(profileAny.enrollmentDate);
                if (!isNaN(d.getFullYear())) year = d.getFullYear();
            }
            if (year) {
                dispatch({ type: 'SET_FIELD', field: 'curriculumYear', value: year });
            }
        }
    }, [user]);

    // 저장 함수: 졸업관리 입력 정보를 DataContext에 저장
    const saveGraduationInfo = async () => {
        const newData = {
            totalCredits: state.major + state.liberal + state.basic,
            majorRequired: state.major,
            majorElective: 0,
            generalRequired: state.liberal,
            generalElective: state.basic,
            totalRequired: state.major + state.liberal + state.basic
        };
        updateGraduationInfo(newData);
        setSaveStatus('저장되었습니다!');
        setTimeout(() => setSaveStatus(''), 2000);
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
                return state.major >= 0 && state.liberal >= 0 && state.basic >= 0;
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
            const total = state.major + state.liberal + state.basic;
            updateGraduationInfo({
                majorRequired: state.major,
                generalRequired: state.liberal,
                generalElective: state.basic,
                totalCredits: total,
                totalRequired: total
            });
        }
        if (state.step === 3) {
            runGraduationDiagnosis();
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
        { label: '기본 정보', component: <Step1 {...state} onChange={(field, value) => dispatch({ type: 'SET_FIELD', field, value })} /> },
        { label: '학점 입력', component: <Step2 major={state.major} liberal={state.liberal} basic={state.basic} onChange={(field, value) => dispatch({ type: 'SET_FIELD', field, value })} /> },
        {
            label: '과목 선택', component: <Step3
                searchTerm={state.searchTerm}
                filterType={state.filterType}
                onChange={(field, value) => dispatch({ type: 'SET_FIELD', field, value })}
                filteredCourses={filteredCourses}
                completedCourses={completedCourses as any}
                addCourse={addCompletedCourse as any}
                removeCourse={removeCompletedCourse as any}
            />
        },
        { label: '기타 요건', component: <Step4 extra={graduationExtra} setExtra={setGraduationExtra} /> },
        { label: '결과', component: <Step5 diagnosis={graduationDiagnosis} onSave={saveGraduationInfo} saveStatus={saveStatus} /> }
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
