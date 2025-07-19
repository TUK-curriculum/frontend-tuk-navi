import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    IconButton,
    Chip,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    Alert,
    Snackbar,
    Card,
    CardContent,
    Grid,
    Avatar,
    Tooltip,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    ListItemSecondaryAction
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    Search,
    FilterList,
    AdminPanelSettings,
    Person,
    Block,
    CheckCircle,
    Warning,
    Refresh,
    Download,
    Upload,
    Settings,
    Security,
    Analytics
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/SeparatedDataContext';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'moderator';
    status: 'active' | 'inactive' | 'suspended';
    lastLogin: string;
    createdAt: string;
    profileImage?: string;
    department?: string;
    studentId?: string;
}

interface UserStats {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    adminUsers: number;
}

const UserManagement: React.FC = () => {
    const { user } = useAuth();
    const { userData } = useData();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'warning' | 'info'
    });

    // 통계 데이터
    const [stats, setStats] = useState<UserStats>({
        totalUsers: 0,
        activeUsers: 0,
        newUsersThisMonth: 0,
        adminUsers: 0
    });

    // 사용자 데이터 로드 (현재는 현재 사용자만 표시)
    useEffect(() => {
        if (user) {
            const currentUser: User = {
                id: user.email,
                name: user.name,
                email: user.email,
                role: 'user' as const,
                status: 'active' as const,
                lastLogin: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                department: user.major,
                studentId: user.studentId
            };
            setUsers([currentUser]);
            setFilteredUsers([currentUser]);
            setStats({
                totalUsers: 1,
                activeUsers: 1,
                newUsersThisMonth: 1,
                adminUsers: 0
            });
        }
    }, [user]);

    // 검색 및 필터링
    useEffect(() => {
        let filtered = users;

        // 검색 필터
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.department?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 역할 필터
        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        // 상태 필터
        if (statusFilter !== 'all') {
            filtered = filtered.filter(user => user.status === statusFilter);
        }

        setFilteredUsers(filtered);
    }, [users, searchTerm, roleFilter, statusFilter]);

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setEditDialogOpen(true);
    };

    const handleDeleteUser = (user: User) => {
        setSelectedUser(user);
        setDeleteDialogOpen(true);
    };

    const handleSaveUser = (updatedUser: User) => {
        // 현재는 현재 사용자만 수정 가능
        if (updatedUser.email === user?.email) {
            setUsers([updatedUser]);
            setFilteredUsers([updatedUser]);
            setEditDialogOpen(false);
            setSnackbar({
                open: true,
                message: '사용자 정보가 수정되었습니다.',
                severity: 'success'
            });
        }
    };

    const handleConfirmDelete = () => {
        if (selectedUser) {
            // deleteUser(selectedUser.email); // 실제 삭제 로직 제거
            setUsers([]); // 현재는 현재 사용자만 표시하므로 빈 배열로 변경
            setFilteredUsers([]);
            setDeleteDialogOpen(false);
            setSnackbar({
                open: true,
                message: '사용자가 삭제되었습니다.',
                severity: 'success'
            });
        }
    };

    const handleExportUsers = () => {
        const csvContent = "data:text/csv;charset=utf-8," +
            "ID,이름,이메일,역할,상태,학과,학번,마지막 로그인,가입일\n" +
            filteredUsers.map(user =>
                `${user.id},${user.name},${user.email},${user.role},${user.status},${user.department || ''},${user.studentId || ''},${user.lastLogin},${user.createdAt}`
            ).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "users.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setSnackbar({
            open: true,
            message: '사용자 목록이 다운로드되었습니다.',
            severity: 'success'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'success';
            case 'inactive': return 'warning';
            case 'suspended': return 'error';
            default: return 'default';
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'error';
            case 'moderator': return 'warning';
            case 'user': return 'primary';
            default: return 'default';
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <AdminPanelSettings />;
            case 'moderator': return <Security />;
            case 'user': return <Person />;
            default: return <Person />;
        }
    };

    return (
        <Box sx={{ p: 3, pt: 10, minHeight: '100vh', background: 'linear-gradient(135deg, #e0f2ff 0%, #f3e8ff 100%)' }}>
            <Paper elevation={3} sx={{ borderRadius: 3, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
                <Box sx={{ p: 4 }}>
                    {/* 헤더 */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Box>
                            <Typography variant="h4" fontWeight={700} color="#162B49" sx={{ mb: 1 }}>
                                👥 사용자 관리
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                시스템 사용자들을 관리하고 모니터링합니다.
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            sx={{ borderRadius: 2, px: 3 }}
                        >
                            새 사용자 추가
                        </Button>
                    </Box>

                    {/* 통계 카드 */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                <CardContent sx={{ color: 'white' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography variant="h4" fontWeight={700}>
                                                {stats.totalUsers}
                                            </Typography>
                                            <Typography variant="body2">
                                                전체 사용자
                                            </Typography>
                                        </Box>
                                        <Person sx={{ fontSize: 40, opacity: 0.8 }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                                <CardContent sx={{ color: 'white' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography variant="h4" fontWeight={700}>
                                                {stats.activeUsers}
                                            </Typography>
                                            <Typography variant="body2">
                                                활성 사용자
                                            </Typography>
                                        </Box>
                                        <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                                <CardContent sx={{ color: 'white' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography variant="h4" fontWeight={700}>
                                                {stats.newUsersThisMonth}
                                            </Typography>
                                            <Typography variant="body2">
                                                이번 달 신규
                                            </Typography>
                                        </Box>
                                        <Add sx={{ fontSize: 40, opacity: 0.8 }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                                <CardContent sx={{ color: 'white' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography variant="h4" fontWeight={700}>
                                                {stats.adminUsers}
                                            </Typography>
                                            <Typography variant="body2">
                                                관리자
                                            </Typography>
                                        </Box>
                                        <AdminPanelSettings sx={{ fontSize: 40, opacity: 0.8 }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* 검색 및 필터 */}
                    <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        <TextField
                            placeholder="사용자 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            size="small"
                            sx={{ minWidth: 250 }}
                            InputProps={{
                                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                        />

                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>역할</InputLabel>
                            <Select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                label="역할"
                            >
                                <MenuItem value="all">전체</MenuItem>
                                <MenuItem value="admin">관리자</MenuItem>
                                <MenuItem value="moderator">모더레이터</MenuItem>
                                <MenuItem value="user">사용자</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>상태</InputLabel>
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                label="상태"
                            >
                                <MenuItem value="all">전체</MenuItem>
                                <MenuItem value="active">활성</MenuItem>
                                <MenuItem value="inactive">비활성</MenuItem>
                                <MenuItem value="suspended">정지</MenuItem>
                            </Select>
                        </FormControl>

                        <Button
                            variant="outlined"
                            startIcon={<Download />}
                            onClick={handleExportUsers}
                            sx={{ borderRadius: 2 }}
                        >
                            내보내기
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={() => {
                                setSearchTerm('');
                                setRoleFilter('all');
                                setStatusFilter('all');
                            }}
                            sx={{ borderRadius: 2 }}
                        >
                            초기화
                        </Button>
                    </Box>

                    {/* 사용자 테이블 */}
                    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'grey.50' }}>
                                    <TableCell sx={{ fontWeight: 600 }}>사용자</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>이메일</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>역할</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>상태</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>학과</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>마지막 로그인</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>가입일</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>작업</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar sx={{ width: 40, height: 40 }}>
                                                    {user.name.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body1" fontWeight={600}>
                                                        {user.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {user.studentId}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={getRoleIcon(user.role)}
                                                label={user.role === 'admin' ? '관리자' :
                                                    user.role === 'moderator' ? '모더레이터' : '사용자'}
                                                color={getRoleColor(user.role) as any}
                                                size="small"
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.status === 'active' ? '활성' :
                                                    user.status === 'inactive' ? '비활성' : '정지'}
                                                color={getStatusColor(user.status) as any}
                                                size="small"
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </TableCell>
                                        <TableCell>{user.department}</TableCell>
                                        <TableCell>{user.lastLogin}</TableCell>
                                        <TableCell>{user.createdAt}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Tooltip title="편집">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEditUser(user)}
                                                        sx={{ color: 'primary.main' }}
                                                    >
                                                        <Edit />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="삭제">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDeleteUser(user)}
                                                        sx={{ color: 'error.main' }}
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* 결과 없음 */}
                    {filteredUsers.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                검색 결과가 없습니다
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                다른 검색어나 필터를 시도해보세요
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Paper>

            {/* 편집 다이얼로그 */}
            <Dialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 700 }}>
                    사용자 정보 편집
                </DialogTitle>
                <DialogContent>
                    {selectedUser && (
                        <Box sx={{ pt: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="이름"
                                        defaultValue={selectedUser.name}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="이메일"
                                        defaultValue={selectedUser.email}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>역할</InputLabel>
                                        <Select
                                            defaultValue={selectedUser.role}
                                            label="역할"
                                        >
                                            <MenuItem value="user">사용자</MenuItem>
                                            <MenuItem value="moderator">모더레이터</MenuItem>
                                            <MenuItem value="admin">관리자</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>상태</InputLabel>
                                        <Select
                                            defaultValue={selectedUser.status}
                                            label="상태"
                                        >
                                            <MenuItem value="active">활성</MenuItem>
                                            <MenuItem value="inactive">비활성</MenuItem>
                                            <MenuItem value="suspended">정지</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="학과"
                                        defaultValue={selectedUser.department}
                                        size="small"
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>
                        취소
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => selectedUser && handleSaveUser(selectedUser)}
                    >
                        저장
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 삭제 확인 다이얼로그 */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle sx={{ fontWeight: 700 }}>
                    사용자 삭제 확인
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        정말로 "{selectedUser?.name}" 사용자를 삭제하시겠습니까?
                        이 작업은 되돌릴 수 없습니다.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        취소
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleConfirmDelete}
                    >
                        삭제
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 스낵바 */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default UserManagement; 