import React, { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    password2: '',
    student_id: '',
    email: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // 注册用户
      await api.post('/users/register/', formData);
      
      // 使用注册的凭据直接登录
      const loginResponse = await api.post('/users/token/', {
        username: formData.username,
        password: formData.password,
      });
      
      const { access, refresh } = loginResponse.data;
      
      // 保存 token
      localStorage.setItem('token', access);
      localStorage.setItem('refreshToken', refresh);
      
      // 获取用户信息
      const userResponse = await api.get('/users/profile/');
      localStorage.setItem('user', JSON.stringify(userResponse.data));
      
      // 跳转到首页
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || '注册失败，请检查输入信息');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            注册账号
          </Typography>
          <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
            创建您的学生选课系统账号
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="用户名"
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="学号"
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="邮箱"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="密码"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="确认密码"
              name="password2"
              type="password"
              value={formData.password2}
              onChange={handleChange}
              margin="normal"
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3 }}
            >
              注册
            </Button>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link href="/login" variant="body2">
                已有账号？点击登录
              </Link>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterPage; 