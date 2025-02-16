import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
} from '@mui/material';
import { userService } from '../../services/userService';
import { User } from '../../types/user';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const fetchUserProfile = async () => {
    try {
      const data = await userService.getUserProfile();
      setUser(data);
      setFormData({
        username: data.username,
        email: data.email,
      });
    } catch (err: any) {
      setError('获取用户信息失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async () => {
    try {
      const updatedUser = await userService.updateUserProfile(formData);
      setUser(updatedUser);
      setEditMode(false);
      setSuccessMessage('个人信息更新成功');
    } catch (err: any) {
      setError(err.response?.data?.detail || '更新个人信息失败');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }

    try {
      await userService.changePassword(passwordData.oldPassword, passwordData.newPassword);
      setSuccessMessage('密码修改成功');
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || '修改密码失败');
    }
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
      <Typography variant="h4" gutterBottom>
        个人信息
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  基本信息
                </Typography>
                <TextField
                  fullWidth
                  label="用户名"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="学号"
                  value={user?.student_id}
                  disabled
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="邮箱"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  margin="normal"
                />
                <Box sx={{ mt: 2 }}>
                  {!editMode ? (
                    <Button variant="contained" onClick={() => setEditMode(true)}>
                      编辑信息
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button variant="contained" onClick={handleUpdateProfile}>
                        保存
                      </Button>
                      <Button variant="outlined" onClick={() => setEditMode(false)}>
                        取消
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                修改密码
              </Typography>
              <TextField
                fullWidth
                type="password"
                label="当前密码"
                name="oldPassword"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
                margin="normal"
              />
              <TextField
                fullWidth
                type="password"
                label="新密码"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                margin="normal"
              />
              <TextField
                fullWidth
                type="password"
                label="确认新密码"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                margin="normal"
              />
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleChangePassword}
                  disabled={
                    !passwordData.oldPassword ||
                    !passwordData.newPassword ||
                    !passwordData.confirmPassword
                  }
                >
                  修改密码
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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

export default ProfilePage; 