import api from './api';
import { User, UpdateUserProfile } from '../types/user';

export const userService = {
  // 获取用户信息
  getUserProfile: async () => {
    const response = await api.get<User>('/users/profile/');
    return response.data;
  },

  // 更新用户信息
  updateUserProfile: async (data: UpdateUserProfile) => {
    const response = await api.patch<User>('/users/profile/', data);
    return response.data;
  },

  // 修改密码
  changePassword: async (oldPassword: string, newPassword: string) => {
    const response = await api.post('/users/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  },
}; 