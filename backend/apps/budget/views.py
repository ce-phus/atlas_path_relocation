from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Q
from .models import RelocationCase, Expense, BudgetAllocation, BudgetCategory
from .serializers import *
from apps.profiles.models import Profile

class RelocationCaseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = RelocationCaseSerializer

    def get_queryset(self):
        user = self.request.user

        # CLient see their own cases, consultants see assigned cases
        if hasattr(user, "managed_cases"):
            return RelocationCase.objects.filter(
                Q(user=user) | Q(consultant=user)
            ).distinct()
        
        return RelocationCase.objects.filter(user=user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ExpenseViewSet(viewsets.ModelViewSet):
    permission_classes=[IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return ExpenseCreateSerializer
        return ExpenseSerializer
    
    def get_queryset(self):
        user=self.request.user

        queryset = Expense.objects.select_related("case", "category")

        queryset = queryset.filter(created_by=user)

        # client see their expenses, consultants see expenses for their cases
        if hasattr(user, "managed_cases"):
            return queryset.filter(
                Q(case__user=user) | Q(case__consultant=user)
            ).distinct()
        return queryset.filter(case__user=user)
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"])
    def submit_for_approval(self, request, pk=None):
        expense = self.get_object()
        if expense.created_by !=request.user:
            return Response({"error": "Not authorised"}, status=status.HTTP_403_FORBIDDEN)
        expense.status = "submitted"

        expense.save()
        return Response({
            "status": "submitted for approval"
        })
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        expense = self.get_object()
        if expense.case.consultant != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        expense.status = 'approved'
        expense.save()
        
        # Update budget allocation actual spent
        allocation = BudgetAllocation.objects.get(
            case=expense.case, 
            category=expense.category
        )
        allocation.actual_spent += expense.amount
        allocation.save()
        
        return Response({'status': 'approved'})
    
class BudgetAllocationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = BudgetAllocationSerializer
    
    def get_queryset(self):
        user = self.request.user
        case_id = self.request.query_params.get('case_id')
        
        queryset = BudgetAllocation.objects.select_related('case', 'category')
        
        if case_id:
            queryset = queryset.filter(case_id=case_id)
        
        if hasattr(user, 'managed_cases'):
            return queryset.filter(
                Q(case__user=user) | Q(case__consultant=user)
            ).distinct()
        return queryset.filter(case__user=user)
    
class DashboardViewset(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def budget_summary(self, request):
        try:
            user = request.user

            case = RelocationCase.objects.filter(user=user).first()
            
            if not case:

                return Response({
                    'total_budget': 0,
                    'total_allocated': 0,
                    'total_spent': 0,
                    'remaining_budget': 0,
                    'categories': []
                })

            total_allocated = BudgetAllocation.objects.filter(
                case=case,
            ).aggregate(total=Sum("allocated_amount"))['total'] or 0

            total_spent = Expense.objects.filter(
                case=case,
                status__in=["approved", "paid"]
            ).aggregate(total=Sum("amount"))['total'] or 0

            categories = BudgetAllocation.objects.filter(case=case)
            category_data = []
            
            for cat in categories:
                allocated = cat.allocated_amount or 0
                spent = cat.actual_spent or 0

                category_data.append({
                    "category": cat.category.name,
                    "allocated": float(allocated),
                    "spent": float(spent),
                    "remaining": float(allocated - spent)
                })

            total_budget = case.total_budget or 0

            return Response({
                'total_budget': float(total_budget),
                'total_allocated': float(total_allocated),
                'total_spent': float(total_spent),
                'remaining_budget': float(total_budget - total_spent),
                'categories': category_data
            })
            
        except Exception as e:
            return Response(
                {'error': f'Server error: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
