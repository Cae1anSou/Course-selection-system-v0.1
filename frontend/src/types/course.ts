export interface Course {
  id: number;
  name: string;
  course_code: string;
  teacher: string;
  classroom: string;
  capacity: number;
  selected_count: number;
  time_slot: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface StudentCourse {
  id: number;
  course: number;
  course_name: string;
  teacher: string;
  time_slot: string;
  classroom: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface CourseResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Course[];
}

export interface StudentCourseResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: StudentCourse[];
} 