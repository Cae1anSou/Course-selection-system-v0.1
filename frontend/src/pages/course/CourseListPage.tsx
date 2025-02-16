import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Pagination,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { 
  Search as SearchIcon,
  AccessTime as AccessTimeIcon,
  Room as RoomIcon,
  Person as PersonIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { courseService } from '../../services/courseService';
import { Course, CourseResponse } from '../../types/course';
import { useNavigate } from 'react-router-dom';
import ConflictDialog from '../../components/course/ConflictDialog';
import FileUploadDialog from '../../components/course/FileUploadDialog';

const CourseListPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const [conflictCourses, setConflictCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourses(page, search);
      setCourses(response.results);
      setTotalPages(Math.ceil(response.count / 10));
    } catch (err: any) {
      setError('获取课程列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [page, search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSelectCourse = async (courseId: number) => {
    try {
      // 检查课程冲突
      const conflictResult = await courseService.checkConflict(courseId);
      if (conflictResult.has_conflict) {
        setConflictCourses(conflictResult.conflict_courses);
        setSelectedCourseId(courseId);
        setConflictDialogOpen(true);
        return;
      }
      
      // 无冲突，直接选课
      await courseService.selectCourse(courseId);
      setSuccessMessage('选课成功');
      fetchCourses();
    } catch (err: any) {
      setError(err.response?.data?.detail || '选课失败');
    }
  };

  const handleConfirmSelectCourse = async () => {
    if (!selectedCourseId) return;
    try {
      await courseService.selectCourse(selectedCourseId);
      setSuccessMessage('选课成功');
      setConflictDialogOpen(false);
      setSelectedCourseId(null);
      fetchCourses();
    } catch (err: any) {
      setError(err.response?.data?.detail || '选课失败');
    }
  };

  const handleViewDetail = (courseId: number) => {
    navigate(`/courses/${courseId}`);
  };

  const handleUploadSuccess = () => {
    setSuccessMessage('课程导入成功');
    fetchCourses();
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom>
          课程列表
        </Typography>
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          onClick={() => setUploadDialogOpen(true)}
        >
          上传课表
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="搜索课程..."
          value={search}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
          }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      ) : courses.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="textSecondary">
            暂无课程数据
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  },
                  bgcolor: 'background.paper',
                }}
                onClick={() => handleViewDetail(course.id)}
              >
                <CardContent sx={{ flex: 1, p: 3 }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 600,
                      color: 'text.primary',
                      mb: 2
                    }}
                  >
                    {course.name}
                  </Typography>
                  <Typography 
                    color="text.secondary" 
                    gutterBottom
                    sx={{ mb: 2 }}
                  >
                    课程号：{course.course_code}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        mb: 1
                      }}
                    >
                      <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
                      教师：{course.teacher}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        mb: 1
                      }}
                    >
                      <RoomIcon sx={{ mr: 1, fontSize: 20 }} />
                      教室：{course.classroom}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center'
                      }}
                    >
                      <AccessTimeIcon sx={{ mr: 1, fontSize: 20 }} />
                      时间：{course.time_slot}
                    </Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mt: 'auto',
                      pt: 2
                    }}
                  >
                    <Chip
                      label={`${course.selected_count}/${course.capacity}`}
                      color={course.selected_count >= course.capacity ? 'error' : 'success'}
                      size="small"
                      sx={{ 
                        fontWeight: 500,
                        backgroundColor: course.selected_count >= course.capacity 
                          ? 'rgba(211, 47, 47, 0.1)' 
                          : 'rgba(16, 163, 127, 0.1)',
                        color: course.selected_count >= course.capacity 
                          ? 'error.main' 
                          : 'primary.main',
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectCourse(course.id);
                      }}
                      disabled={course.selected_count >= course.capacity}
                      sx={{
                        minWidth: '88px',
                        '&.Mui-disabled': {
                          backgroundColor: 'rgba(0, 0, 0, 0.08)',
                          color: 'rgba(0, 0, 0, 0.26)',
                        },
                      }}
                    >
                      选课
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            sx={{
              '& .MuiPaginationItem-root': {
                color: 'text.secondary',
              },
              '& .Mui-selected': {
                backgroundColor: 'rgba(16, 163, 127, 0.12) !important',
                color: 'primary.main',
              },
            }}
          />
        </Box>
      )}

      <ConflictDialog
        open={conflictDialogOpen}
        onClose={() => {
          setConflictDialogOpen(false);
          setSelectedCourseId(null);
        }}
        onConfirm={handleConfirmSelectCourse}
        conflictCourses={conflictCourses}
      />

      <FileUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="error" 
          onClose={() => setError('')}
          sx={{ 
            width: '100%',
            backgroundColor: 'error.main',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white',
            },
          }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          onClose={() => setSuccessMessage('')}
          sx={{ 
            width: '100%',
            backgroundColor: 'primary.main',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white',
            },
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CourseListPage; 