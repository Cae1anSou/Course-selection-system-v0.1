from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import UserRegisterView, UserProfileView

urlpatterns = [
    # JWT认证相关
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # 用户相关
    path("register/", UserRegisterView.as_view(), name="user_register"),
    path("profile/", UserProfileView.as_view(), name="user_profile"),
]
