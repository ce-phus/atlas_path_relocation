# admin.py
from django.contrib import admin
from .models import Consultant, Profile

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