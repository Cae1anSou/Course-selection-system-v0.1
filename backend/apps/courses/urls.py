from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, StudentCourseViewSet

router = DefaultRouter()
router.register("courses", CourseViewSet)
router.register("selections", StudentCourseViewSet, basename="selection")

urlpatterns = [
    path("", include(router.urls)),
]
