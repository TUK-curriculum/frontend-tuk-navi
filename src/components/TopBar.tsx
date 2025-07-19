import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    useMediaQuery,
    useTheme,
    Chip,
    Divider,
    Paper
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    School as SchoolIcon,
    Schedule as ScheduleIcon,
    Person as PersonIcon,
    Menu as MenuIcon,
    Logout as LogoutIcon,
    Settings as SettingsIcon,
    KeyboardArrowDown as ArrowDownIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const TOPBAR_HEIGHT = 72;

const menu = [
    { label: '대시보드', icon: <DashboardIcon fontSize="small" />, path: '/dashboard' },
    { label: '커리큘럼', icon: <SchoolIcon fontSize="small" />, path: '/curriculum' },
    { label: '시간표', icon: <ScheduleIcon fontSize="small" />, path: '/schedule' },
    { label: '마이페이지', icon: <PersonIcon fontSize="small" />, path: '/profile' },
];

const TopBar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user, logout } = useAuth();

    // Mobile drawer state
    const [mobileOpen, setMobileOpen] = useState(false);

    // User menu state
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const userMenuOpen = Boolean(anchorEl);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleUserMenuClose();
        navigate('/login');
    };

    const isActivePath = (path: string) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    // Mobile drawer content
    const drawer = (
        <Box sx={{ width: 280, height: '100%', background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 2
                    }}
                >
                    TUK NAVI
                </Typography>
                {user && (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                            border: '1px solid #bae6fd',
                            borderRadius: 3
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                                sx={{
                                    width: 44,
                                    height: 44,
                                    background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
                                    fontSize: '1.1rem',
                                    fontWeight: 700,
                                    boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)'
                                }}
                            >
                                {(user.name || user.profile?.nickname || 'U')[0].toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                    안녕하세요
                                </Typography>
                                <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '0.95rem' }}>
                                    {user.name || user.profile?.nickname || '사용자'}님
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                )}
            </Box>
            <List sx={{ px: 2, py: 1 }}>
                {menu.map((item) => (
                    <ListItem
                        key={item.label}
                        onClick={() => {
                            navigate(item.path);
                            setMobileOpen(false);
                        }}
                        sx={{
                            cursor: 'pointer',
                            borderRadius: 2,
                            mb: 0.5,
                            mx: 0.5,
                            bgcolor: isActivePath(item.path) ? 'rgba(14, 165, 233, 0.08)' : 'transparent',
                            border: isActivePath(item.path) ? '1px solid rgba(14, 165, 233, 0.2)' : '1px solid transparent',
                            '&:hover': {
                                bgcolor: 'rgba(14, 165, 233, 0.06)',
                                border: '1px solid rgba(14, 165, 233, 0.15)'
                            },
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        <ListItemIcon sx={{
                            color: isActivePath(item.path) ? '#0ea5e9' : '#64748b',
                            minWidth: 40
                        }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.label}
                            sx={{
                                '& .MuiListItemText-primary': {
                                    fontWeight: isActivePath(item.path) ? 700 : 500,
                                    color: isActivePath(item.path) ? '#0ea5e9' : '#1e293b',
                                    fontSize: '0.95rem'
                                }
                            }}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <>
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                    px: { xs: 2, md: 4, lg: 6 },
                    py: 0
                }}
            >
                <Toolbar
                    disableGutters
                    sx={{
                        minHeight: 72,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        px: 0
                    }}
                >
                    {/* Logo */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            '&:hover': {
                                transform: 'scale(1.02)',
                                transition: 'transform 0.2s ease'
                            }
                        }}
                        onClick={() => navigate('/dashboard')}
                        role="button"
                        aria-label="TUK NAVI 홈으로 이동"
                    >
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 900,
                                background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '-0.02em',
                                fontSize: { xs: '1.4rem', sm: '1.6rem', md: '1.8rem' },
                                textShadow: '0 2px 4px rgba(14, 165, 233, 0.1)'
                            }}
                        >
                            TUK NAVI
                        </Typography>
                        <Box
                            sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                                ml: 1,
                                boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)'
                            }}
                        />
                    </Box>

                    {/* Desktop Navigation */}
                    {!isMobile && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {/* Navigation Menu */}
                            <Box sx={{ display: 'flex', gap: 0.5, mr: 3 }}>
                                {menu.map((item) => (
                                    <Button
                                        key={item.label}
                                        startIcon={item.icon}
                                        onClick={() => navigate(item.path)}
                                        sx={{
                                            fontWeight: isActivePath(item.path) ? 700 : 600,
                                            fontSize: '0.9rem',
                                            color: isActivePath(item.path) ? '#0ea5e9' : '#475569',
                                            px: 2.5,
                                            py: 1.5,
                                            borderRadius: 3,
                                            textTransform: 'none',
                                            position: 'relative',
                                            background: isActivePath(item.path) ? 'rgba(14, 165, 233, 0.06)' : 'transparent',
                                            border: isActivePath(item.path) ? '1px solid rgba(14, 165, 233, 0.2)' : '1px solid transparent',
                                            backdropFilter: 'blur(8px)',
                                            '&:hover': {
                                                bgcolor: 'rgba(14, 165, 233, 0.08)',
                                                color: '#0ea5e9',
                                                border: '1px solid rgba(14, 165, 233, 0.25)',
                                                transform: 'translateY(-1px)',
                                                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.15)'
                                            },
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '& .MuiButton-startIcon': {
                                                mr: 1
                                            }
                                        }}
                                        aria-current={isActivePath(item.path) ? 'page' : undefined}
                                    >
                                        {item.label}
                                    </Button>
                                ))}
                            </Box>

                            {/* User Profile Area */}
                            {user && (
                                <Paper
                                    elevation={0}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        px: 2,
                                        py: 1,
                                        borderRadius: 3,
                                        background: 'rgba(248, 250, 252, 0.8)',
                                        border: '1px solid rgba(226, 232, 240, 0.8)',
                                        backdropFilter: 'blur(8px)',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            background: 'rgba(240, 249, 255, 0.9)',
                                            border: '1px solid rgba(14, 165, 233, 0.3)',
                                            transform: 'translateY(-1px)',
                                            boxShadow: '0 4px 12px rgba(14, 165, 233, 0.1)'
                                        },
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                    onClick={handleUserMenuClick}
                                    aria-label="사용자 메뉴 열기"
                                    aria-controls={userMenuOpen ? 'user-menu' : undefined}
                                    aria-haspopup="true"
                                    aria-expanded={userMenuOpen ? 'true' : undefined}
                                >
                                    <Avatar
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
                                            fontSize: '0.9rem',
                                            fontWeight: 700,
                                            boxShadow: '0 2px 8px rgba(14, 165, 233, 0.3)'
                                        }}
                                    >
                                        {(user.name || user.profile?.nickname || 'U')[0].toUpperCase()}
                                    </Avatar>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 600,
                                                color: '#1e293b',
                                                fontSize: '0.85rem',
                                                lineHeight: 1.2
                                            }}
                                        >
                                            {user.name || user.profile?.nickname || '사용자'}
                                        </Typography>
                                        <Chip
                                            label={`${user.profile?.grade || 1}학년`}
                                            size="small"
                                            sx={{
                                                height: 18,
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
                                                color: 'white',
                                                '& .MuiChip-label': {
                                                    px: 1
                                                }
                                            }}
                                        />
                                    </Box>
                                    <ArrowDownIcon
                                        sx={{
                                            fontSize: 18,
                                            color: '#64748b',
                                            transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.2s ease'
                                        }}
                                    />
                                </Paper>
                            )}
                        </Box>
                    )}

                    {/* Mobile Menu Button */}
                    {isMobile && (
                        <IconButton
                            color="inherit"
                            aria-label="메뉴 열기"
                            edge="end"
                            onClick={handleDrawerToggle}
                            sx={{
                                color: '#475569',
                                background: 'rgba(248, 250, 252, 0.8)',
                                border: '1px solid rgba(226, 232, 240, 0.8)',
                                borderRadius: 2,
                                '&:hover': {
                                    background: 'rgba(240, 249, 255, 0.9)',
                                    color: '#0ea5e9'
                                }
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                </Toolbar>
            </AppBar>

            {/* User Menu */}
            <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={userMenuOpen}
                onClose={handleUserMenuClose}
                onClick={handleUserMenuClose}
                PaperProps={{
                    elevation: 8,
                    sx: {
                        mt: 1,
                        minWidth: 200,
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
                        '& .MuiMenuItem-root': {
                            px: 2.5,
                            py: 1.5,
                            borderRadius: 2,
                            mx: 1,
                            mb: 0.5,
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            '&:hover': {
                                background: 'rgba(14, 165, 233, 0.08)',
                                color: '#0ea5e9'
                            },
                            '&:last-child': {
                                mb: 0
                            }
                        }
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={() => navigate('/profile')}>
                    <PersonIcon sx={{ mr: 1.5, fontSize: 18 }} />
                    내 프로필
                </MenuItem>
                <MenuItem onClick={() => navigate('/settings')}>
                    <SettingsIcon sx={{ mr: 1.5, fontSize: 18 }} />
                    설정
                </MenuItem>
                <Divider sx={{ my: 1, mx: 2 }} />
                <MenuItem onClick={handleLogout} sx={{ color: '#ef4444 !important' }}>
                    <LogoutIcon sx={{ mr: 1.5, fontSize: 18 }} />
                    로그아웃
                </MenuItem>
            </Menu>

            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: 280,
                        borderRadius: '20px 0 0 20px',
                        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)'
                    },
                }}
            >
                {drawer}
            </Drawer>
        </>
    );
};

export default TopBar; 