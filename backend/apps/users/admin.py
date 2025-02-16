from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

User = get_user_model()


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """用户管理"""

    list_display = ("username", "student_id", "email", "role", "is_active", "is_staff")
    list_filter = ("role", "is_active", "is_staff")
    search_fields = ("username", "student_id", "email")
    ordering = ("username",)

    fieldsets = BaseUserAdmin.fieldsets + (
        ("额外信息", {"fields": ("student_id", "role")}),
    )
