from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConsultantViewset, ProfileViewset, DocumentViewset, TaskViewset, GetProfileAPIView, DocumentSearchAPIView, DocumentStatusOverviewAPIView

router = DefaultRouter()
router.register(r'consultants', ConsultantViewset, basename='consultant')
router.register(r'profiles', ProfileViewset, basename='profile')
router.register(r'documents', DocumentViewset, basename='document')
router.register(r'tasks', TaskViewset, basename='task')

urlpatterns = [
    path('', include(router.urls)),
    path('get_profile/', GetProfileAPIView.as_view(), name='get_profile'),
    path('search_documents/', DocumentSearchAPIView.as_view(), name='search_documents'),
    path('document_status_overview/', DocumentStatusOverviewAPIView.as_view(), name='document_status_overview'),
]