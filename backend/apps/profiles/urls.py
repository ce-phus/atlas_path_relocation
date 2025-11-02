from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConsultantViewset, ProfileViewset, DocumentViewset, TaskViewset

router = DefaultRouter()
router.register(r'consultants', ConsultantViewset, basename='consultant')
router.register(r'profiles', ProfileViewset, basename='profile')
router.register(r'documents', DocumentViewset, basename='document')
router.register(r'tasks', TaskViewset, basename='task')

urlpatterns = [
    path('user_profile/', include(router.urls)),
]