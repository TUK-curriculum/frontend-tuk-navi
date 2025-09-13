import React, { Suspense, lazy, useState, useTransition, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import {
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  Button,
  Avatar,
  IconButton,
  CircularProgress,
  Skeleton,
  Badge,
  Popover,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Chat as ChatIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

import { lightTheme } from './theme';

import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SeparatedDataProvider, useData } from './contexts/SeparatedDataContext';
import { SetupProvider } from './contexts/SetupContext';
import { setupDevTools } from './utils/devUtils';
import { migrateAllLegacyData, isMigrationRequired } from './utils/migrationUtils';
import ProtectedRoute from './components/ProtectedRoute';
import AuthGuard from './components/AuthGuard';
import FloatingMemoButton from './components/common/FloatingMemoButton';
import MemoApp from './components/common/MemoApp';
import InterestSelection from './pages/InterestSelection';
import { NotificationProvider } from './components/common/NotificationSystem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Lazy load pages for code splitting
const Intro = lazy(() => import('./pages/Intro'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Curriculum = lazy(() => import('./pages/Curriculum'));
const Chatbot = lazy(() => import('./pages/Chatbot'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Schedule = lazy(() => import('./pages/Schedule'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const SecurityTest = lazy(() => import('./pages/SecurityTest'));
const CompletedCourses = lazy(() => import('./pages/CompletedCourses'));
const CourseSetup = lazy(() => import('./pages/CourseSetup'));
const AccountSettings = lazy(() => import('./pages/AccountSettings'));

// 스켈레톤 UI 컴포넌트
const PageSkeleton = () => (
  <Box sx={{ p: 3 }}>
    <Skeleton variant="rectangular" height={200} sx={{ mb: 2, borderRadius: 2 }} />
    <Skeleton variant="text" height={32} sx={{ mb: 1 }} />
    <Skeleton variant="text" height={24} sx={{ mb: 2 }} />
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 2 }} />
      <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 2 }} />
    </Box>
    <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
  </Box>
);

// 프리로딩 훅
const usePreloadPages = () => {
  useEffect(() => {
    // 자주 방문하는 페이지들을 미리 로딩
    const preloadPages = () => {
      // 대시보드와 커리큘럼은 가장 자주 방문하는 페이지
      // 백그라운드에서 미리 로딩
      setTimeout(() => {
        // 컴포넌트를 미리 로드하여 캐시에 저장
        import('./pages/Dashboard');
        import('./pages/Curriculum');
        import('./pages/Schedule');
        import('./pages/Chatbot');
      }, 2000);
    };

    preloadPages();
  }, []);
};

function AppBarNav({ onOpenOnboarding, onOpenAccountSettings }: { onOpenOnboarding: () => void, onOpenAccountSettings: () => void }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isPending, startTransition] = useTransition();
  const { userData } = useData();

  const location = useLocation()
  const isActive = (path: string) => location.pathname === path;

  // 알림/프로필 메뉴 상태
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  // 더미 알림 데이터
  const [notifications, setNotifications] = useState([
    { id: 1, text: '새로운 공지사항이 있습니다.', read: false },
    { id: 2, text: '시간표가 업데이트되었습니다.', read: false },
    { id: 3, text: '졸업요건이 변경되었습니다.', read: true },
  ]);
  const unreadCount = notifications.filter(n => !n.read).length;

  const isAdmin = user?.userId === 6;

  const handleNavigation = (path: string) => {
    startTransition(() => {
      navigate(path);
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // 챗봇 버튼 클릭 핸들러
  const handleChatbotClick = async () => {
    handleNavigation('/chatbot');
  };

  // 알림 클릭 시 읽음 처리
  const handleNotifClick = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'rgba(255,255,255,0.95)',
        color: 'text.primary',
        boxShadow: '0 2px 16px 0 rgba(0,0,0,0.06)',
        borderBottom: '1px solid #e5e7eb',
        backdropFilter: 'blur(8px)',
        minWidth: '1200px'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 4, minHeight: 64, minWidth: '1200px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }} onClick={() => handleNavigation('/dashboard')}>
          <span style={{ fontWeight: 700, fontSize: '1.75rem', color: '#0ea5e9', letterSpacing: '-0.025em' }}>TUK NAVI</span>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            startIcon={<DashboardIcon sx={{ fontSize: 20 }} />}
            sx={{
              color: isActive('/dashboard') ? 'text.primary' : 'text.secondary',
              fontWeight: isActive('/dashboard') ? 700 : 600,
              bgcolor: isActive('/dashboard') ? 'primary.50' : 'transparent',
              px: 2,
              borderRadius: 2,
              '&:hover': { bgcolor: 'primary.50' },
              transition: 'all 0.2s ease-in-out'
            }}
            onClick={() => handleNavigation('/dashboard')}
            disabled={isPending}
          >
            대시보드
          </Button>
          <Button
            startIcon={<SchoolIcon sx={{ fontSize: 20 }} />}
            sx={{
              color: isActive('/curriculum') ? 'text.primary' : 'text.secondary',
              fontWeight: isActive('/curriculum') ? 700 : 600,
              bgcolor: isActive('/curriculum') ? 'primary.50' : 'transparent',
              px: 2,
              borderRadius: 2,
              '&:hover': { bgcolor: 'primary.50' },
              transition: 'all 0.2s ease-in-out'
            }}
            onClick={() => handleNavigation('/curriculum')}
            disabled={isPending}
          >
            커리큘럼
          </Button>
          <Button
            startIcon={<ScheduleIcon sx={{ fontSize: 20 }} />}
            sx={{
              color: isActive('/schedule') ? 'text.primary' : 'text.secondary',
              fontWeight: isActive('/schedule') ? 700 : 600,
              bgcolor: isActive('/schedule') ? 'primary.50' : 'transparent',
              px: 2,
              borderRadius: 2,
              '&:hover': { bgcolor: 'primary.50' },
              transition: 'all 0.2s ease-in-out'
            }}
            onClick={() => handleNavigation('/schedule')}
            disabled={isPending}
          >
            시간표
          </Button>
          <Button
            startIcon={<ChatIcon sx={{ fontSize: 20 }} />}
            sx={{
              color: isActive('/chatbot') ? 'text.primary' : 'text.secondary',
              fontWeight: isActive('/chatbot') ? 700 : 600,
              bgcolor: isActive('/chatbot') ? 'primary.50' : 'transparent',
              px: 2,
              borderRadius: 2,
              '&:hover': { bgcolor: 'primary.50' },
              transition: 'all 0.2s ease-in-out'
            }}
            onClick={handleChatbotClick}
            disabled={isPending}
          >
            챗봇
          </Button>
          <Button
            startIcon={<PersonIcon sx={{ fontSize: 20 }} />}
            sx={{
              color: isActive('/profile') ? 'text.primary' : 'text.secondary',
              fontWeight: isActive('/profile') ? 700 : 600,
              bgcolor: isActive('/profile') ? 'primary.50' : 'transparent',
              px: 2,
              borderRadius: 2,
              '&:hover': { bgcolor: 'primary.50' },
              transition: 'all 0.2s ease-in-out'
            }}
            onClick={() => handleNavigation('/profile')}
            disabled={isPending}
          >
            마이페이지
          </Button>
          {isAdmin && (
            <Button
              startIcon={<PersonIcon sx={{ fontSize: 20 }} />}
              sx={{
                color: isActive('/users') ? 'text.primary' : 'text.secondary',
                fontWeight: isActive('/users') ? 700 : 600,
                bgcolor: isActive('/users') ? 'primary.50' : 'transparent',
                px: 2,
                borderRadius: 2,
                '&:hover': { bgcolor: 'primary.50' },
                transition: 'all 0.2s ease-in-out'
              }}
              onClick={() => handleNavigation('/users')}
              disabled={isPending}
            >
              사용자관리
            </Button>
          )}
          {isAdmin && (
            <Button
              startIcon={<PersonIcon sx={{ fontSize: 20 }} />}
              sx={{
                color: isActive('/security-test') ? 'text.primary' : 'text.secondary',
                fontWeight: isActive('/security-test') ? 700 : 600,
                bgcolor: isActive('/security-test') ? 'primary.50' : 'transparent',
                px: 2,
                borderRadius: 2,
                '&:hover': { bgcolor: 'primary.50' },
                transition: 'all 0.2s ease-in-out'
              }}
              onClick={() => handleNavigation('/security-test')}
              disabled={isPending}
            >
              보안테스트
            </Button>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton sx={{ color: 'text.secondary' }} onClick={e => setNotifAnchor(e.currentTarget)}>
            <Badge color="error" variant="dot" invisible={unreadCount === 0}>
              <NotificationsIcon sx={{ fontSize: 24 }} />
            </Badge>
          </IconButton>
          <Popover
            open={Boolean(notifAnchor)}
            anchorEl={notifAnchor}
            onClose={() => setNotifAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ sx: { minWidth: 260, p: 1 } }}
          >
            <List dense>
              {notifications.length === 0 && <ListItemText primary="알림이 없습니다." />}
              {notifications.map(n => (
                <ListItem button key={n.id} onClick={() => handleNotifClick(n.id)} selected={!n.read}>
                  <ListItemText primary={n.text} sx={{ color: n.read ? 'text.secondary' : 'primary.main' }} />
                </ListItem>
              ))}
            </List>
          </Popover>
          <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', cursor: 'pointer' }} onClick={e => setProfileAnchor(e.currentTarget)}>
            <PersonIcon sx={{ fontSize: 20 }} />
          </Avatar>
          <Menu anchorEl={profileAnchor} open={!!profileAnchor} onClose={() => setProfileAnchor(null)}>
            <MenuItem onClick={() => { setProfileAnchor(null); handleNavigation('/profile'); }}>내 정보</MenuItem>
            <MenuItem onClick={() => { setProfileAnchor(null); onOpenAccountSettings(); }}>계정 설정</MenuItem>
            {isAdmin && <MenuItem onClick={() => { setProfileAnchor(null); handleNavigation('/users'); }}>관리자 페이지</MenuItem>}
            <Divider />
            <MenuItem onClick={() => { setProfileAnchor(null); handleLogout(); }}>로그아웃</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

function AppContent() {
  const [memoOpen, setMemoOpen] = React.useState(false);
  const [onboardingOpen, setOnboardingOpen] = React.useState(false);
  const [accountSettingsOpen, setAccountSettingsOpen] = React.useState(false);
  const { isAuthenticated, user } = useAuth();
  const { userData, updateOnboarding } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  // 프리로딩 적용
  usePreloadPages();

  // 회원가입 후 온보딩 모달 자동 표시 (로그인할 때마다 체크)
  React.useEffect(() => {
    const checkOnboardingStatus = async () => {
      console.log('[App] Checking conditions - isAuthenticated:', isAuthenticated, 'user:', !!user, 'onboardingOpen:', onboardingOpen);

      if (isAuthenticated && user && !onboardingOpen) {
        console.log('[App] Starting onboarding status check...');

        try {
          // 백엔드에서 실제 온보딩 완료 상태 확인
          const { apiService } = await import('./services/ApiService');
          const profile = await apiService.getProfile();

          console.log('[App] Backend profile response:', profile);
          if (!profile || !("onboardingCompleted" in profile)) {
            console.warn('[App] Profile missing or malformed. Showing onboarding modal.');
            setOnboardingOpen(true);
          } else {
            console.log('[App] Onboarding completed status:', profile.onboardingCompleted);

            // 백엔드의 onboarding_completed가 false인 경우에만 모달 열기
            if (!profile.onboardingCompleted) {
              console.log('[App] Opening onboarding modal - backend shows not completed');
              setOnboardingOpen(true);
            } else {
              console.log('[App] Onboarding already completed - not showing modal');
            }
          }
        } catch (error) {
          console.warn('[App] Failed to check onboarding status from backend:', error);

          // 백엔드 실패 시에도 온보딩 모달을 표시 (새 사용자일 가능성)
          console.log('[App] Backend check failed - showing onboarding modal as fallback');
          setOnboardingOpen(true);
        }
      } else if (isAuthenticated && user && onboardingOpen) {
        console.log('[App] Onboarding modal already open, skipping check');
      }
    };

    // 약간의 지연을 두어 인증 완료 후 체크
    const timer = setTimeout(checkOnboardingStatus, 1000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, onboardingOpen]); // onboardingOpen도 의존성에 추가

  // 온보딩 완료 후 대시보드로 이동
  const handleOnboardingComplete = React.useCallback(async (info: any) => {
    console.log('[App] Onboarding completed with info:', info);

    try {
      // 백엔드에 온보딩 완료 상태 업데이트
      const { apiService } = await import('./services/ApiService');
      await apiService.completeOnboarding(info);
      console.log('[App] Backend onboarding status updated');
    } catch (error) {
      console.warn('[App] Failed to update backend onboarding status:', error);
    }

    // 저장된 유저 정보를 글로벌 온보딩 상태에 반영
    try {
      updateOnboarding({ ...info, isCompleted: true });
      console.log('[App] Local onboarding status updated');
    } catch (e) {
      console.error('[App] 온보딩 정보 저장 실패:', e);
    }

    setOnboardingOpen(false);
    navigate('/dashboard');
  }, [navigate, updateOnboarding]);

  // 온보딩/셋업 경로에서는 탑바 숨김
  const hideTopBar = ['/setup', '/intro-after-register'].includes(location.pathname);

  // TopBar 높이 (px)
  const TOPBAR_HEIGHT = 64;

  // AppBar가 있는 페이지만 paddingTop 적용
  const showAppBar = isAuthenticated && !hideTopBar;

  // MainContent Wrapper
  const MainContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Box sx={{
      paddingTop: showAppBar ? `${TOPBAR_HEIGHT}px` : 0,
      minHeight: '100vh',
      minWidth: '1200px',
      background: '#f9fafb',
      transition: 'all 0.3s ease-in-out'
    }}>
      {children}
    </Box>
  );

  return (
    <AuthGuard>
      {isAuthenticated && !hideTopBar && <AppBarNav onOpenOnboarding={() => setOnboardingOpen(true)} onOpenAccountSettings={() => setAccountSettingsOpen(true)} />}
      <MainContent>
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/" element={<Intro />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/curriculum" element={
              <ProtectedRoute>
                <Curriculum />
              </ProtectedRoute>
            } />
            <Route path="/chatbot" element={
              <ProtectedRoute>
                <Chatbot />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/schedule" element={
              <ProtectedRoute>
                <Schedule />
              </ProtectedRoute>
            } />
            <Route path="/course/:courseId" element={
              <ProtectedRoute>
                <CourseDetail />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/security-test" element={
              <ProtectedRoute>
                <SecurityTest />
              </ProtectedRoute>
            } />
            <Route path="/completed-courses" element={
              <ProtectedRoute>
                <CompletedCourses />
              </ProtectedRoute>
            } />
            <Route path="/course-setup" element={
              <ProtectedRoute>
                <CourseSetup />
              </ProtectedRoute>
            } />
            <Route path="/setup" element={
              <ProtectedRoute>
                <InterestSelection />
              </ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </MainContent>
      {isAuthenticated && (
        <>
          <FloatingMemoButton onClick={() => setMemoOpen(true)} />
          <MemoApp open={memoOpen} onClose={() => setMemoOpen(false)} />
        </>
      )}
      {/*
      <InterestSelection
        open={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onComplete={handleOnboardingComplete}
      /> */}
      {/* 계정 설정 모달 */}
      <AccountSettings open={accountSettingsOpen} onClose={() => setAccountSettingsOpen(false)} />
    </AuthGuard>
  );
}

function App() {
  // 개발자 도구 설정 및 데이터 마이그레이션
  React.useEffect(() => {
    setupDevTools();

    // 기존 통합 데이터 구조를 1대1 분리 구조로 마이그레이션
    if (isMigrationRequired()) {
      console.log('기존 데이터 구조에서 1대1 분리 구조로 마이그레이션 시작...');
      const migrationSuccess = migrateAllLegacyData();
      if (migrationSuccess) {
        console.log('데이터 마이그레이션 완료');
      } else {
        console.log('마이그레이션할 데이터가 없거나 이미 완료됨');
      }
    }
  }, []);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 30, // 30 minutes
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        <Box sx={{ 
          minWidth: '1200px',
          overflow: 'auto'
        }}>
          <NotificationProvider>
            <AuthProvider>
              <SeparatedDataProvider>
                <SetupProvider>
                  <AppContent />
                </SetupProvider>
              </SeparatedDataProvider>
            </AuthProvider>
          </NotificationProvider>
        </Box>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;