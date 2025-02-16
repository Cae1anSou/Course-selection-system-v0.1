import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Pagination,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { courseService } from '../../services/courseService';
import { StudentCourse } from '../../types/course';

const SelectedCoursesPage: React.FC = () => {
  const [selectedCourses, setSelectedCourses] = useState<StudentCourse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchSelectedCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getStudentCourses(page);
      setSelectedCourses(response.results);
      setTotalPages(Math.ceil(response.count / 10));
    } catch (err: any) {
      setError('获取已选课程失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSelectedCourses();
  }, [page]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleDropCourse = async (courseId: number) => {
    try {
      await courseService.dropCourse(courseId);
      setSuccessMessage('退课成功');
      fetchSelectedCourses();
    } catch (err: any) {
      setError(err.response?.data?.detail || '退课失败');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      approved: '已通过',
      pending: '待处理',
      rejected: '已拒绝',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  if (loading && selectedCourses.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          已选课程
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {selectedCourses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {course.course_name}
                </Typography>
                <Typography variant="body2" paragraph>
                  教师：{course.teacher}
                </Typography>
                <Typography variant="body2" paragraph>
                  教室：{course.classroom}
                </Typography>
                <Typography variant="body2" paragraph>
                  时间：{course.time_slot}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Chip
                    label={getStatusText(course.status)}
                    color={getStatusColor(course.status) as any}
                  />
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDropCourse(course.id)}
                    disabled={course.status === 'rejected'}
                  >
                    退课
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedCourses.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="textSecondary">
            暂无已选课程
          </Typography>
        </Box>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

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

export default SelectedCoursesPage; 