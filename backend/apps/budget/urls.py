from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'cases',views.RelocationCaseViewSet, basename="cases")
router.register(r'expense', views.ExpenseViewSet, basename="expense")
router.register(r'allocation', views.BudgetAllocationViewSet, basename="allocation")
router.register(r'dashboard', views.DashboardViewset, basename="dashboard")

urlpatterns = [
    path('', include(router.urls))
]
