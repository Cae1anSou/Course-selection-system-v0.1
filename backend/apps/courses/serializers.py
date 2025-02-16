from rest_framework import serializers
from .models import Course, StudentCourse

class CourseSerializer(serializers.ModelSerializer):
    """课程序列化器"""
    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = ('selected_count', 'created_at', 'updated_at')

class StudentCourseSerializer(serializers.ModelSerializer):
    """选课关系序列化器"""
    course_name = serializers.CharField(source='course.name', read_only=True)
    teacher = serializers.CharField(source='course.teacher', read_only=True)
    time_slot = serializers.CharField(source='course.time_slot', read_only=True)
    classroom = serializers.CharField(source='course.classroom', read_only=True)
    
    class Meta:
        model = StudentCourse
        fields = ('id', 'course', 'course_name', 'teacher', 'time_slot', 
                 'classroom', 'status', 'created_at', 'updated_at')
        read_only_fields = ('status', 'created_at', 'updated_at')
