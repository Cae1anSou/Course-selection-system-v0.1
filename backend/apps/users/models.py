from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    自定义用户模型
    扩展Django默认用户模型，添加额外字段
    """

    student_id = models.CharField(max_length=20, unique=True, verbose_name="学号")
    ROLE_CHOICES = (
        ("student", "学生"),
        ("admin", "管理员"),
    )
    role = models.CharField(
        max_length=10, choices=ROLE_CHOICES, default="student", verbose_name="用户角色"
    )

    class Meta:
        verbose_name = "用户"
        verbose_name_plural = verbose_name

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
