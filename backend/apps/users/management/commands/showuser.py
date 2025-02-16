from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "显示用户信息"

    def add_arguments(self, parser):
        parser.add_argument("username", type=str, help="要显示信息的用户名")

    def handle(self, *args, **options):
        try:
            username = options["username"]
            user = User.objects.get(username=username)

            self.stdout.write(self.style.SUCCESS("\n用户信息:"))
            self.stdout.write(f"用户名: {user.username}")
            self.stdout.write(f"学号: {user.student_id}")
            self.stdout.write(f"邮箱: {user.email}")
            self.stdout.write(f"角色: {user.get_role_display()}")
            self.stdout.write(f"是否是超级用户: {user.is_superuser}")
            self.stdout.write(f"是否激活: {user.is_active}\n")

        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"用户 {username} 不存在"))
