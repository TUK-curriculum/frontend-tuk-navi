import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    useMediaQuery,
    useTheme,
    styled,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard,
    Chat,
    School,
    Person,
    Settings,
    Notifications,
    Logout,
} from '@mui/icons-material';
import { FaGraduationCap } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 280;
const APPBAR_HEIGHT = 64; // 모바일은 56
const EXTRA_TOP_SPACE = 56; // 추가 여백

// Styled Components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
    background: theme.palette.background.default,
    color: theme.palette.text.primary,
    boxShadow: `0 1px 3px ${theme.palette.grey[200]}`,
    borderBottom: `1px solid ${theme.palette.divider}`,
    zIndex: theme.zIndex.drawer + 1,
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
    width: drawerWidth,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
        width: drawerWidth,
        boxSizing: 'border-box',
        background: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
    },
}));

const Main = styled('main')(({ theme }) => ({
    flexGrow: 1,
    padding: 0,
    minHeight: 0,
    background: 'none',
    transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: 0,
    [theme.breakpoints.up('md')]: {
        marginLeft: drawerWidth,
    },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const MenuItemStyled = styled(ListItem)(({ theme }) => ({
    margin: theme.spacing(0.5, 1),
    borderRadius: 12,
    '&:hover': {
        backgroundColor: theme.palette.primary.light,
    },
    '&.active': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        '& .MuiListItemIcon-root': {
            color: theme.palette.primary.contrastText,
        },
    },
}));

const ProfileSection = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
    marginTop: 'auto',
}));

interface MainLayoutProps {
    children: React.ReactNode;
}

const menuItems = [
    { text: '대시보드', icon: <Dashboard />, path: '/dashboard' },
    { text: 'AI 챗봇', icon: <Chat />, path: '/chatbot' },
    { text: '커리큘럼', icon: <School />, path: '/curriculum' },
    { text: '프로필', icon: <Person />, path: '/profile' },
    { text: '설정', icon: <Settings />, path: '/settings' },
];

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [drawerOpen, setDrawerOpen] = useState(!isMobile);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [activePath, setActivePath] = useState('/dashboard');

    // 로그인 사용자 정보
    const { user } = useAuth();

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handleMenuClick = (path: string) => {
        setActivePath(path);
        if (isMobile) {
            setDrawerOpen(false);
        }
    };

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <LogoContainer>
                <FaGraduationCap size={32} color={theme.palette.primary.main} />
                <Typography variant="h6" fontWeight={700} color="primary">
                    TUK NAVI
                </Typography>
            </LogoContainer>

            <List sx={{ flexGrow: 1, pt: 2 }}>
                {menuItems.map((item) => (
                    <MenuItemStyled
                        key={item.text}
                        button
                        className={activePath === item.path ? 'active' : ''}
                        onClick={() => handleMenuClick(item.path)}
                    >
                        <ListItemIcon sx={{ color: 'inherit' }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                    </MenuItemStyled>
                ))}
            </List>

            <ProfileSection>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                        sx={{
                            width: 40,
                            height: 40,
                            background: theme.palette.primary.main,
                        }}
                    >
                        {(user?.profile?.nickname || user?.name || 'U')[0]}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                            {user?.profile?.nickname || user?.name || '이름없음'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {user?.profile?.major || '-'} {user?.profile?.grade || ''}
                        </Typography>
                    </Box>
                </Box>
            </ProfileSection>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <StyledAppBar position="fixed">
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }}>
                        {menuItems.find(item => item.path === activePath)?.text || 'TUK NAVI'}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton color="inherit">
                            <Notifications />
                        </IconButton>

                        <IconButton
                            color="inherit"
                            onClick={handleProfileMenuOpen}
                        >
                            <Avatar
                                sx={{
                                    width: 32,
                                    height: 32,
                                    background: theme.palette.primary.main,
                                }}
                            >
                                {(user?.profile?.nickname || user?.name || 'U')[0]}
                            </Avatar>
                        </IconButton>
                    </Box>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleProfileMenuClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        <MenuItem onClick={handleProfileMenuClose}>
                            <ListItemIcon>
                                <Person fontSize="small" />
                            </ListItemIcon>
                            프로필
                        </MenuItem>
                        <MenuItem onClick={handleProfileMenuClose}>
                            <ListItemIcon>
                                <Settings fontSize="small" />
                            </ListItemIcon>
                            설정
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleProfileMenuClose}>
                            <ListItemIcon>
                                <Logout fontSize="small" />
                            </ListItemIcon>
                            로그아웃
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </StyledAppBar>

            <StyledDrawer
                variant={isMobile ? 'temporary' : 'permanent'}
                open={drawerOpen}
                onClose={isMobile ? handleDrawerToggle : undefined}
                ModalProps={{
                    keepMounted: true,
                }}
            >
                <Toolbar />
                {drawerContent}
            </StyledDrawer>

            <Main
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    minHeight: '100vh',
                    boxSizing: 'border-box',
                    paddingTop: {
                        xs: `calc(56px + 32px)`,
                        sm: `calc(${APPBAR_HEIGHT}px + ${EXTRA_TOP_SPACE}px)`
                    },
                    overflow: 'visible',
                }}
            >
                {children}
            </Main>
        </Box>
    );
};

export default MainLayout; 