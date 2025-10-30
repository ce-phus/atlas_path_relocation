from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConsultantViewSet, ProfileViewSet, DocumentViewSet, TaskViewSet

router = DefaultRouter()
router.register(r'consultants', ConsultantViewSet, basename='consultant')
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'tasks', TaskViewSet, basename='task')

urlpatterns = [
    path('profile/', include(router.urls)),
]