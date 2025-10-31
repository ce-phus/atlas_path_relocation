from django.db import models
from apps.common.models import TimeStampedUUIDModel
from django.utils.translation import gettext_lazy as _
from phonenumber_field.modelfields import PhoneNumberField
from django_countries.fields import CountryField

class Consultant(TimeStampedUUIDModel):
    user = models.OneToOneField(
        'users.User',
        on_delete=models.CASCADE,
        related_name='consultant_profile'
    )
    employee_id = models.CharField(max_length=50, unique=True, verbose_name=_("Employee ID"))

    SPECIALIZATION_CHOICES = [
        ("corporate_law", "Corporate Relocation"),
        ("international", "International Relocation"),
        ("domestic", "Domestic Relocation"),
        ("family", "Family Relocation"),
    ]

    specialization = models.CharField(
        max_length=50,
        choices=SPECIALIZATION_CHOICES,
        verbose_name=_("Specialization")
    )

    country = CountryField(
        verbose_name=_("Country"), default="KE", blank=False, null=False
    )

    years_experience = models.PositiveIntegerField(verbose_name=_("Years of Experience"), default=0)
    bio = models.TextField(blank=True, verbose_name=_("Bio"))
    expertise = models.JSONField(default=list, blank=True, verbose_name=_("Areas of Expertise"))

    is_active = models.BooleanField(default=True, verbose_name=_("Is Active"))
    max_clients = models.PositiveIntegerField(default=10, verbose_name=_("Maximum Clients"))
    current_client_count = models.PositiveIntegerField(default=0, verbose_name=_("Current Client Count"))

    work_phone = PhoneNumberField(
        verbose_name=_("Work Phone Number"), max_length=30, default="+254750000000"
    )
    work_email = models.EmailField(blank=True, verbose_name=_("Work Email"))

    AVAILABLE_CHOICES = [
        ("available", "Available"),
        ("unavailable", "Unavailable"),
        ("busy", "Busy"),
    ]

    availability_status = models.CharField(
        max_length=20,
        choices=AVAILABLE_CHOICES,
        default="available",
        verbose_name=_("Availability Status")
    )

    def save(self, *args, **kwargs):
        if not self.employee_id:
            count = Consultant.objects.count()
            self.employee_id = f"ATP{count + 1:04d}"
        super().save(*args, **kwargs)

    def __str__(self):
        if self.user and hasattr(self.user, 'get_full_name'):
            full_name = self.user.get_full_name()
            return f"Consultant: {self.user.email} - {self.employee_id} - {full_name}"
        return f"Consultant: {self.employee_id}"

class Profile(TimeStampedUUIDModel):
    user = models.OneToOneField(
        'users.User',
        on_delete=models.CASCADE,
        related_name='profile'
    )

    profile_photo = models.ImageField(
        upload_to='profile_pictures/',
        null=True,
        blank=True,
        verbose_name=_("Profile Photo")
    )

    phone_number = PhoneNumberField(
        verbose_name=_("Phone Number"), max_length=30, default="+254700000000"
    )

    date_of_birth = models.DateField(
        null=True,
        blank=True,
        verbose_name=_("Date of Birth")
    )

    country = CountryField(
        verbose_name=_("Country"), default="KE", blank=False, null=False
    )

    RELOCATION_TYPES = [
        ("corporate_law", "Corporate Relocation"),
        ("international", "International Relocation"),
        ("domestic", "Domestic Relocation"),
        ("family", "Family Relocation"),
    ]
    relocation_type = models.CharField(
        max_length=50,
        choices=RELOCATION_TYPES,
        null=True,
        blank=True,
        verbose_name=_("Relocation Type")
    )

    current_country = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        verbose_name=_("Current Country")
    )
    current_city = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        verbose_name=_("Current City")
    )

    destination_country = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        verbose_name=_("Destination Country")
    )

    destination_city = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        verbose_name=_("Destination City")
    )

    expected_relocation_date = models.DateField(
        null=True,
        blank=True,
        verbose_name=_("Expected Relocation Date")
    )

    relocation_start_date = models.DateField(
        null=True,
        blank=True,
        verbose_name=_("Relocation Start Date")
    )

    expected_move_date = models.DateField(
        null=True,
        blank=True,
        verbose_name=_("Expected Move Date")
    )

    family_members = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name=_("Number of Family Members")
    )

    has_children = models.BooleanField(
        default=False,
        verbose_name=_("Has Children")
    )
    children_ages = models.JSONField(
        default=list,
        blank=True,
        verbose_name=_("Children Ages")
    )

    housing_budget_min = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_("Housing Budget Minimum")
    )

    housing_budget_max = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_("Housing Budget Maximum")
    )

    preferred_neighborhoods = models.JSONField(
        default=list,
        blank=True,
        verbose_name=_("Preferred Neighborhoods")
    )

    PREFFERED_CONTACT_METHODS = [
        ("email", "Email"),
        ("phone", "Phone"),
        ("whatsapp", "WhatsApp"),
    ]

    preferred_contact_method = models.CharField(
        max_length=20,
        choices=PREFFERED_CONTACT_METHODS,
        default="email",
        verbose_name=_("Preferred Contact Method")
    )

    notification_preferences = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_("Notification Preferences")
    )

    relocation_consultant = models.ForeignKey(
        Consultant,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_clients',
        verbose_name=_("Relocation Consultant")
    )

    overall_progress = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Overall Progress (%)")
    )

    current_stage = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        verbose_name=_("Current Stage of Relocation")
    )

    def __str__(self):
        if self.user and hasattr(self.user, 'get_full_name'):
            full_name = self.user.get_full_name()
            return f"Profile: {full_name} - {self.relocation_type}"
        return f"Profile: {self.user.email if self.user else 'No User'}"
        
    def get_consultant_employee_id(self):
        if self.relocation_consultant:
            return self.relocation_consultant.employee_id
        return "No Consultant Assigned"
    
    def get_consultant_name(self):
        if self.relocation_consultant and self.relocation_consultant.user:
            return self.relocation_consultant.user.get_full_name()
        return "No Consultant Assigned"
    

class Document(TimeStampedUUIDModel):
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    document_type = models.CharField(
        max_length=100,
        verbose_name=_("Document Type")
    )

    document_file = models.FileField(
        upload_to='documents/',
        verbose_name=_("Document File")
    )
    STATUS_CHOICES = [
        ("submitted", "Submitted"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("awaiting review", "Awaiting Review"),
    ]

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="submitted",
        verbose_name=_("Document Status")
    )
    reviewed_by = models.ForeignKey(
        Consultant,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_documents',
        verbose_name=_("Reviewed By")
    )

    def __str__(self):
        if self.profile and self.profile.user and hasattr(self.profile.user, 'get_full_name'):
            full_name = self.profile.user.get_full_name()
            return f"Document: {self.document_type} for {full_name}"
        return f"Document: {self.document_type}"
    
class Task(TimeStampedUUIDModel):
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    title = models.CharField(
        max_length=200,
        verbose_name=_("Task Title")
    )
    description = models.TextField(
        blank=True,
        verbose_name=_("Task Description")
    )
    due_date = models.DateField(
        null=True,
        blank=True,
        verbose_name=_("Due Date")
    )
    is_completed = models.BooleanField(
        default=False,
        verbose_name=_("Is Completed")
    )

    def __str__(self):
        if self.profile and self.profile.user and hasattr(self.profile.user, 'get_full_name'):
            full_name = self.profile.user.get_full_name()
            return f"Task: {self.title} for {full_name}"
        return f"Task: {self.title}"