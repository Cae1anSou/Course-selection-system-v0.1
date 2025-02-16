from django.contrib import admin
from .models import Course, StudentCourse

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    """课程管理"""
    list_display = ('name', 'course_code', 'teacher', 'classroom', 
                   'capacity', 'selected_count', 'time_slot')
    list_filter = ('teacher',)
    search_fields = ('name', 'course_code', 'teacher')
    ordering = ('course_code',)

@admin.register(StudentCourse)
class StudentCourseAdmin(admin.ModelAdmin):
    """选课记录管理"""
    list_display = ('student', 'course', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('student__username', 'course__name', 'course__course_code')
    ordering = ('-created_at',)
