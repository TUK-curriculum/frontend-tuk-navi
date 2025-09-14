import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Typography, TextField, InputAdornment, List, ListItemButton,
  ListItemText, Divider, Tabs, Tab, Paper, Button, Rating, Avatar,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import GlassCard from '../components/common/GlassCard';
import { apiClient } from '../utils/apiClient';

interface Course {
  code: string;
  name: string;
  credits: number;
  semester: string;
  type: string;
  grade: string;
  major: string;
}

interface Syllabus {
  courseCode: string;
  section: string;
  professor: string;
  courseName: string;
  url: string;
}

interface Review {
  id: number;
  author?: string;
  rating: number;
  content: string;
  files?: { fileUrl: string; fileName: string }[];
}

interface Resource {
  id: number;
  title: string;
  description?: string;
  fileUrl?: string;
  uploaderId: number;
  createdAt: string;
}

const CourseDetail: React.FC = () => {
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [professorTab, setProfessorTab] = useState(0);
  const [tab, setTab] = useState(0);

  // 리뷰/자료실
  const [reviews, setReviews] = useState<Review[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, content: '', files: [] as File[] });

  const uniqueProfessors = Array.from(
    new Map(syllabi.map(s => [s.professor, s])).values()
  );

  // 이수구분 매핑 함수
  const mapCourseType = (type: string) => {
    switch (type) {
      case 'MR': return '전공필수';
      case 'ME': return '전공선택';
      case 'GR': return '교양필수';
      case 'GE': return '교양선택';
      case 'RE': return '현장연구';
      case 'FE': return '자유선택';
      default: return type;
    }
  };

  // 정렬 우선순위
  const typeOrder: Record<string, number> = {
    MR: 1,
    ME: 2,
    GR: 3,
    GE: 4,
    RE: 5,
    FE: 6,
  };

  // 강의 목록 불러오기
  useEffect(() => {
    apiClient.courses.getFixedRecent("CE")
      .then(res => {
        const arr = res.data;
        setCourses(Array.isArray(arr) ? arr : []);
      })
      .catch(err => console.error(err));
  }, []);

  // 강의 선택 시 syllabi + 리뷰 + 자료실 가져오기
  useEffect(() => {
    if (selectedCourse) {
      apiClient.courses.getSyllabi(selectedCourse.code, Number(selectedCourse.semester))
        .then(res => {
          setSyllabi(res.data);
          setProfessorTab(0);
        })
        .catch(err => console.error(err));

      apiClient.reviews.getByCourse(selectedCourse.code)
        .then(res => setReviews(res.data))
        .catch(err => console.error(err));

      apiClient.resources.getByCourse(selectedCourse.code)
        .then(res => setResources(res.data))
        .catch(err => console.error(err));
    }
  }, [selectedCourse]);

  // 리뷰 등록
  const handleSubmitReview = async () => {
    if (!selectedCourse) return;

    const formData = new FormData();
    formData.append('rating', String(newReview.rating));
    formData.append('content', newReview.content);
    newReview.files.forEach(f => formData.append('files', f));

    await apiClient.reviews.create(selectedCourse.code, formData);

    const res = await apiClient.reviews.getByCourse(selectedCourse.code);
    setReviews(res.data);
    setReviewOpen(false);
    setNewReview({ rating: 0, content: '', files: [] });
  };

  // 자료 업로드
  const handleUploadResource = async (file: File) => {
    if (!selectedCourse) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);

    await apiClient.resources.create(selectedCourse.code, formData);

    const res = await apiClient.resources.getByCourse(selectedCourse.code);
    setResources(res.data);
  };

  // 검색 필터
  const filteredCourses = Array.isArray(courses)
    ? courses
        .filter(c => c.name.includes(search) || c.code.includes(search))
        .sort((a, b) => {
          const orderA = typeOrder[a.type] || 99;
          const orderB = typeOrder[b.type] || 99;
          if (orderA !== orderB) return orderA - orderB;
          return a.name.localeCompare(b.name);
        })
    : [];

  return (
    <Box sx={{ pt: 10, minHeight: '100vh', bgcolor: 'linear-gradient(120deg,#f7fbff,#f0f6ff)' }}>
      <Grid container spacing={3} sx={{ maxWidth: 1200, mx: 'auto' }}>
        
        {/* 좌측: 검색 + 리스트 */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="강의명, 강의코드 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><SearchIcon /></InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
          />
          <Paper sx={{ maxHeight: '70vh', overflowY: 'auto', borderRadius: 3 }}>
            <List>
              {filteredCourses.map((course) => (
                <React.Fragment key={course.code}>
                  <ListItemButton
                    selected={selectedCourse?.code === course.code}
                    onClick={() => setSelectedCourse(course)}
                  >
                    <ListItemText
                      primary={course.name}
                      secondary={`${course.code} • ${mapCourseType(course.type)}`}
                    />
                  </ListItemButton>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* 우측: 선택된 강의 상세 */}
        <Grid item xs={12} md={8}>
          {selectedCourse ? (
            <Box>
              {/* 강의 정보 */}
              <GlassCard sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" fontWeight={900}>{selectedCourse.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedCourse.code}  |  {selectedCourse.credits}학점  |  {selectedCourse.grade}학년  |  {mapCourseType(selectedCourse.type)}
                </Typography>
              </GlassCard>

              {/* 강의계획서 */}
              {uniqueProfessors.length > 0 && (
                <GlassCard sx={{ p: 2, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>강의계획서</Typography>
                  <Tabs
                    value={professorTab}
                    onChange={(_, v) => setProfessorTab(v)}
                    sx={{ mb: 2 }}
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    {uniqueProfessors.map((s, idx) => (
                      <Tab key={idx} label={s.professor} />
                    ))}
                  </Tabs>
                  {uniqueProfessors[professorTab] && (
                    <>
                      <iframe
                        src={uniqueProfessors[professorTab].url}
                        width="100%"
                        height="400px"
                        style={{ border: "none", borderRadius: "8px" }}
                      />
                      <Button href={uniqueProfessors[professorTab].url} target="_blank" sx={{ mt: 1 }}>
                        전체 PDF 보기
                      </Button>
                    </>
                  )}
                </GlassCard>
              )}

              {/*
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                <Tab label="강의평" />
                <Tab label="자료실" />
                <Tab label="Q&A" />
              </Tabs>

              <Paper sx={{ p: 3, borderRadius: 3 }}>
                {tab === 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>학생 강의평</Typography>
                    {reviews.map(r => (
                      <Paper key={r.id} sx={{ p: 2, mb: 2 }}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar>{r.author?.[0] || "익"}</Avatar>
                          <Box flex={1}>
                            <Rating value={r.rating} readOnly size="small" />
                            <Typography variant="body2">{r.content}</Typography>
                            {r.files && r.files.map(f => (
                              <Button key={f.fileUrl} href={f.fileUrl} target="_blank" size="small">
                                {f.fileName}
                              </Button>
                            ))}
                          </Box>
                          <IconButton size="small"><ThumbUpAltIcon fontSize="small" /></IconButton>
                        </Box>
                      </Paper>
                    ))}
                    <Button variant="contained" onClick={() => setReviewOpen(true)}>강의평 작성</Button>
                  </Box>
                )}

                {tab === 1 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>자료실</Typography>
                    <Button
                      startIcon={<UploadFileIcon />}
                      component="label"
                      sx={{ mb: 2 }}
                    >
                      파일 업로드
                      <input
                        type="file"
                        hidden
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleUploadResource(e.target.files[0]);
                        }}
                      />
                    </Button>
                    {resources.map(res => (
                      <Paper key={res.id} sx={{ p: 2, mb: 1 }}>
                        <Typography>{res.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {res.createdAt.slice(0, 10)}
                        </Typography>
                        {res.description && <Typography variant="body2">{res.description}</Typography>}
                        {res.fileUrl && (
                          <Button size="small" href={res.fileUrl} target="_blank">열기</Button>
                        )}
                      </Paper>
                    ))}
                  </Box>
                )}

                {tab === 2 && <Typography>Q&A 게시판</Typography>}
              </Paper>*/}
            </Box>
          ) : (
            <Typography color="text.secondary" sx={{ mt: 10, textAlign: 'center' }}>
              왼쪽에서 강의를 선택해주세요.
            </Typography>
          )}
        </Grid>
      </Grid>

      {/*
      <Dialog open={reviewOpen} onClose={() => setReviewOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>강의평 작성</DialogTitle>
        <DialogContent>
          <Rating
            name="new-rating"
            value={newReview.rating}
            onChange={(_, v) => setNewReview({ ...newReview, rating: v || 0 })}
            size="large"
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="강의에 대한 의견을 작성해주세요."
            value={newReview.content}
            onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
            sx={{ mt: 2 }}
          />
          <Button component="label" sx={{ mt: 2 }}>
            파일 첨부
            <input
              type="file"
              hidden
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  setNewReview({ ...newReview, files: Array.from(e.target.files) });
                }
              }}
            />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewOpen(false)}>취소</Button>
          <Button variant="contained" onClick={handleSubmitReview}>등록</Button>
        </DialogActions>
      </Dialog> */}
    </Box>
  );
};

export default CourseDetail;