import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  School as SchoolIcon,
  Book as BookIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { courseService } from '../../services/courseService';
import { User } from '../../types/user';
import { StudentCourse } from '../../types/course';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<StudentCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userData, coursesData] = await Promise.all([
        userService.getUserProfile(),
        courseService.getStudentCourses(),
      ]);
      setUser(userData);
      setSelectedCourses(coursesData.results);
    } catch (err: any) {
      setError('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusCount = (status: string) => {
    return selectedCourses.filter(course => course.status === status).length;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          欢迎回来，{user?.username}
        </Typography>
        <Typography color="textSecondary">
          学号：{user?.student_id}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 快捷入口卡片 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                快捷入口
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<BookIcon />}
                    onClick={() => navigate('/courses')}
                    sx={{ height: '100px' }}
                  >
                    选择课程
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => navigate('/courses/selected')}
                    sx={{ height: '100px' }}
                  >
                    已选课程
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PersonIcon />}
                    onClick={() => navigate('/profile')}
                    sx={{ height: '100px' }}
                  >
                    个人信息
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 选课统计卡片 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                选课统计
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {selectedCourses.length}
                      </Typography>
                      <Typography color="textSecondary">
                        总课程数
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {getStatusCount('approved')}
                      </Typography>
                      <Typography color="textSecondary">
                        已通过
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main">
                        {getStatusCount('pending')}
                      </Typography>
                      <Typography color="textSecondary">
                        待处理
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 最近选课记录 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                最近选课记录
              </Typography>
              {selectedCourses.length > 0 ? (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {selectedCourses.slice(0, 3).map((course) => (
                    <Grid item xs={12} sm={6} md={4} key={course.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            {course.course_name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            教师：{course.teacher}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            时间：{course.time_slot}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Typography
                              variant="body2"
                              color={
                                course.status === 'approved'
                                  ? 'success.main'
                                  : course.status === 'pending'
                                  ? 'warning.main'
                                  : 'error.main'
                              }
                            >
                              状态：
                              {course.status === 'approved'
                                ? '已通过'
                                : course.status === 'pending'
                                ? '待处理'
                                : '已拒绝'}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography color="textSecondary" sx={{ mt: 2 }}>
                  暂无选课记录
                </Typography>
              )}
              {selectedCourses.length > 0 && (
                <Box sx={{ mt: 2, textAlign: 'right' }}>
                  <Button
                    variant="text"
                    onClick={() => navigate('/courses/selected')}
                  >
                    查看全部
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage; 