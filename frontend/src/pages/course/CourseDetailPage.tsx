import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AccessTime as AccessTimeIcon,
  Room as RoomIcon,
  Person as PersonIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { courseService } from '../../services/courseService';
import { Course } from '../../types/course';
import ConflictDialog from '../../components/course/ConflictDialog';

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const [conflictCourses, setConflictCourses] = useState<Course[]>([]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      const data = await courseService.getCourseDetail(Number(courseId));
      setCourse(data);
    } catch (err: any) {
      setError('获取课程详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseDetail();
    }
  }, [courseId]);

  const handleSelectCourse = async () => {
    if (!course) return;
    try {
      // 检查课程冲突
      const conflictResult = await courseService.checkConflict(course.id);
      if (conflictResult.has_conflict) {
        setConflictCourses(conflictResult.conflict_courses);
        setConflictDialogOpen(true);
        return;
      }
      
      // 无冲突，直接选课
      await courseService.selectCourse(course.id);
      setSuccessMessage('选课成功');
      fetchCourseDetail();
    } catch (err: any) {
      setError(err.response?.data?.detail || '选课失败');
    }
  };

  const handleConfirmSelectCourse = async () => {
    if (!course) return;
    try {
      await courseService.selectCourse(course.id);
      setSuccessMessage('选课成功');
      setConflictDialogOpen(false);
      fetchCourseDetail();
    } catch (err: any) {
      setError(err.response?.data?.detail || '选课失败');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!course) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="error">
          未找到课程信息
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/courses')}
          sx={{ mt: 2 }}
        >
          返回课程列表
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate('/courses')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">课程详情</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* 基本信息卡片 */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {course.name}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                课程号：{course.course_code}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon sx={{ mr: 1 }} color="action" />
                    <Typography>
                      教师：{course.teacher}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <RoomIcon sx={{ mr: 1 }} color="action" />
                    <Typography>
                      教室：{course.classroom}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTimeIcon sx={{ mr: 1 }} color="action" />
                    <Typography>
                      时间：{course.time_slot}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InfoIcon sx={{ mr: 1 }} color="action" />
                <Typography variant="body1">
                  课程描述
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary" paragraph>
                {course.description || '暂无课程描述'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 选课状态卡片 */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                选课状态
              </Typography>
              <Box sx={{ my: 2 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  课程容量
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h4">
                    {course.selected_count}/{course.capacity}
                  </Typography>
                  <Chip
                    label={course.selected_count >= course.capacity ? '已满' : '可选'}
                    color={course.selected_count >= course.capacity ? 'error' : 'success'}
                    size="small"
                  />
                </Box>
              </Box>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSelectCourse}
                disabled={course.selected_count >= course.capacity}
                sx={{ mt: 2 }}
              >
                选择课程
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ConflictDialog
        open={conflictDialogOpen}
        onClose={() => setConflictDialogOpen(false)}
        onConfirm={handleConfirmSelectCourse}
        conflictCourses={conflictCourses}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert severity="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CourseDetailPage; 