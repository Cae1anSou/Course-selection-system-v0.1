from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from django.db import transaction
from .models import Course, StudentCourse
from .serializers import CourseSerializer, StudentCourseSerializer
from .utils import get_parser, ConflictChecker


class CourseViewSet(viewsets.ModelViewSet):
    """课程视图集"""

    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser]

    def get_permissions(self):
        """根据不同操作设置权限"""
        if self.action in [
            "create",
            "update",
            "partial_update",
            "destroy",
            "import_courses",
        ]:
            permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=["post"])
    def import_courses(self, request):
        """导入课程信息"""
        file = request.FILES.get("file")
        if not file:
            return Response(
                {"detail": "请上传文件"}, status=status.HTTP_400_BAD_REQUEST
            )

        # 获取文件类型
        file_type = file.name.split(".")[-1].lower()
        if file_type not in ["pdf", "csv"]:
            return Response(
                {"detail": "不支持的文件类型"}, status=status.HTTP_400_BAD_REQUEST
            )

        # 获取对应的解析器
        parser = get_parser(file_type)
        if not parser:
            return Response(
                {"detail": "无法处理该文件类型"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # 解析文件
            courses_data = parser.parse(file)

            # 批量创建课程
            created_courses = []
            with transaction.atomic():
                for course_data in courses_data:
                    course, created = Course.objects.get_or_create(
                        course_code=course_data["course_code"], defaults=course_data
                    )
                    if created:
                        created_courses.append(course)

            # 返回创建的课程信息
            serializer = CourseSerializer(created_courses, many=True)
            return Response(
                {
                    "message": f"成功导入 {len(created_courses)} 门课程",
                    "courses": serializer.data,
                }
            )

        except Exception as e:
            return Response(
                {"detail": f"文件解析错误: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"])
    def select_course(self, request, pk=None):
        """选课操作"""
        course = self.get_object()

        # 检查课程容量
        if course.selected_count >= course.capacity:
            return Response({"detail": "课程已满"}, status=status.HTTP_400_BAD_REQUEST)

        # 检查是否已经选过这门课
        if StudentCourse.objects.filter(student=request.user, course=course).exists():
            return Response(
                {"detail": "已经选过这门课程"}, status=status.HTTP_400_BAD_REQUEST
            )

        # 获取学生已选课程
        student_courses = StudentCourse.objects.filter(
            student=request.user,
            status="approved",  # 只检查已通过的选课
        ).select_related("course")

        # 检查时间冲突
        for student_course in student_courses:
            has_conflict, conflict_msg = ConflictChecker.check_conflicts(
                course.time_slot, student_course.course.time_slot
            )
            if has_conflict:
                return Response(
                    {
                        "detail": f"与已选课程 {student_course.course.name} {conflict_msg}"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # 创建选课记录
        with transaction.atomic():
            student_course = StudentCourse.objects.create(
                student=request.user, course=course, status="pending"
            )
            course.selected_count += 1
            course.save()

        serializer = StudentCourseSerializer(student_course)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def drop_course(self, request, pk=None):
        """退课操作"""
        course = self.get_object()

        try:
            student_course = StudentCourse.objects.get(
                student=request.user, course=course
            )
        except StudentCourse.DoesNotExist:
            return Response(
                {"detail": "未选择该课程"}, status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            student_course.delete()
            course.selected_count = max(0, course.selected_count - 1)
            course.save()

        return Response(status=status.HTTP_204_NO_CONTENT)


class StudentCourseViewSet(viewsets.ReadOnlyModelViewSet):
    """学生选课记录视图集"""

    serializer_class = StudentCourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """只返回当前用户的选课记录"""
        return StudentCourse.objects.filter(student=self.request.user)
