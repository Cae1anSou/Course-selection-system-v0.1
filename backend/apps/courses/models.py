from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Course(models.Model):
    """课程模型"""
    name = models.CharField(max_length=100, verbose_name='课程名称')
    course_code = models.CharField(max_length=20, unique=True, verbose_name='课程代码')
    teacher = models.CharField(max_length=50, verbose_name='授课教师')
    classroom = models.CharField(max_length=50, verbose_name='教室')
    capacity = models.IntegerField(default=0, verbose_name='课程容量')
    selected_count = models.IntegerField(default=0, verbose_name='已选人数')
    time_slot = models.CharField(max_length=100, verbose_name='上课时间')
    description = models.TextField(blank=True, verbose_name='课程描述')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = '课程'
        verbose_name_plural = verbose_name
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} ({self.course_code})'

class StudentCourse(models.Model):
    """学生选课关系模型"""
    student = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='学生')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, verbose_name='课程')
    status = models.CharField(
        max_length=20,
        choices=(
            ('pending', '待处理'),
            ('approved', '已通过'),
            ('rejected', '已拒绝'),
        ),
        default='pending',
        verbose_name='选课状态'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='选课时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = '选课记录'
        verbose_name_plural = verbose_name
        unique_together = ('student', 'course')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.student.username} - {self.course.name}'
