from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.management.commands.changepassword import (
    Command as ChangePasswordCommand,
)

User = get_user_model()


class Command(ChangePasswordCommand):
    help = "修改用户密码并显示用户信息"

    def handle(self, *args, **options):
        # 调用父类的handle方法来修改密码
        super().handle(*args, **options)

        # 获取用户信息并显示
        username = options.get("username")
        user = User.objects.get(username=username)
        self.stdout.write(self.style.SUCCESS(f"\n用户信息:"))
        self.stdout.write(f"用户名: {user.username}")
        self.stdout.write(f"学号: {user.student_id}")
        self.stdout.write(f"邮箱: {user.email}")
        self.stdout.write(f"角色: {user.get_role_display()}")
        self.stdout.write(f"是否是超级用户: {user.is_superuser}")
        self.stdout.write(f"是否激活: {user.is_active}\n")
