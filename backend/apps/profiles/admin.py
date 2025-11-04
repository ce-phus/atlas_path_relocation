# admin.py
from django.contrib import admin
from .models import Consultant, Profile, Document, Task

@admin.register(Consultant)
class ConsultantAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'user', 'specialization', 'is_active', 'current_client_count')
    readonly_fields = ('employee_id', 'current_client_count')
    search_fields = ('employee_id', 'user__first_name', 'user__last_name')
    list_filter = ('specialization', 'is_active', 'availability_status')

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'relocation_type', 'current_city', 'destination_city', 'get_consultant_employee_id', 'overall_progress')
    list_filter = ('relocation_type', 'current_country', 'destination_country')
    search_fields = ('user__first_name', 'user__last_name', 'relocation_consultant__employee_id')
    
    def get_consultant_employee_id(self, obj):
        return obj.get_consultant_employee_id()
    get_consultant_employee_id.short_description = 'Consultant ID'


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('profile', 'document_type', 'created_at', 'reviewed_by', "status")
    list_filter = ('document_type', 'status')
    search_fields = ('profile__user__first_name', 'profile__user__last_name', 'document_type')

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('profile', 'description',  'due_date', 'title', "is_completed",)
    list_filter = ('title', "profile")
    search_fields = ('profile__user__first_name', 'profile__user__last_name', 'task_type')