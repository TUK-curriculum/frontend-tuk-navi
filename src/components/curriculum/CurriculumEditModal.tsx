// src/components/curriculum/CurriculumEditModal.tsx
import React, { useState, useEffect } from 'react';
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
import { Edit } from '@mui/icons-material';
import { curriculumService } from '../../services/CurriculumService';
import { Curriculum, CreateCurriculumRequest } from '../../types/curriculum';

interface CurriculumEditModalProps {
    open: boolean;
    curriculum: Curriculum | null;
    onClose: () => void;
    onSuccess: (curriculum: Curriculum) => void;
}

const CurriculumEditModal: React.FC<CurriculumEditModalProps> = ({
    open,
    curriculum,
    onClose,
    onSuccess,
}) => {
    const [formData, setFormData] = useState<CreateCurriculumRequest>({
        name: '',
        isDefault: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 편집할 커리큘럼 데이터로 폼 초기화
    useEffect(() => {
        if (curriculum) {
            setFormData({
                name: curriculum.name,
                isDefault: curriculum.isDefault,
            });
        }
    }, [curriculum]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!curriculum) return;

        if (!formData.name.trim()) {
            setError('커리큘럼 이름을 입력해주세요.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // 현재는 백엔드에 커리큘럼 수정 API가 없으므로
            // 프론트엔드에서만 상태 업데이트
            const updatedCurriculum = {
                ...curriculum,
                name: formData.name,
                isDefault: formData.isDefault,
            };

            onSuccess(updatedCurriculum);
            handleClose();
        } catch (error) {
            console.error('Failed to update curriculum:', error);
            setError(error instanceof Error ? error.message : '커리큘럼 수정에 실패했습니다.');
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

    if (!curriculum) return null;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Edit color="primary" />
                        <Typography variant="h6">커리큘럼 편집</Typography>
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
                        startIcon={loading ? <CircularProgress size={16} /> : <Edit />}
                    >
                        {loading ? '수정 중...' : '커리큘럼 수정'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CurriculumEditModal; 