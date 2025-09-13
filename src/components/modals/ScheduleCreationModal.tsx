import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    FormControl,
    FormLabel,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Select,
    MenuItem,
    InputLabel,
    Grid,
    Card,
    CardContent,
    CardActions,
    Chip,
    CircularProgress,
    Alert,
    IconButton,
    Divider,
    Paper,
    Stack,
    Tabs,
    Tab
} from '@mui/material';
import {
    Settings,
    AutoMode,
    Refresh,
    Schedule,
    Person,
    AccessTime,
    School,
    CheckCircle,
    Warning
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '@/services/ApiService';
import { slotToCourse } from '@/utils/mapper';
import TimetableGrid from '../timetable/TimetableGrid';
import { CourseType, DayKey } from '@/types/course';
import { periodMap } from '@/data/periodMap';
import { GeneratedSchedule } from '@/types/user';

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8E8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

const courseColorMap: { [key: string]: string } = {};

function getColorForCourse(key: string) {
  if (!courseColorMap[key]) {
    const nextColor = colors[Object.keys(courseColorMap).length % colors.length];
    courseColorMap[key] = nextColor;
  }
  return courseColorMap[key];
}

interface ScheduleCreationModalProps {
    open: boolean;
    onClose: () => void;
    curriculumId: number;
    curriculumName: string;
    onSaveSchedule: (schedule: GeneratedSchedule, semester: string) => void;
}

interface SchedulePreferences {
    free_days: string[];
    exclude_morning: boolean;
    exclude_evening: boolean;
    max_consecutive_hours: number;
    max_daily_classes: number;
    preferred_professors: string[];
    avoid_professors: string[];
}

const ScheduleCreationModal: React.FC<ScheduleCreationModalProps> = ({
    open,
    onClose,
    curriculumId,
    curriculumName,
    onSaveSchedule
}) => {
    const [step, setStep] = useState<'preferences' | 'generating' | 'results'>('preferences');
    const [preferences, setPreferences] = useState<SchedulePreferences>({
        free_days: [],
        exclude_morning: false,
        exclude_evening: false,
        max_consecutive_hours: 6,
        max_daily_classes: 4,
        preferred_professors: [],
        avoid_professors: []
    });
    const [generatedSchedules, setGeneratedSchedules] = useState<GeneratedSchedule[]>([]);
    const [excludeGenerated, setExcludeGenerated] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentSemester, setCurrentSemester] = useState('2025-2학기');
    const [selectedTab, setSelectedTab] = useState(0);
    const [professorSelections, setProfessorSelections] = useState<{[key:string]: string}>({});
    const [professorDialogOpen, setProfessorDialogOpen] = useState(false);
    const [pendingSchedule, setPendingSchedule] = useState<GeneratedSchedule | null>(null);

    const handleProfessorChange = (courseName: string, prof: string) => {
        setProfessorSelections(prev => ({ ...prev, [courseName]: prof }));
    };

    const handleProfessorConfirm = async () => {
        if (!pendingSchedule) return;

        // 교수 선택 강제 확인
        const missingSelections = pendingSchedule.lectures.filter(
            lec => lec.professor.includes("/") && !professorSelections[lec.name]
        );
        if (missingSelections.length > 0) {
            alert("모든 과목에 대해 담당 교수를 선택해야 합니다.");
            return;
        }

        // 교수 선택 반영
        const filteredLectures = pendingSchedule.lectures.map(lec => {
            if (lec.professor.includes("/")) {
            return { ...lec, professor: professorSelections[lec.name] };
            }
            return lec;
        });

        const backendCourses = filteredLectures.flatMap((lec) =>
            lec.schedule.map((slot) => ({
                name: lec.name,
                code_id: lec.code_id,
                professor: lec.professor,
                credits: lec.credits,
                room: lec.room,
                type: lec.type,
                schedule: [
                    {
                        day: slot.day,
                        startPeriod: slot.startPeriod ?? slot.period,
                        endPeriod: slot.endPeriod ?? slot.period,
                        start_end: slot.start_end
                    }
                ]
            }))
        );

        await apiService.saveTimetable({
            semester: currentSemester,
            courses: backendCourses,
            updatedAt: new Date().toISOString(),
            isGenerated: true
        });

        setProfessorDialogOpen(false);
        onClose();
    };

    const dayOptions = [
        { value: 'monday', label: '월요일' },
        { value: 'tuesday', label: '화요일' },
        { value: 'wednesday', label: '수요일' },
        { value: 'thursday', label: '목요일' },
        { value: 'friday', label: '금요일' }
    ];

    const dayLabelMap: { [key: string]: string } = {
        monday: '월요일',
        tuesday: '화요일',
        wednesday: '수요일',
        thursday: '목요일',
        friday: '금요일'
    };

    const handlePreferenceChange = (key: keyof SchedulePreferences, value: any) => {
        setPreferences(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const toggleFreeDays = (day: string) => {
        setPreferences(prev => ({
            ...prev,
            free_days: prev.free_days.includes(day)
                ? prev.free_days.filter(d => d !== day)
                : [...prev.free_days, day]
        }));
    };

    const generateSchedules = async () => {
        setLoading(true);
        setError(null);
        setStep('generating');

        try {
            const timetables = await apiService.generateTimetables(
                curriculumId,
                preferences,
                excludeGenerated
            );

            setGeneratedSchedules(timetables);
            setExcludeGenerated(prev => [
                ...prev,
                ...timetables.map((t: any) => t.id),
            ]);
            setStep('results');
        } catch (err) {
            setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
            setStep('preferences');
        } finally {
            setLoading(false);
        }
    };

    const refreshSchedules = async () => {
        setLoading(true);
        setError(null);

        try {
            const timetables = await apiService.generateTimetables(
                curriculumId,
                preferences,
                excludeGenerated
            );

            setGeneratedSchedules(timetables);
            setExcludeGenerated(prev => [
                ...prev,
                ...timetables.map((t: GeneratedSchedule) => String(t.id ?? ''))
            ]);

            setSelectedTab(0);
        } catch (err) {
            setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };


    const handleClose = () => {
        setStep('preferences');
        setGeneratedSchedules([]);
        setExcludeGenerated([]);
        setError(null);
        onClose();
    };

    const renderPreferencesStep = () => (
        <DialogContent>
            <Typography variant="h6" gutterBottom>
                시간표 생성 조건 설정
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {curriculumName}에서 자동으로 시간표를 생성합니다. 원하는 조건을 설정해주세요.
            </Typography>

            <Grid container spacing={3}>
                {/* 공강일 설정 */}
                <Grid item xs={12}>
                    <FormControl component="fieldset">
                        <FormLabel component="legend">공강 희망 요일</FormLabel>
                        <FormGroup row sx={{ mt: 1 }}>
                            {dayOptions.map(day => (
                                <FormControlLabel
                                    key={day.value}
                                    control={
                                        <Checkbox
                                            checked={preferences.free_days.includes(day.value)}
                                            onChange={() => toggleFreeDays(day.value)}
                                        />
                                    }
                                    label={day.label}
                                />
                            ))}
                        </FormGroup>
                    </FormControl>
                </Grid>

                {/* 시간대 제외 설정 */}
                <Grid item xs={12} sm={6}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={preferences.exclude_morning}
                                onChange={(e) => handlePreferenceChange('exclude_morning', e.target.checked)}
                            />
                        }
                        label="1교시 제외"
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={preferences.exclude_evening}
                                onChange={(e) => handlePreferenceChange('exclude_evening', e.target.checked)}
                            />
                        }
                        label="야간 수업 제외"
                    />
                </Grid>

                {/* 연강 및 수업 개수 설정 */}
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel>하루 최대 연강 시간</InputLabel>
                        <Select
                            value={preferences.max_consecutive_hours}
                            label="하루 최대 연강 시간"
                            onChange={(e) => handlePreferenceChange('max_consecutive_hours', e.target.value)}
                        >
                            {[2, 3, 4, 5, 6, 7, 8].map(hours => (
                                <MenuItem key={hours} value={hours}>{hours}시간</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel>하루 최대 수업 개수</InputLabel>
                        <Select
                            value={preferences.max_daily_classes}
                            label="하루 최대 수업 개수"
                            onChange={(e) => handlePreferenceChange('max_daily_classes', e.target.value)}
                        >
                            {[1, 2, 3, 4, 5].map(count => (
                                <MenuItem key={count} value={count}>{count}개</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
            <Typography variant="body2" color="text.secondary" sx={{ mt:3 }}>
                설정된 조건이 시간표 생성 시 반영되지 않을 수 있습니다.
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}
        </DialogContent>
    );

    const renderGeneratingStep = () => (
        <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                    시간표 생성 중...
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                    설정하신 조건에 맞는 최적의 시간표를 생성하고 있습니다.
                    <br />
                    잠시만 기다려주세요.
                </Typography>
            </Box>
        </DialogContent>
    );

    const renderResultsStep = () => (
        <DialogContent sx={{ maxHeight: '70vh', overflow: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                    생성된 시간표 ({generatedSchedules.length}개)
                </Typography>
                <Button
                    startIcon={<Refresh />}
                    onClick={refreshSchedules}
                    disabled={loading}
                    size="small"
                >
                    새로고침
                </Button>
            </Box>

            {generatedSchedules.length === 0 ? (
                <Alert severity="warning">
                    조건에 맞는 시간표를 생성할 수 없습니다. 조건을 완화해보세요.
                </Alert>
            ) : generatedSchedules[selectedTab]?.lectures.length 
                    < (generatedSchedules[selectedTab]?.summary?.total_lectures ?? 0) ? (
                <Alert severity="warning">
                    커리큘럼의 모든 과목을 배치할 수 없어 시간표를 생성할 수 없습니다.
                </Alert>
            ) : (
            <>
                {/* 탭 영역 */}
                <Tabs
                    value={selectedTab}
                    onChange={(e, val) => setSelectedTab(val)}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="scrollable"
                    scrollButtons="auto"
                >
                {generatedSchedules.map((_, idx) => (
                    <Tab key={idx} label={`옵션 ${idx + 1}`} />
                ))}
                </Tabs>

                {/* 선택된 시간표 블록 */}
                <Box sx={{ mt: 2 }}>
                    <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            총 학점: {generatedSchedules[selectedTab]?.summary?.total_credits ?? 0}학점
                        </Typography>
                        <TimetableGrid
                            courses={generatedSchedules[selectedTab]?.lectures.flatMap(l => {
                                // 요일별로 스케줄 그룹화
                                const scheduleByDay: { [key: string]: typeof l.schedule } = {};
                                l.schedule.forEach(slot => {
                                    if (!scheduleByDay[slot.day]) {
                                        scheduleByDay[slot.day] = [];
                                    }
                                    scheduleByDay[slot.day].push(slot);
                                });
                                
                                // 각 요일별로 연속된 교시 합치기
                                return Object.entries(scheduleByDay).map(([day, slots]) => {
                                    const parsePeriod = (p: any) => Number(p);

                                    // 교시 순서 정렬 → startPeriod 기준
                                    slots.sort((a, b) => (a.startPeriod ?? a.period) - (b.startPeriod ?? b.period));

                                    const mergedSlots: any[] = [];
                                    let currentGroup = [slots[0]];

                                    for (let i = 1; i < slots.length; i++) {
                                        const prev = currentGroup[currentGroup.length - 1];
                                        const curr = slots[i];
                                        const prevEnd = prev.endPeriod ?? prev.period;
                                        const currStart = curr.startPeriod ?? curr.period;

                                        if (currStart === prevEnd + 1) {
                                            currentGroup.push(curr);
                                        } else {
                                            mergedSlots.push(currentGroup);
                                            currentGroup = [curr];
                                        }
                                    }
                                    mergedSlots.push(currentGroup);

                                    // 그룹을 하나의 course로 변환
                                    return mergedSlots.map(group => {
                                        const startSlot = group[0];
                                        const endSlot = group[group.length - 1];

                                        const startPeriod = startSlot.startPeriod ?? startSlot.period;
                                        const endPeriod = endSlot.endPeriod ?? endSlot.period;

                                        return {
                                            id: l.id,
                                            name: l.name,
                                            code: String(l.code_id),
                                            instructor: l.professor,
                                            credits: l.credits,
                                            room: l.room,
                                            day: day as DayKey,
                                            startPeriod,
                                            endPeriod,
                                            startTime: startSlot.start_end?.split("~")[0].trim() ?? periodMap[startPeriod].start,
                                            endTime: endSlot.start_end?.split("~")[1].trim() ?? periodMap[endPeriod].end,
                                            type: l.type as CourseType,
                                            color: getColorForCourse(l.code_id ?? l.code ?? String(l.id))
                                        };
                                    });

                                }).flat();
                            }).flat()}
                            onCourseClick={() => {}}
                        />
                    </Paper>
                </Box>
            </>
            )}
        </DialogContent>
    );

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth={step === 'results' ? "xl" : "md"}
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    minHeight: '60vh'
                }
            }}
        >
            <DialogTitle sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontWeight: 700
            }}>
                <AutoMode />
                커리큘럼 시간표 자동 생성
            </DialogTitle>

            <AnimatePresence mode="wait">
                {step === 'preferences' && (
                    <motion.div
                        key="preferences"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        {renderPreferencesStep()}
                    </motion.div>
                )}

                {step === 'generating' && (
                    <motion.div
                        key="generating"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        {renderGeneratingStep()}
                    </motion.div>
                )}

                {step === 'results' && (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        {renderResultsStep()}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                            <Button onClick={handleClose}>
                                취소
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => setStep('preferences')}
                                startIcon={<Settings />}
                            >
                                조건 변경
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                const selected = generatedSchedules[selectedTab];
                                setPendingSchedule(selected);
                                setProfessorDialogOpen(true);
                                }}
                            >
                                저장하기
                            </Button>
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                {step === 'preferences' && (
                    <>
                    <Button onClick={handleClose}>
                        취소
                    </Button>
                    <Button
                        variant="contained"
                        onClick={generateSchedules}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={16} /> : <AutoMode />}
                    >
                        {loading ? '생성 중...' : '시간표 생성'}
                    </Button>
                    </>
                )}
            </DialogActions>
            <Dialog open={professorDialogOpen} onClose={() => setProfessorDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>교수 선택</DialogTitle>
                    <DialogContent>
                        {pendingSchedule?.lectures.map((lec, idx) => {
                        const options = lec.professor.split("/");
                        if (options.length <= 1) return null;

                        return (
                            <Box key={idx} sx={{ mb: 2 }}>
                            <Typography>{lec.name}</Typography>
                            <FormControl fullWidth>
                                <Select
                                value={professorSelections[lec.name] || ""}
                                onChange={(e) => handleProfessorChange(lec.name, e.target.value)}
                                displayEmpty
                                >
                                <MenuItem value="" disabled>
                                    교수를 선택하세요
                                </MenuItem>
                                {options.map((opt) => (
                                    <MenuItem key={opt} value={opt}>
                                    {opt}
                                    </MenuItem>
                                ))}
                                </Select>
                            </FormControl>
                            </Box>
                        );
                        })}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setProfessorDialogOpen(false)}>취소</Button>
                        <Button onClick={handleProfessorConfirm} variant="contained">
                            확인
                        </Button>
                    </DialogActions>
                </Dialog>
        </Dialog>
    );
};

export default ScheduleCreationModal;