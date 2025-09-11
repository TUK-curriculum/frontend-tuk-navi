import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Autocomplete,
  TextField,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Tooltip,
  Collapse,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  School as SchoolIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { professorService } from '../services/ProfessorService';
import { Professor, PreferredProfessor, ProfessorLecture } from '../types/professor';

const PreferredProfessors: React.FC = () => {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [preferredProfessors, setPreferredProfessors] = useState<PreferredProfessor[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [professorLectures, setProfessorLectures] = useState<Record<number, ProfessorLecture[]>>({});
  const [expandedProfessors, setExpandedProfessors] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 초기 데이터 로드
  useEffect(() => {
    loadPreferredProfessors();
    loadProfessors();
  }, []);

  const loadProfessors = async (search?: string) => {
    try {
      setSearchLoading(true);
      const data = await professorService.getProfessors(search);
      setProfessors(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSearchLoading(false);
    }
  };

  const loadPreferredProfessors = async () => {
    try {
      setLoading(true);
      const data = await professorService.getPreferredProfessors();
      setPreferredProfessors(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadProfessorLectures = async (professorId: number) => {
    if (professorLectures[professorId]) return;

    try {
      const data = await professorService.getProfessorLectures(professorId);
      setProfessorLectures(prev => ({
        ...prev,
        [professorId]: data
      }));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddProfessor = async () => {
    if (!selectedProfessor) return;

    try {
      setLoading(true);
      await professorService.addPreferredProfessor(selectedProfessor.id);
      setSuccess('선호교수가 추가되었습니다.');
      setSelectedProfessor(null);
      await loadPreferredProfessors();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProfessor = async (preferredId: number) => {
    try {
      setLoading(true);
      await professorService.removePreferredProfessor(preferredId);
      setSuccess('선호교수가 삭제되었습니다.');
      await loadPreferredProfessors();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExpandProfessor = async (professorId: number) => {
    const newExpanded = new Set(expandedProfessors);
    if (expandedProfessors.has(professorId)) {
      newExpanded.delete(professorId);
    } else {
      newExpanded.add(professorId);
      await loadProfessorLectures(professorId);
    }
    setExpandedProfessors(newExpanded);
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SchoolIcon />
          선호교수 설정
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          시간표 생성 시 우선적으로 배정받고 싶은 교수를 설정할 수 있습니다.
        </Typography>

        {error && (
          <Alert severity="error" onClose={clearMessages} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" onClose={clearMessages} sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* 교수 추가 섹션 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            교수 추가
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <Autocomplete
              sx={{ flex: 1 }}
              options={professors}
              getOptionLabel={(option) => `${option.name} (${option.major_name || '미지정'})`}
              value={selectedProfessor}
              onChange={(_, newValue) => setSelectedProfessor(newValue)}
              onInputChange={(_, newInputValue) => {
                if (newInputValue.length > 1) {
                  loadProfessors(newInputValue);
                }
              }}
              loading={searchLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="교수 검색"
                  placeholder="교수명 또는 연구분야로 검색"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box>
                    <Typography variant="body1">{option.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.major_name} | {option.research_area} | 담당과목 {option.lecture_count}개
                    </Typography>
                  </Box>
                </li>
              )}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddProfessor}
              disabled={!selectedProfessor || loading}
            >
              추가
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* 선호교수 목록 */}
        <Typography variant="subtitle1" gutterBottom>
          선호교수 목록 ({preferredProfessors.length}명)
        </Typography>

        {loading && preferredProfessors.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : preferredProfessors.length === 0 ? (
          <Alert severity="info">
            아직 선호교수가 설정되지 않았습니다. 위에서 교수를 검색하여 추가해보세요.
          </Alert>
        ) : (
          <List>
            {preferredProfessors.map((professor) => (
              <React.Fragment key={professor.preferred_id}>
                <ListItem
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {professor.name}
                        </Typography>
                        {professor.position && (
                          <Chip label={professor.position} size="small" variant="outlined" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {professor.major_name} | {professor.research_area}
                        </Typography>
                        {professor.office && (
                          <Typography variant="caption" color="text.secondary">
                            연구실: {professor.office}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="담당 과목 보기">
                        <IconButton
                          edge="end"
                          onClick={() => handleExpandProfessor(professor.professor_id)}
                        >
                          {expandedProfessors.has(professor.professor_id) ? 
                            <ExpandLessIcon /> : <ExpandMoreIcon />
                          }
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="삭제">
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveProfessor(professor.preferred_id)}
                          disabled={loading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>

                {/* 담당 과목 목록 */}
                <Collapse in={expandedProfessors.has(professor.professor_id)}>
                  <Box sx={{ ml: 4, mb: 2 }}>
                    {professorLectures[professor.professor_id] ? (
                      <Box>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          담당 과목 ({professorLectures[professor.professor_id].length}개)
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                          {professorLectures[professor.professor_id].map((lecture) => (
                            <Chip
                              key={lecture.id}
                              label={`${lecture.name} (${lecture.grade}학년 ${lecture.semester}학기)`}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    ) : (
                      <CircularProgress size={16} />
                    )}
                  </Box>
                </Collapse>
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default PreferredProfessors;