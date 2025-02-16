import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './styles/theme';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HomePage from './pages/home/HomePage';
import CourseListPage from './pages/course/CourseListPage';
import CourseDetailPage from './pages/course/CourseDetailPage';
import SelectedCoursesPage from './pages/course/SelectedCoursesPage';
import ProfilePage from './pages/profile/ProfilePage';

// 路由守卫组件
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* 需要认证的路由 */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout>
                  <HomePage />
                </MainLayout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/courses"
            element={
              <PrivateRoute>
                <MainLayout>
                  <CourseListPage />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/courses/:courseId"
            element={
              <PrivateRoute>
                <MainLayout>
                  <CourseDetailPage />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/courses/selected"
            element={
              <PrivateRoute>
                <MainLayout>
                  <SelectedCoursesPage />
                </MainLayout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <MainLayout>
                  <ProfilePage />
                </MainLayout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;

