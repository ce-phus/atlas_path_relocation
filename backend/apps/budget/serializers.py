from rest_framework import serializers
from .models import RelocationCase, BudgetCategory, Expense, BudgetAllocation
from django.contrib.auth import get_user_model

User = get_user_model()

class BudgetCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetCategory
        fields = '__all__'

class ExpenseSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at']

class BudgetAllocationSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    remaining_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = BudgetAllocation
        fields = '__all__'

class RelocationCaseSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.get_full_name', read_only=True)
    consultant_name = serializers.CharField(source='consultant.get_full_name', read_only=True)
    total_spent = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    remaining_budget = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    budget_allocations = BudgetAllocationSerializer(many=True, read_only=True)
    expenses = ExpenseSerializer(many=True, read_only=True)
    
    class Meta:
        model = RelocationCase
        fields = '__all__'

class ExpenseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ['title', 'description', 'amount', 'category', 'receipt', 'expense_date']