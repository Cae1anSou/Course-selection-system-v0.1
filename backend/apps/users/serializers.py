from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """用户信息序列化器"""

    class Meta:
        model = User
        fields = ("id", "username", "student_id", "role", "email")
        read_only_fields = ("role",)


class UserRegisterSerializer(serializers.ModelSerializer):
    """用户注册序列化器"""

    password2 = serializers.CharField(write_only=True, style={"input_type": "password"})
    role_display = serializers.CharField(source="get_role_display", read_only=True)

    class Meta:
        model = User
        fields = (
            "username",
            "password",
            "password2",
            "student_id",
            "email",
            "role",
            "role_display",
            "is_active",
            "is_superuser",
        )
        extra_kwargs = {
            "password": {"write_only": True, "style": {"input_type": "password"}},
            "username": {"error_messages": {"required": "请输入用户名"}},
            "student_id": {"error_messages": {"required": "请输入学号"}},
            "email": {"error_messages": {"required": "请输入邮箱"}},
            "role": {"read_only": True},
            "is_active": {"read_only": True},
            "is_superuser": {"read_only": True},
        }

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password2": "两次输入的密码不一致"})

        # 验证密码长度
        if len(attrs["password"]) < 8:
            raise serializers.ValidationError({"password": "密码长度至少为8个字符"})

        # 验证学号格式
        if not attrs["student_id"].isdigit():
            raise serializers.ValidationError({"student_id": "学号必须是数字"})

        # 验证邮箱是否已存在
        if User.objects.filter(email=attrs["email"]).exists():
            raise serializers.ValidationError({"email": "该邮箱已被注册"})

        # 验证学号是否已存在
        if User.objects.filter(student_id=attrs["student_id"]).exists():
            raise serializers.ValidationError({"student_id": "该学号已被注册"})

        # 验证用户名是否已存在
        if User.objects.filter(username=attrs["username"]).exists():
            raise serializers.ValidationError({"username": "该用户名已被注册"})

        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        user = User.objects.create_user(**validated_data)
        # 打印用户信息到控制台
        print("\n创建的用户信息:")
        print(f"用户名: {user.username}")
        print(f"学号: {user.student_id}")
        print(f"邮箱: {user.email}")
        print(f"角色: {user.get_role_display()}")
        print(f"是否是超级用户: {user.is_superuser}")
        print(f"是否激活: {user.is_active}\n")
        return user
