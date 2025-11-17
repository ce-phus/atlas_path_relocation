from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'cases',views.RelocationCaseViewSet)
router.register(r'expense', views.ExpenseViewSet)
router.register(r'allocation', views.BudgetAllocationViewSet)
router.register(r'dashboard', views.DashboardViewset, basename="dashboard")

urlpatterns = [
    path('', include(router.urls))
]
