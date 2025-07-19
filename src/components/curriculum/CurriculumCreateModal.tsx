// src/components/curriculum/CurriculumCreateModal.tsx
import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControlLabel,
    Switch,
    Box,
    Typography,
    Alert,
    CircularProgress,
} from '@mui/material';
import { AddCircleOutline } from '@mui/icons-material';
import { curriculumService } from '../../services/CurriculumService';
import { CreateCurriculumRequest } from '../../types/curriculum';

interface CurriculumCreateModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (curriculum: any) => void;
}

const CurriculumCreateModal: React.FC<CurriculumCreateModalProps> = ({
    open,
    onClose,
    onSuccess,
}) => {
    const [formData, setFormData] = useState<CreateCurriculumRequest>({
        name: '',
        isDefault: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError('커리큘럼 이름을 입력해주세요.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const newCurriculum = await curriculumService.createCurriculum(formData);
            onSuccess(newCurriculum);
            handleClose();
        } catch (error) {
            console.error('Failed to create curriculum:', error);
            setError(error instanceof Error ? error.message : '커리큘럼 생성에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ name: '', isDefault: false });
        setError(null);
        setLoading(false);
        onClose();
    };

    const handleInputChange = (field: keyof CreateCurriculumRequest, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (error) setError(null);
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AddCircleOutline color="primary" />
                        <Typography variant="h6">새 커리큘럼 생성</Typography>
                    </Box>
                </DialogTitle>

                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <TextField
                            autoFocus
                            margin="dense"
                            label="커리큘럼 이름"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="예: AI 트랙 커리큘럼"
                            disabled={loading}
                            sx={{ mb: 2 }}
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.isDefault}
                                    onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                                    disabled={loading}
                                />
                            }
                            label="기본 커리큘럼으로 설정"
                        />

                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            기본 커리큘럼으로 설정하면 다른 커리큘럼이 자동으로 기본 해제됩니다.
                        </Typography>
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose} disabled={loading}>
                        취소
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || !formData.name.trim()}
                        startIcon={loading ? <CircularProgress size={16} /> : <AddCircleOutline />}
                    >
                        {loading ? '생성 중...' : '커리큘럼 생성'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CurriculumCreateModal; 