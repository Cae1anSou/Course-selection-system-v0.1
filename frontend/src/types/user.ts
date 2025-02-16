export interface User {
  id: number;
  username: string;
  student_id: string;
  email: string;
  role: 'student' | 'admin';
}

export interface UpdateUserProfile {
  username?: string;
  email?: string;
  old_password?: string;
  new_password?: string;
} 