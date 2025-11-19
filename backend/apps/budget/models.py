from django.db import models
from apps.common.models import TimeStampedUUIDModel
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _
import uuid
from django.utils import timezone

from django.contrib.auth import get_user_model

User = get_user_model()

class RelocationCase(TimeStampedUUIDModel):
    RELOCATION_TYPE = [
        ('International', 'International'),
        ('Domestic', 'Domestic'),
        ('Corporate', 'Corporate'),
        ('family', 'Family')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='relocation_cases', verbose_name=_("User"))
    consultant = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_cases', verbose_name=_("Consultant"))
    case_number = models.CharField(max_length=100, unique=True, verbose_name=_("Case Number"))
    relocation_type = models.CharField(max_length=50, choices=RELOCATION_TYPE, verbose_name=_("Relocation Type"))
    total_budget = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)], verbose_name=_("Total Budget"))


    def save(self, *args, **kwargs):
        if not self.case_number:
            timestamp = timezone.now().strftime("%Y%m%d")
            unique_id = str(uuid.uuid4())[:8].upper()
            self.case_number = f"RC-{timestamp}-{unique_id}"
        super().save(*args, **kwargs)

    def __str__(self):
        if self.user and hasattr(self.user, 'get_full_name'):
            return f"Case {self.case_number} - {self.user.get_full_name()}"
        return f"Case {self.case_number}"



class BudgetCategory(TimeStampedUUIDModel):
    name = models.CharField(max_length=100, verbose_name=_(" Budget Category Name"))
    description = models.TextField(blank=True, verbose_name=_("Category Description"))
    default_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name=_("Default Amount"))

    def __str__(self):
        return self.name

class Expense(TimeStampedUUIDModel):
    EXPENSE_STATUS = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('paid', 'Paid'),
    ]

    case = models.ForeignKey(RelocationCase, on_delete=models.CASCADE, related_name="expenses", verbose_name=_("Expense Case"))
    category = models.ForeignKey(BudgetCategory, on_delete=models.PROTECT, verbose_name=_("Expense Budget Category"))
    title = models.CharField(max_length=200, verbose_name=_("Expense Title"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)], verbose_name=_("Amount"))
    receipt = models.FileField(upload_to="expense_receipts/", null=True, blank=True, verbose_name=_("Receipts"))
    expense_date = models.DateField()
    status = models.CharField(max_length=50, choices = EXPENSE_STATUS, default="draft")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_("Created By"))

    def __str__(self):
        return f"{self.title} - {self.amount} ({self.status})"


class BudgetAllocation(TimeStampedUUIDModel):
    case = models.ForeignKey(RelocationCase, on_delete=models.CASCADE, verbose_name=_("Budget Allocations"), related_name="budget_allocations")
    category = models.ForeignKey(BudgetCategory, on_delete=models.CASCADE, verbose_name=_("Budget Category"))
    allocated_amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)], verbose_name=_("Allocated Amount"))
    actual_spent = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)], verbose_name=_("Actual Spent"), default=0)

    class Meta:
        unique_together = ['case', 'category']

    def __str__(self):
        return f"{self.case.case_number} - {self.category.name}: Allocated {self.allocated_amount}, Spent {self.actual_spent}"


