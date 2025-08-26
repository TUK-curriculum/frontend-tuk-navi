import React, { useState, useCallback, lazy, Suspense, useRef, useEffect } from 'react';
import { Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem, Button, Snackbar, Alert, CircularProgress, Fab, Backdrop, IconButton, Tooltip, Fade, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Menu as MuiMenu, MenuItem as MuiMenuItem } from '@mui/material';
import { School, Image, Add } from '@mui/icons-material';
import { SelectChangeEvent } from '@mui/material/Select';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import Switch from '@mui/material/Switch';
import FabAddCourse from '../components/FabAddCourse';
import type { Course } from '../types/course';
import { useAuth } from '../contexts/AuthContext';
import { useSchedule, useData } from '../contexts/SeparatedDataContext';
import TimetableGrid from '../components/timetable/TimetableGrid';
import { useTheme } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { ApiError, ErrorCode } from '../errors/ApiError';
import { generateMockSchedule, type CurriculumSuggestion } from '../mocks/chatbot.mock';

const CourseEditModal = lazy(() => import('../components/modals/CourseEditModal'));
const CourseDetailModal = lazy(() => import('../components/modals/CourseDetailModal'));

// 커스텀 훅: useDialog
function useDialog<T = any>() {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState<T | null>(null);
    const openDialog = (d?: T) => {
        setData(d || null);
        setOpen(true);
    };
    const closeDialog = () => setOpen(false);
    return { open, data, openDialog, closeDialog, setData };
}
// 커스텀 훅: useSnackbar
function useSnackbar() {
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity?: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '' });
    const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => setSnackbar({ open: true, message, severity });
    const closeSnackbar = () => setSnackbar(s => ({ ...s, open: false }));
    return { ...snackbar, showSnackbar, closeSnackbar };
}

// API 에러 처리 유틸리티
const handleApiError = (error: any, showSnackbar: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void) => {
    console.error('API Error:', error);

    if (error instanceof ApiError) {
        switch (error.code) {
            case ErrorCode.AUTHENTICATION_ERROR:
                showSnackbar('인증이 만료되었습니다. 다시 로그인해주세요.', 'error');
                setTimeout(() => window.location.href = '/login', 2000);
                break;
            case ErrorCode.AUTHORIZATION_ERROR:
                showSnackbar('권한이 없습니다.', 'error');
                break;
            case ErrorCode.NETWORK_ERROR:
                showSnackbar('네트워크 연결을 확인해주세요.', 'error');
                break;
            case ErrorCode.VALIDATION_ERROR:
                showSnackbar(`입력 데이터를 확인해주세요: ${error.message}`, 'error');
                break;
            case ErrorCode.SERVER_ERROR:
                showSnackbar('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
                break;
            default:
                showSnackbar('알 수 없는 오류가 발생했습니다.', 'error');
        }
    } else if (error.response) {
        // Axios 에러 처리
        const status = error.response.status;
        const message = error.response.data?.message || '서버 오류가 발생했습니다.';

        if (status === 401) {
            showSnackbar('인증이 만료되었습니다. 다시 로그인해주세요.', 'error');
            setTimeout(() => window.location.href = '/login', 2000);
        } else if (status === 403) {
            showSnackbar('권한이 없습니다.', 'error');
        } else if (status >= 500) {
            showSnackbar('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
        } else {
            showSnackbar(message, 'error');
        }
    } else if (error.request) {
        // 네트워크 에러
        showSnackbar('네트워크 연결을 확인해주세요.', 'error');
    } else {
        // 기타 에러
        showSnackbar('알 수 없는 오류가 발생했습니다.', 'error');
    }
};

// 이미지 업로드 모달
function ImageUploadModal({ open, onClose, onUpload }: { open: boolean; onClose: () => void; onUpload: (file: File) => void }) {
    const [file, setFile] = useState<File | null>(null);
    return (
        <Dialog open={open} onClose={onClose} TransitionComponent={Fade} keepMounted>
            <DialogTitle>강의 이미지 업로드</DialogTitle>
            <DialogContent>
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>취소</Button>
                <Button onClick={() => { if (file) onUpload(file); }} disabled={!file} variant="contained">업로드</Button>
            </DialogActions>
        </Dialog>
    );
}

// Header 컴포넌트
function Header({ semester, semesterOptions, onSemesterChange, onAddClick, addButtonRef, pinnedSemester, onPinClick, onResetClick }: { semester: string; semesterOptions: string[], onSemesterChange: (e: SelectChangeEvent) => void; onAddClick: (e: React.MouseEvent<HTMLElement>) => void; addButtonRef: React.RefObject<HTMLButtonElement | null>; pinnedSemester: string; onPinClick: () => void; onResetClick: () => void; }) {
    const isPinned = semester === pinnedSemester;
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <School fontSize="large" color="primary" />
                <Typography variant="h4" fontWeight={800}>시간표 관리</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormControl variant="outlined" sx={{ minWidth: 180 }}>
                    <InputLabel>학기 선택</InputLabel>
                    <Select value={semester} onChange={onSemesterChange} label="학기 선택">
                        {semesterOptions.map(option => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <IconButton onClick={onPinClick} color={isPinned ? 'primary' : 'default'} sx={{ ml: 0.5 }} aria-label="학기 고정">
                    {isPinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
                </IconButton>
                <IconButton onClick={onResetClick} color="error" sx={{ ml: 0.5 }} aria-label="시간표 초기화">
                    <RestartAltIcon />
                </IconButton>
                <Button
                    ref={addButtonRef}
                    variant="contained"
                    startIcon={<Add />}
                    onClick={onAddClick}
                    sx={{ ml: 1, height: 48, fontWeight: 700, borderRadius: 3 }}
                >
                    추가
                </Button>
            </Box>
        </Box>
    );
}

// ViewToggle 컴포넌트
function ViewToggle({ viewMode, setViewMode }: { viewMode: 'grid' | 'list'; setViewMode: (v: 'grid' | 'list') => void }) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2, gap: 1 }}>
            <Tooltip title="리스트 뷰"><ViewListIcon color={viewMode === 'list' ? 'primary' : 'disabled'} /></Tooltip>
            <Switch checked={viewMode === 'grid'} onChange={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} />
            <Tooltip title="그리드 뷰"><ViewModuleIcon color={viewMode === 'grid' ? 'primary' : 'disabled'} /></Tooltip>
        </Box>
    );
}

// (CourseList 등 리스트 뷰 관련 컴포넌트/코드 완전히 삭제)

// TimetableSlot을 Course로 변환하는 함수
const convertTimetableSlotToCourse = (slot: any): Course => ({
    id: slot.id,
    name: slot.subjectName,
    code: slot.subjectId,
    credits: 3, // 기본값
    type: 'elective' as const,
    day: slot.day,
    startPeriod: slot.startPeriod,
    endPeriod: slot.endPeriod,
    startTime: slot.startTime,
    endTime: slot.endTime,
    room: slot.room,
    instructor: slot.instructor
});

// Course를 TimetableSlot으로 변환하는 함수
const convertCourseToTimetableSlot = (course: Course): any => ({
    id: course.id,
    subjectId: course.code,
    subjectName: course.name,
    day: course.day,
    startPeriod: course.startPeriod,
    endPeriod: course.endPeriod,
    startTime: course.startTime,
    endTime: course.endTime,
    room: course.room,
    instructor: course.instructor
});

const Schedule: React.FC = () => {
    const theme = useTheme();
    const { user, isAuthenticated } = useAuth();
    const { userData, updateSettings } = useData();
    const { open: snackbarOpen, message, severity, showSnackbar, closeSnackbar } = useSnackbar();

    // 인증 상태 확인 강화
    useEffect(() => {
        if (!isAuthenticated || !user?.email) {
            // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
            window.location.href = '/login';
            return;
        }
    }, [isAuthenticated, user?.email]);

    const [semesterOptions, setSemesterOptions] = useState<string[]>([]);
    const pinnedSemester = userData?.settings?.pinnedSemester || '';
    const [semester, setSemester] = useState<string>(pinnedSemester || '');

    // 학기 목록 로딩
    useEffect(() => {
    (async () => {
        try {
        const { apiService } = await import('../services/ApiService');
        const list = await apiService.getSemesters();
        setSemesterOptions(list || []);

        // 고정값이 유효하면 유지, 아니면 마지막(현재학기)로 기본 선택
        if (pinnedSemester && list?.includes(pinnedSemester)) {
            setSemester(pinnedSemester);
        } else if (list?.length && !semester) {
            setSemester(list[list.length - 1]); // 현재 학기
        }
        } catch (e) {
        console.error('학기 목록 조회 실패:', e);
        }
    })();
    }, [pinnedSemester]);

    // 데이터 동기화 상태 관리
    const [isDataSyncing, setIsDataSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [offlineChanges, setOfflineChanges] = useState<any[]>([]);

    // 네트워크 상태 모니터링
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // 오프라인 상태에서의 변경사항 저장
    const saveOfflineChange = useCallback((change: any) => {
        setOfflineChanges(prev => [...prev, { ...change, timestamp: Date.now() }]);
    }, []);

    // 온라인 복구 시 오프라인 변경사항 동기화
    useEffect(() => {
        if (isOnline && offlineChanges.length > 0) {
            const syncOfflineChanges = async () => {
                try {
                    for (const change of offlineChanges) {
                        // 백엔드에 변경사항 전송
                        const { apiService } = await import('../services/ApiService');
                        await apiService.saveTimetable(change);
                    }

                    setOfflineChanges([]);
                    showSnackbar('오프라인 변경사항이 동기화되었습니다.', 'success');
                } catch (error) {
                    handleApiError(error, showSnackbar);
                }
            };

            syncOfflineChanges();
        }
    }, [isOnline, offlineChanges, showSnackbar]);

    // 인증 상태에 따른 조건부 렌더링
    if (!isAuthenticated || !user?.email) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    useEffect(() => {
        if (pinnedSemester) {
            setSemester(pinnedSemester);
        }
    }, [pinnedSemester]);

    const { courses: timetableSlots, isLoading, saveSchedule } = useSchedule(semester);

    // 데이터 동기화 함수
    const syncDataWithBackend = useCallback(async () => {
        if (!user?.email) return;

        setIsDataSyncing(true);
        try {
            // 백엔드에서 최신 데이터 가져오기
            const { apiService } = await import('../services/ApiService');
            const backendTimetable = await apiService.getCurrentTimetable();

            if (backendTimetable && backendTimetable.courses) {
                // 백엔드 데이터로 업데이트 (단순화)
                await saveSchedule(backendTimetable.courses);
                showSnackbar('시간표가 백엔드와 동기화되었습니다.', 'info');
            } else {
                // 백엔드에 데이터가 없는 경우 (새 사용자 등)
                console.log('[Schedule] No backend timetable found, using local data');
            }

            setLastSyncTime(new Date());
        } catch (error) {
            console.warn('[Schedule] Sync failed, using local data:', error);
            // 에러가 발생해도 로컬 데이터를 사용하도록 함
        } finally {
            setIsDataSyncing(false);
        }
    }, [user?.email, saveSchedule, showSnackbar]);

    // 주기적 데이터 동기화 (5분마다)
    useEffect(() => {
        if (!user?.email) return;

        const syncInterval = setInterval(syncDataWithBackend, 5 * 60 * 1000);
        return () => clearInterval(syncInterval);
    }, [user?.email, syncDataWithBackend]);

    // 페이지 진입 시 데이터 동기화 (한 번만 실행)
    useEffect(() => {
        if (user?.email && !isDataSyncing) {
            // 초기 로드 시에만 동기화
            const timer = setTimeout(() => {
                syncDataWithBackend();
            }, 1000); // 1초 후에 실행

            return () => clearTimeout(timer);
        }
    }, [user?.email]); // syncDataWithBackend와 isDataSyncing 의존성 제거
    // TimetableSlot을 Course로 변환
    const courses = timetableSlots.map(convertTimetableSlotToCourse);
    const { open: openDialog, data: dialogCourse, openDialog: showDialog, closeDialog } = useDialog<Course>();
    const { open: openDetailDialog, data: detailCourse, openDialog: showDetail, closeDialog: closeDetail } = useDialog<Course>();
    const { open: openImageModal, data: imageCourse, openDialog: showImageModal, closeDialog: closeImageModal } = useDialog<Course>();
    const location = useLocation();
    const [highlightCourseId, setHighlightCourseId] = useState<string | null>(null);

    // 커리큘럼에서 전달받은 mock 데이터로 시간표 생성 (데모)
    const fromCurriculum: CurriculumSuggestion | undefined = location.state?.fromCurriculum;
    const [mockCourses, setMockCourses] = useState<any[]>([]);
    useEffect(() => {
        if (fromCurriculum) {
            // 학기 정보는 기본값 사용
            const semester = '2024-2학기';
            const mock = generateMockSchedule(fromCurriculum, semester);
            console.log('[Schedule] fromCurriculum:', fromCurriculum);
            console.log('[Schedule] mockCourses generated:', mock);
            setMockCourses(mock);
        }
    }, [fromCurriculum]);

    useEffect(() => {
        if (location.state?.newScheduleCourseId) {
            setHighlightCourseId(location.state.newScheduleCourseId);
            const timer = setTimeout(() => setHighlightCourseId(null), 2500);
            return () => clearTimeout(timer);
        }
    }, [location.state?.newScheduleCourseId]);

    // 커리큘럼에서 전달받은 데이터 처리
    useEffect(() => {
        if (location.state?.fromCurriculum && location.state?.lectures) {
            const curriculum = location.state.fromCurriculum;
            const lectures = location.state.lectures;

            try {
                // 커리큘럼의 과목들을 시간표 형식으로 변환
                const coursesFromCurriculum = lectures.map((lecture: any, index: number) => {
                    // 필수 필드 검증
                    if (!lecture.courseName) {
                        console.warn('강의명이 없습니다:', lecture);
                        return null;
                    }

                    // 시간 정보 처리 및 검증
                    const dayOfWeek = lecture.dayOfWeek || 'monday';
                    const startTime = lecture.startTime || '09:00';
                    const endTime = lecture.endTime || '10:30';

                    // 시간대별 교시 매핑 (실제 시간표 시스템에 맞게 조정 필요)
                    const timeToPeriod = (time: string) => {
                        const hour = parseInt(time.split(':')[0]);
                        if (hour < 9) return 1;
                        if (hour < 10) return 2;
                        if (hour < 11) return 3;
                        if (hour < 12) return 4;
                        if (hour < 13) return 5;
                        if (hour < 14) return 6;
                        if (hour < 15) return 7;
                        if (hour < 16) return 8;
                        if (hour < 17) return 9;
                        return 10;
                    };

                    const startPeriod = lecture.startPeriod || timeToPeriod(startTime);
                    const endPeriod = lecture.endPeriod || (startPeriod + 1);

                    return {
                        id: `curriculum_${lecture.id || index}`,
                        name: lecture.courseName,
                        code: lecture.courseCode || `CURR${lecture.id || index}`,
                        instructor: lecture.instructor || 'AI 추천',
                        credits: lecture.credits || 3,
                        type: lecture.type || 'elective' as const,
                        day: dayOfWeek,
                        startTime: startTime,
                        endTime: endTime,
                        startPeriod: startPeriod,
                        endPeriod: endPeriod,
                        room: lecture.room || 'TBD',
                    };
                }).filter(Boolean); // null 값 제거

                if (coursesFromCurriculum.length === 0) {
                    showSnackbar('유효한 강의 정보가 없습니다.', 'warning');
                    return;
                }

                // 시간표에 저장 (Course[] 타입으로 직접 전달)
                saveSchedule(coursesFromCurriculum);

                showSnackbar(`${curriculum.name} 커리큘럼의 시간표가 생성되었습니다! (${coursesFromCurriculum.length}개 과목)`, 'success');

                // 하이라이트 효과
                if (coursesFromCurriculum.length > 0) {
                    setHighlightCourseId(coursesFromCurriculum[0].id);
                    const timer = setTimeout(() => setHighlightCourseId(null), 2500);
                    return () => clearTimeout(timer);
                }
            } catch (error) {
                console.error('시간표 생성 중 오류 발생:', error);
                showSnackbar('시간표 생성 중 오류가 발생했습니다.', 'error');
            }
        }
    }, [location.state?.fromCurriculum, location.state?.lectures, saveSchedule, showSnackbar]);

    useEffect(() => {
        if (fromCurriculum && mockCourses.length > 0) {
            (async () => {
                console.log('[Schedule] saveSchedule called with mockCourses:', mockCourses);
                await saveSchedule(mockCourses);
            })();
        }
    }, [fromCurriculum, mockCourses, saveSchedule]);

    // TimetableGrid 렌더링 직전 실제 courses 로그
    console.log('[Schedule] TimetableGrid courses:', courses);

    // 추가 버튼 메뉴 상태
    const [addMenuAnchor, setAddMenuAnchor] = useState<null | HTMLElement>(null);
    const addButtonRef = useRef<HTMLButtonElement | null>(null);
    const handleAddButtonClick = (e: React.MouseEvent<HTMLElement>) => setAddMenuAnchor(e.currentTarget);
    const handleAddMenuClose = () => setAddMenuAnchor(null);

    // FAB 메뉴 상태
    const [fabMenuAnchor, setFabMenuAnchor] = useState<null | HTMLElement>(null);
    const handleFabClick = (e: React.MouseEvent<HTMLElement>) => setFabMenuAnchor(e.currentTarget);
    const handleFabMenuClose = () => setFabMenuAnchor(null);

    // 수동 추가/수정/삭제
    const handleAddCourse = () => showDialog();
    const handleEditCourse = (course: Course) => showDialog(course);
    const handleSaveCourse = async (courseData: Partial<Course>) => {
        try {
            let newCourses: Course[];
            if (dialogCourse) {
                newCourses = courses.map(course =>
                    course.id === dialogCourse.id
                        ? { ...course, ...courseData } as Course
                        : course
                );
            } else {
                const newCourse: Course = {
                    id: Date.now().toString(),
                    name: '새 과목',
                    ...courseData,
                } as Course;
                newCourses = [...courses, newCourse];
            }
            // 오프라인 모드 체크
            if (!isOnline) {
                await saveSchedule(newCourses);
                saveOfflineChange({
                    semester,
                    courses: newCourses,
                    timestamp: Date.now()
                });
                showSnackbar('과목이 로컬에 저장되었습니다. (오프라인 모드)', 'warning');
            } else {
                await saveSchedule(newCourses);
                showSnackbar('과목이 저장되었습니다.', 'success');
            }
            closeDialog();
        } catch (error) {
            handleApiError(error, showSnackbar);
        }
    };

    const handleDeleteCourse = async (id: string) => {
        try {
            const newCourses = courses.filter(course => course.id !== id);

            // 오프라인 모드 체크
            if (!isOnline) {
                await saveSchedule(newCourses);
                saveOfflineChange({
                    semester,
                    courses: newCourses,
                    timestamp: Date.now()
                });
                showSnackbar('과목이 로컬에서 삭제되었습니다. (오프라인 모드)', 'warning');
            } else {
                await saveSchedule(newCourses);
                showSnackbar('과목이 삭제되었습니다.', 'success');
            }
            closeDialog();
        } catch (error) {
            handleApiError(error, showSnackbar);
        }
    };
    // 이미지 업로드
    const handleImageUpload = (file: File) => {
        showSnackbar('이미지가 업로드되었습니다.', 'success');
        closeImageModal();
    };
    // 핀셋 아이콘 클릭 핸들러
    const handlePinClick = () => {
        if (!user?.email) return;
        if (semester === pinnedSemester) {
            updateSettings({ pinnedSemester: '' });
        } else {
            updateSettings({ pinnedSemester: semester });
        }
    };
    // 학기 변경
    const handleSemesterChange = (e: SelectChangeEvent) => {
        setSemester(e.target.value);
    };

    // 초기화 다이얼로그 상태
    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    const handleResetClick = () => setResetDialogOpen(true);
    const handleResetCancel = () => setResetDialogOpen(false);
    const handleResetConfirm = async () => {
        try {
            await saveSchedule([]);
            showSnackbar('시간표가 초기화되었습니다.', 'success');
        } catch (error) {
            handleApiError(error, showSnackbar);
        }
        setResetDialogOpen(false);
    };

    return (
        <Box sx={{ p: { xs: 1, md: 3 }, mt: 8, minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default', overflowY: 'auto' }}>
            <Header
                semester={semester}
                semesterOptions={semesterOptions}
                onSemesterChange={handleSemesterChange}
                onAddClick={handleAddButtonClick}
                addButtonRef={addButtonRef}
                pinnedSemester={pinnedSemester}
                onPinClick={handlePinClick}
                onResetClick={handleResetClick}
            />

            {/* 동기화 상태 표시 */}
            {isDataSyncing && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="body2" color="info.contrastText">
                        백엔드와 동기화 중...
                    </Typography>
                </Box>
            )}

            {/* 네트워크 상태 표시 */}
            {!isOnline && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
                    <Typography variant="body2" color="warning.contrastText">
                        오프라인 모드 - 변경사항은 로컬에 저장됩니다
                    </Typography>
                </Box>
            )}

            {/* 오프라인 변경사항 표시 */}
            {offlineChanges.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
                    <Typography variant="body2" color="warning.contrastText">
                        {offlineChanges.length}개의 오프라인 변경사항이 대기 중입니다
                    </Typography>
                </Box>
            )}

            {/* 마지막 동기화 시간 표시 */}
            {lastSyncTime && !isDataSyncing && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                        마지막 동기화: {lastSyncTime.toLocaleTimeString()}
                    </Typography>
                </Box>
            )}

            {/* 데모용 mock 시간표 카드 */}
            {fromCurriculum && (
                <Paper sx={{ mb: 4, p: 3, border: '2px solid #38bdf8', background: '#f0f9ff' }}>
                    <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
                        생성된 시간표 (데모)
                    </Typography>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>{fromCurriculum.title}</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{fromCurriculum.description}</Typography>
                    {mockCourses.length > 0 ? (
                        <Box>
                            {mockCourses.map((course, idx) => (
                                <Box key={idx} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="subtitle1" fontWeight={700} color="primary" sx={{ minWidth: 90 }}>{course.day}</Typography>
                                    <Typography variant="body2" sx={{ minWidth: 120 }}>{course.name}</Typography>
                                    <Typography variant="body2">{course.startTime}~{course.endTime}</Typography>
                                    <Typography variant="body2" color="text.secondary">{course.room}, {course.instructor}</Typography>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Typography color="text.secondary">생성된 시간표가 없습니다.</Typography>
                    )}
                </Paper>
            )}

            <MuiMenu anchorEl={addMenuAnchor} open={!!addMenuAnchor} onClose={handleAddMenuClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <MuiMenuItem onClick={handleAddCourse}>직접 추가</MuiMenuItem>
                <MuiMenuItem onClick={() => { showImageModal(); handleAddMenuClose(); }}>
                    이미지로 추가
                    <Image sx={{ ml: 1, fontSize: 22 }} />
                </MuiMenuItem>
            </MuiMenu>

            <Paper elevation={3} sx={{ p: 2, mb: 2, bgcolor: 'white', backdropFilter: 'blur(8px)', borderRadius: 4, boxShadow: 4, transition: 'box-shadow 0.2s' }}>
                <TimetableGrid
                    courses={fromCurriculum && mockCourses.length > 0 ? mockCourses : courses}
                    onCourseClick={handleEditCourse}
                    highlightCourseId={highlightCourseId}
                />
            </Paper>

            <Suspense fallback={<CircularProgress />}>
                <CourseEditModal
                    open={openDialog}
                    onClose={closeDialog}
                    onSave={handleSaveCourse}
                    course={dialogCourse}
                    onDelete={handleDeleteCourse}
                />
            </Suspense>

            <Suspense fallback={<CircularProgress />}>
                <CourseDetailModal
                    open={openDetailDialog}
                    onClose={closeDetail}
                    course={detailCourse}
                />
            </Suspense>

            <ImageUploadModal open={openImageModal} onClose={closeImageModal} onUpload={handleImageUpload} />

            <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={closeSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={closeSnackbar} severity={severity || 'success'} sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>

            {/* 로딩 상태 개선 */}
            <Backdrop
                open={isLoading || isDataSyncing}
                sx={{
                    zIndex: 2000,
                    color: '#fff',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                }}
            >
                <CircularProgress color="inherit" />
                <Typography variant="body1" color="inherit">
                    {isDataSyncing ? '백엔드와 동기화 중...' : '데이터를 불러오는 중...'}
                </Typography>
            </Backdrop>

            <Dialog open={resetDialogOpen} onClose={handleResetCancel} TransitionComponent={Fade} keepMounted>
                <DialogTitle>시간표 초기화</DialogTitle>
                <DialogContent>
                    <Typography>정말로 이 학기의 시간표를 모두 삭제하시겠습니까?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleResetCancel}>취소</Button>
                    <Button onClick={handleResetConfirm} color="error" variant="contained">초기화</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Schedule; 
