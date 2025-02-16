import api from './api';
import { Course, CourseResponse, StudentCourse, StudentCourseResponse } from '../types/course';

export const courseService = {
  // 检查课程冲突
  checkConflict: async (courseId: number) => {
    const response = await api.get<{ has_conflict: boolean; conflict_courses: Course[] }>(
      `/courses/${courseId}/check-conflict/`
    );
    return response.data;
  },

  // 获取课程列表
  getCourses: async (page: number = 1, search: string = '') => {
    const response = await api.get<CourseResponse>('/courses/courses/', {
      params: { page, search },
    });
    return response.data;
  },

  // 获取课程详情
  getCourseDetail: async (courseId: number) => {
    const response = await api.get<Course>(`/courses/courses/${courseId}/`);
    return response.data;
  },

  // 获取学生已选课程
  getStudentCourses: async (page: number = 1) => {
    const response = await api.get<StudentCourseResponse>('/courses/selections/', {
      params: { page },
    });
    return response.data;
  },

  // 选课
  selectCourse: async (courseId: number) => {
    const response = await api.post<StudentCourse>(`/courses/selections/`, {
      course: courseId,
    });
    return response.data;
  },

  // 退课
  dropCourse: async (courseId: number) => {
    await api.delete(`/courses/selections/${courseId}/`);
  },

  // 导入课程
  importCourses: async (formData: FormData) => {
    const response = await api.post('/courses/courses/import_courses/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
}; 