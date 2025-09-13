// src/pages/Schedule.tsx

import React, { useState, useCallback, lazy, Suspense, useRef, useEffect } from 'react';
import { Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem, Button, Snackbar, Alert, CircularProgress, Fab, Backdrop, IconButton, Tooltip, Fade, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Menu as MuiMenu, MenuItem as MuiMenuItem } from '@mui/material';
import { School, Image, Add } from '@mui/icons-material';
import { SelectChangeEvent } from '@mui/material/Select';
import FabAddCourse from '../components/FabAddCourse';
import type { Course } from '../types/course';
import { useAuth } from '../contexts/AuthContext';
import { useSchedule, useData } from '../contexts/SeparatedDataContext';
import TimetableGrid from '../components/timetable/TimetableGrid';
import { useLocation } from 'react-router-dom';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { ApiError, ErrorCode } from '../errors/ApiError';
import apiClient from '../config/apiClient';
import { slotToCourse, courseToSlot, reverseDayMap } from "@/utils/mapper";
import { apiService } from '../services/ApiService';

const CourseEditModal = lazy(() => import('../components/modals/CourseEditModal'));
const CourseDetailModal = lazy(() => import('../components/modals/CourseDetailModal'));

const ExcelUploadModal = ({ open, onClose, onUpload }: { 
    open: boolean; 
    onClose: () => void; 
    onUpload: (file: File) => void; 
}) => (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle>시간표 엑셀 업로드</DialogTitle>
        <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                포털 사이트에 접속하여 <b>학적 → 학적정보조회 → 수강내역</b> 메뉴에서 
                해당 연도를 선택한 뒤, <b>엑셀 다운로드</b> 버튼을 눌러 받은 파일을 업로드해주세요.
            </Typography>
            <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                    if (e.target.files?.[0]) {
                        onUpload(e.target.files[0]);
                    }
                }}
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>취소</Button>
        </DialogActions>
    </Dialog>
);

// 커스텀 훅들
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
            case ErrorCode.VALIDATION_ERROR:
                showSnackbar('입력 데이터를 확인해주세요.', 'error');
                break;
            case ErrorCode.NETWORK_ERROR:
                showSnackbar('네트워크 연결을 확인해주세요.', 'error');
                break;
            default:
                showSnackbar('오류가 발생했습니다. 다시 시도해주세요.', 'error');
        }
    } else {
        showSnackbar('예상치 못한 오류가 발생했습니다.', 'error');
    }
};

const Schedule: React.FC = () => {
    const { isAuthenticated, user } = useAuth();
    const { userData, updateSettings } = useData();
    const { open: snackbarOpen, message, severity, showSnackbar, closeSnackbar } = useSnackbar();

    // 인증 체크
    useEffect(() => {
        if (!isAuthenticated || !user?.email) {
            window.location.href = '/login';
            return;
        }
    }, [isAuthenticated, user?.email]);

    const [semesterOptions, setSemesterOptions] = useState<string[]>([]);
    const pinnedSemester = userData?.settings?.pinnedSemester || '';
    
    const getCurrentSemester = () => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const month = now.getMonth() + 1;
        
        const currentSem = (month >= 1 && month <= 6) ? 1 : 2;
        return `${currentYear}-${currentSem}학기`;
    };

    const [semester, setSemester] = useState<string>(pinnedSemester || getCurrentSemester());
    
    // 학기 목록 로딩
    useEffect(() => {
        (async () => {
            try {
                const { apiService } = await import('../services/ApiService');
                const list = await apiService.getSemesters();
                setSemesterOptions(list || []);

                if (pinnedSemester && list?.includes(pinnedSemester)) {
                    setSemester(pinnedSemester);
                } else if (list?.length && !semester) {
                    setSemester(list[list.length - 1]);
                }
            } catch (e) {
                console.error('학기 목록 조회 실패:', e);
                showSnackbar('학기 목록을 불러오는데 실패했습니다.', 'error');
            }
        })();
    }, [pinnedSemester, semester, showSnackbar]);

    // 데이터 동기화 상태 관리
    const [isDataSyncing, setIsDataSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

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
    
    useEffect(() => {
        console.log('=== Schedule.tsx 학기 변경 감지 ===');
        console.log('현재 semester 상태:', semester);
    }, [semester]);

    const { courses: timetableSlots, isLoading, saveSchedule, setLocalCourses, updateLocalOnly } = useSchedule(semester);

    // 서버와 동기화하는 함수
    const syncWithBackend = useCallback(async (newCourses: Course[]) => {
        if (!user?.email || !semester) return false;

        try {
            const { apiService } = await import('../services/ApiService');

            const backendCourses = newCourses.map(course => ({
                name: course.name,
                code_id: course.code ? String(course.code) : null,
                professor: course.instructor,
                credits: course.credits,
                room: course.room,
                type: course.type,
                schedule: [
                    {
                        day: reverseDayMap[course.day],
                        startPeriod: course.startPeriod,
                        endPeriod: course.endPeriod,
                        start_end: `${course.startTime}~${course.endTime}`
                    }
                ]
            }));

            console.log('[DEBUG] 백엔드 전송 데이터:', { semester, courses: backendCourses });

            await apiService.saveTimetable({
                semester,
                courses: backendCourses,
                updatedAt: new Date().toISOString(),
                isGenerated: false
            });

            return true;
        } catch (error) {
            console.error('[DEBUG] 백엔드 동기화 실패:', error);
            throw error;
        }
    }, [user?.email, semester]);

    // 데이터 동기화 함수
    const syncDataWithBackend = useCallback(async () => {
        if (!user?.email) return;

        setIsDataSyncing(true);
        try {
            const { apiService } = await import('../services/ApiService');
            const backendTimetable = await apiService.getCurrentTimetable(semester);
            console.log('[DEBUG] backendTimetable raw:', JSON.stringify(backendTimetable, null, 2));
            
            // 백엔드에서 가져온 데이터를 화면에 즉시 반영
            if (backendTimetable?.TimetableSlots && backendTimetable.TimetableSlots.length > 0) {
                const latestCourses = backendTimetable.TimetableSlots
                    .filter(slot => slot.courseName && slot.dayOfWeek) // 유효한 데이터만 필터링
                    .map(slotToCourse);
                
                updateLocalOnly(latestCourses);
                console.log(`[DEBUG] 동기화 완료: ${latestCourses.length}개 과목 반영`);
                showSnackbar(`${latestCourses.length}개 과목이 동기화되었습니다.`, 'success');
            } else {
                updateLocalOnly([]);
                showSnackbar('동기화 완료: 저장된 과목이 없습니다.', 'info');
            }
                
            setLastSyncTime(new Date());
        } catch (error) {
            console.warn('[Schedule] Sync failed:', error);
            handleApiError(error, showSnackbar);
            showSnackbar('동기화에 실패했습니다. 다시 시도해주세요.', 'error');
        } finally {
            setIsDataSyncing(false);
        }
    }, [user?.email, semester, showSnackbar, updateLocalOnly]);    

    useEffect(() => {
        if (!user?.email) return;

        const syncInterval = setInterval(syncDataWithBackend, 5 * 60 * 1000);
        return () => clearInterval(syncInterval);
    }, [user?.email, syncDataWithBackend]);

    // 페이지 진입 시 데이터 동기화
    useEffect(() => {
        if (user?.email && !isDataSyncing) {
            const timer = setTimeout(() => {
                syncDataWithBackend();
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [user?.email, syncDataWithBackend]);

    useEffect(() => {
        console.log('=== Schedule.tsx 디버깅 ===');
        console.log('timetableSlots:', timetableSlots);
        console.log('timetableSlots 길이:', timetableSlots?.length);
        console.log('isLoading:', isLoading);
        console.log('semester:', semester);
        
        if (timetableSlots && timetableSlots.length > 0) {
            console.log('Schedule.tsx에서 과목 감지!');
            console.log('첫 번째 과목 샘플:', timetableSlots[0]);
            console.log('모든 과목:', timetableSlots.map(c => `${c.name} (${c.day})`));
        } else {
            console.log('Schedule.tsx에서 timetableSlots가 비어있음');
            console.log('timetableSlots 타입:', typeof timetableSlots);
            console.log('timetableSlots === null?', timetableSlots === null);
            console.log('timetableSlots === undefined?', timetableSlots === undefined);
        }
        
        // TimetableGrid에 전달되는 props도 확인
        console.log('TimetableGrid에 전달할 courses:', timetableSlots);
    }, [timetableSlots, isLoading, semester]);

    // TimetableSlot을 Course로 변환
    const courses = timetableSlots;
    console.log('[DEBUG] 최종 courses (Schedule.tsx):', courses);
    console.log('[DEBUG] courses === timetableSlots?', courses === timetableSlots);
    const { open: openDialog, data: dialogCourse, openDialog: showDialog, closeDialog } = useDialog<Course>();
    const { open: openDetailDialog, data: detailCourse, openDialog: showDetail, closeDialog: closeDetail } = useDialog<Course>();
    const { open: openExcelModal, data: imageCourse, openDialog: showExcelModal, closeDialog: closeExcelModal } = useDialog<Course>();
    const location = useLocation();
    const [highlightCourseId, setHighlightCourseId] = useState<number | null>(null);

    // 추가 버튼 메뉴 상태
    const [addMenuAnchor, setAddMenuAnchor] = useState<null | HTMLElement>(null);
    const addButtonRef = useRef<HTMLButtonElement | null>(null);
    const handleAddButtonClick = (e: React.MouseEvent<HTMLElement>) => setAddMenuAnchor(e.currentTarget);
    const handleAddMenuClose = () => setAddMenuAnchor(null);

    // FAB 메뉴 상태
    const [fabMenuAnchor, setFabMenuAnchor] = useState<null | HTMLElement>(null);
    const handleFabClick = (e: React.MouseEvent<HTMLElement>) => setFabMenuAnchor(e.currentTarget);
    const handleFabMenuClose = () => setFabMenuAnchor(null);

    // 과목 저장 함수
    const handleSaveCourse = async (courseData: Partial<Course>) => {
        console.log('[DEBUG] 전송할 데이터:', courseData);

        try {
            const sanitizedCourse: Course = {
                id: courseData.id || Date.now(),
                name: courseData.name || '새 과목',
                code: courseData.code || '',
                instructor: courseData.instructor || '',
                credits: Number(courseData.credits) || 3,
                type: courseData.type || 'GE',
                day: courseData.day || 'monday',
                startPeriod: Math.max(1, Math.min(14, Number(courseData.startPeriod) || 1)),
                endPeriod: Math.max(1, Math.min(14, Number(courseData.endPeriod) || 1)),
                startTime: courseData.startTime || '09:00',
                endTime: courseData.endTime || '10:30',
                room: courseData.room || '',
            };

            let currentTimetable;
            try {
                currentTimetable = await apiService.getTimetableBySemester(semester);
            } catch (error) {
                console.log('[DEBUG] 시간표가 존재하지 않음, 새로 생성 예정');
                currentTimetable = null;
            }

            const existingCourses = currentTimetable?.TimetableSlots || [];
            let finalCourses;

            if (dialogCourse) {
                const targetSlot = existingCourses.find(slot => 
                    slot.id.toString() === dialogCourse.id.toString()
                );
                
                if (!targetSlot) {
                    throw new Error('수정할 슬롯을 찾을 수 없습니다.');
                }

                const targetCodeId = targetSlot.codeId;
                const targetCourseName = targetSlot.courseName;
                
                const sameCodeSlots = existingCourses.filter(slot => {
                    if (targetCodeId && slot.codeId) {
                        return slot.codeId === targetCodeId;
                    }
                    return slot.courseName === targetCourseName && !slot.codeId;
                });

                const updatedSlots = sameCodeSlots.map(slot => ({
                    name: sanitizedCourse.name,
                    code_id: slot.codeId,
                    professor: sanitizedCourse.instructor,
                    credits: sanitizedCourse.credits,
                    room: sanitizedCourse.room || slot.room,
                    type: sanitizedCourse.type || slot.type,
                    schedule: [
                        {
                            day: reverseDayMap[slot.dayOfWeek as keyof typeof reverseDayMap] || slot.dayOfWeek,
                            startPeriod: slot.startPeriod,
                            endPeriod: slot.endPeriod,
                            start_end: `${slot.startTime}~${slot.endTime}`
                        }
                    ]
                }));

                const otherSlots = existingCourses.filter(slot => {
                    if (targetCodeId && slot.codeId) {
                        return slot.codeId !== targetCodeId;
                    }
                    return !(slot.courseName === targetCourseName && !slot.codeId);
                });

                const otherCourses = otherSlots.map(slot => ({
                    name: slot.courseName,
                    code_id: slot.codeId,
                    professor: slot.instructor,
                    credits: slot.credits,
                    room: slot.room,
                    type: slot.type,
                    color: slot.color,
                    schedule: [
                        {
                            day: reverseDayMap[slot.dayOfWeek as keyof typeof reverseDayMap] || slot.dayOfWeek,
                            startPeriod: slot.startPeriod,
                            endPeriod: slot.endPeriod,
                            start_end: `${slot.startTime}~${slot.endTime}`
                        }
                    ]
                }));
                
                finalCourses = [...otherCourses, ...updatedSlots];

            } else {
                const backendCourse = {
                    name: sanitizedCourse.name,
                    code_id: sanitizedCourse.code ? String(sanitizedCourse.code) : null,
                    professor: sanitizedCourse.instructor,
                    credits: sanitizedCourse.credits,
                    room: sanitizedCourse.room,
                    type: sanitizedCourse.type,
                    schedule: [
                        {
                            day: reverseDayMap[sanitizedCourse.day],
                            startPeriod: sanitizedCourse.startPeriod,
                            endPeriod: sanitizedCourse.endPeriod,
                            start_end: `${sanitizedCourse.startTime}~${sanitizedCourse.endTime}`
                        }
                    ]
                };

                const existingApiCourses = existingCourses.map(slot => ({
                    name: slot.courseName,
                    code_id: slot.LectureCode?.code || null,
                    professor: slot.instructor,
                    credits: slot.credits,
                    room: slot.room,
                    type: slot.type,
                    color: slot.color,
                    schedule: [
                        {
                            day: reverseDayMap[slot.dayOfWeek as keyof typeof reverseDayMap] || slot.dayOfWeek,
                            startPeriod: slot.startPeriod,
                            endPeriod: slot.endPeriod,
                            start_end: `${slot.startTime}~${slot.endTime}`
                        }
                    ]
                }));
                
                finalCourses = [...existingApiCourses, backendCourse];
            }
            
            await apiService.saveTimetable({
                semester,
                courses: finalCourses,
                updatedAt: new Date().toISOString(),
                isGenerated: false
            });

            const updatedTimetable = await apiService.getTimetableBySemester(semester);
            if (updatedTimetable?.TimetableSlots) {
                const latestCourses = updatedTimetable.TimetableSlots.map(slotToCourse);
                setLocalCourses(latestCourses);
            }

            showSnackbar('과목이 저장되었습니다.', 'success');
            closeDialog();
        } catch (error) {
            console.error('[DEBUG] 저장 실패:', error);
            handleApiError(error, showSnackbar);
        }
    };

    // 과목 삭제 함수
    const handleDeleteCourse = async (id: number) => {
        try {
            await apiClient.delete(`/timetable/course/${semester}/${id}`);

            const latestTimetable = await apiService.getTimetableBySemester(semester);
            if (latestTimetable?.TimetableSlots) {
                const latestCourses = latestTimetable.TimetableSlots.map(slotToCourse);
                setLocalCourses(latestCourses);
            } else {
                setLocalCourses([]);
            }

            showSnackbar('과목이 삭제되었습니다.', 'success');
            closeDialog();
        } catch (error: any) {
            console.error('[DEBUG] 삭제 실패:', error);
            if (error?.response?.data?.message) {
                showSnackbar(`삭제 실패: ${error.response.data.message}`, 'error');
            } else {
                showSnackbar('과목 삭제에 실패했습니다. 다시 시도해주세요.', 'error');
            }
        }
    };

    // 시간표 초기화 함수
    const handleResetConfirm = async () => {
        try {
            const { apiService } = await import('../services/ApiService');
            
            // schedule 자체를 삭제하는 새 API 호출
            await apiService.deleteTimetable(semester);
            
            setLocalCourses([]);
            showSnackbar('시간표가 완전히 삭제되었습니다.', 'success');
            setResetDialogOpen(false);
        } catch (error) {
            handleApiError(error, showSnackbar);
        }
    };

    // 기타 핸들러들
    const handleAddCourse = () => showDialog();
    const handleEditCourse = (course: Course) => showDialog(course);
    const handleExcelUpload = async (file: File) => {
        try {
            showSnackbar('엑셀 업로드 중...', 'info');

            const formData = new FormData();
            formData.append('file', file);
            formData.append('semester', semester);

            const response = await apiClient.post('/timetable/upload-excel', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data?.success) {
                try {
                    const { apiService } = await import('../services/ApiService');
                    const backendTimetable = await apiService.getTimetableBySemester(semester);
                    
                    if (backendTimetable?.TimetableSlots && backendTimetable.TimetableSlots.length > 0) {
                        const latestCourses = backendTimetable.TimetableSlots.map(slotToCourse);
                        
                        setLocalCourses(latestCourses); // 직접 상태 업데이트
                        
                        showSnackbar(`${latestCourses.length}개 과목이 반영되었습니다.`, 'success');
                    } else {
                        showSnackbar('엑셀 업로드는 성공했지만 과목 데이터를 가져오지 못했습니다.', 'warning');
                    }
                } catch (fetchError) {
                    console.error('업로드 후 데이터 조회 실패:', fetchError);
                    showSnackbar('엑셀 업로드는 성공했습니다. 새로고침하여 확인해주세요.', 'success');
                }
            } else {
                showSnackbar('엑셀 업로드 실패: ' + (response.data?.message || '알 수 없는 오류'), 'error');
            }
        } catch (error) {
            console.error('엑셀 업로드 실패:', error);
            showSnackbar('엑셀 업로드 실패. 파일을 확인해주세요.', 'error');
        } finally {
            closeExcelModal();
        }
    };

    const handlePinClick = () => {
        if (!user?.email) return;
        if (semester === pinnedSemester) {
            updateSettings({ pinnedSemester: '' });
        } else {
            updateSettings({ pinnedSemester: semester });
        }
    };

    const handleSemesterChange = (e: SelectChangeEvent) => {
        const newSemester = e.target.value;
        console.log(`[Schedule] 학기 변경: ${semester} -> ${newSemester}`);
        setSemester(newSemester);
    };

    // 초기화 다이얼로그 상태
    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    const handleResetClick = () => setResetDialogOpen(true);
    const handleResetCancel = () => setResetDialogOpen(false);

    return (
        <Box sx={{ flexGrow: 1, p: 3, minHeight: '100vh' }}>
            {/* 헤더 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <School sx={{ fontSize: 'inherit' }} />
                    시간표
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* 마지막 동기화 시간 */}
                    {lastSyncTime && (
                        <Typography variant="caption" color="text.secondary">
                            마지막 동기화: {lastSyncTime.toLocaleTimeString()}
                        </Typography>
                    )}

                    {/* 학기 선택 */}
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>학기</InputLabel>
                        <Select
                            value={semester}
                            label="학기"
                            onChange={handleSemesterChange}
                        >
                            {semesterOptions.map((sem) => (
                                <MenuItem key={sem} value={sem}>
                                    {sem}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* 핀 버튼 */}
                    <Tooltip title={semester === pinnedSemester ? '고정 해제' : '학기 고정'}>
                        <IconButton onClick={handlePinClick}>
                            {semester === pinnedSemester ? <PushPinIcon /> : <PushPinOutlinedIcon />}
                        </IconButton>
                    </Tooltip>

                    {/* 동기화 버튼 */}
                    <Tooltip title="동기화">
                        <IconButton onClick={syncDataWithBackend} disabled={isDataSyncing}>
                            <RestartAltIcon />
                        </IconButton>
                    </Tooltip>

                    {/* 초기화 버튼 */}
                    <Tooltip title="시간표 초기화">
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleResetClick}
                            size="small"
                        >
                            초기화
                        </Button>
                    </Tooltip>

                    {/* 추가 버튼 */}
                    <Button
                        ref={addButtonRef}
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleAddButtonClick}
                    >
                        과목 추가
                    </Button>
                </Box>
            </Box>

            {/* 시간표 그리드 */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <TimetableGrid
                    courses={courses}
                    onCourseClick={handleEditCourse}
                    highlightCourseId={highlightCourseId}
                />
            </Paper>

            {/* 추가 메뉴 */}
            <MuiMenu
                anchorEl={addMenuAnchor}
                open={Boolean(addMenuAnchor)}
                onClose={handleAddMenuClose}
            >
                <MuiMenuItem onClick={() => { handleAddCourse(); handleAddMenuClose(); }}>
                    직접 추가
                </MuiMenuItem>
                <MuiMenuItem onClick={() => { showExcelModal(); handleAddMenuClose(); }}>
                    <Image sx={{ mr: 1 }} />
                    엑셀로 추가
                </MuiMenuItem>
            </MuiMenu>

            {/* 모달들 */}
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

            <ExcelUploadModal 
                open={openExcelModal} 
                onClose={closeExcelModal} 
                onUpload={handleExcelUpload} 
            />

            {/* 스낵바 */}
            <Snackbar 
                open={snackbarOpen} 
                autoHideDuration={4000} 
                onClose={closeSnackbar} 
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={closeSnackbar} severity={severity || 'success'} sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>

            {/* 로딩 백드롭 */}
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
                    {isDataSyncing ? '동기화 중...' : '데이터를 불러오는 중...'}
                </Typography>
            </Backdrop>

            {/* 초기화 확인 다이얼로그 */}
            <Dialog open={resetDialogOpen} onClose={handleResetCancel} TransitionComponent={Fade} keepMounted>
                <DialogTitle>시간표 초기화</DialogTitle>
                <DialogContent>
                    <Typography>정말로 이 학기의 시간표를 모두 삭제하시겠습니까?</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        이 작업은 백엔드에서도 삭제되며 되돌릴 수 없습니다.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleResetCancel}>취소</Button>
                    <Button onClick={handleResetConfirm} color="error" variant="contained">
                        초기화
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Schedule;