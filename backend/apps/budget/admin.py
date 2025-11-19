from django.contrib import admin
from .models import BudgetAllocation, BudgetCategory, Expense, RelocationCase

@admin.register(BudgetCategory)
class BudgetCategoryAdmin(admin.ModelAdmin):
    list_display=("name", "description", "default_amount")
    search_fields=("name", "description", "default_amount")
    list_filter=("name", "description", "default_amount")

@admin.register(BudgetAllocation)
class BudgetAllocationAdmin(admin.ModelAdmin):
    list_display=("case", "category", "allocated_amount", "actual_spent")
    list_filter = ("case", "category")
    search_fields=("case", "category")

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_filter=("status", "case", "category", "title", "description")
    list_display=("status", "case", "category", "title", "description", "created_by")
    search_fields=("status", "case", "category", "title", "description")

@admin.register(RelocationCase)
class RelocationAdmin(admin.ModelAdmin):
    list_display=("user", "consultant", "case_number", "relocation_type")
    list_filter=("user", "consultant", "case_number", "relocation_type")
    search_fields=("user", "consultant", "case_number", "relocation_type")
    readonly_fields=("case_number",)



