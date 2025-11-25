from rest_framework import serializers
from .models import Profile, Consultant, Document, Task
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

class ConsultantSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    full_name = serializers.CharField(source = 'user.get_full_name', read_only=True)
    email = serializers.EmailField(source = 'user.email', read_only=True)

    class Meta:
        model = Consultant
        fields = [
            'id', 'employee_id', 'user', "full_name", "email", "specialization", "country", "years_experience", "bio", "expertise", "is_active", "max_clients", "current_client_count", "work_phone", "work_email", "availability_status", "created_at", "updated_at", "is_consultant"
            ]
        
        read_only_fields = ['employee_id', 'created_at', 'updated_at', "current_client_count"]


class ConsultantCreateSerializer(serializers.ModelSerializer):
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='user',
        write_only=True
    )
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = Consultant
        fields = [
            'id', 'employee_id', 'user_id', 'email', 'first_name', 'last_name', 'full_name', "specialization", "country", "years_experience", "bio", "expertise", "is_active", "max_clients", "current_client_count", "work_phone", "work_email", "availability_status", "created_at", "updated_at"
            ]
        
    def create(self, validated_data):
        user_data = {}
        if "email" in validated_data.get("user", {}):
            user_data["email"] = validated_data["user"]["email"]
        if "first_name" in validated_data.get("user", {}):
            user_data["first_name"] = validated_data["user"]["first_name"]
        if "last_name" in validated_data.get("user", {}):
            user_data["last_name"] = validated_data["user"]["last_name"]

        return Consultant.objects.create(**validated_data)
    
class DocumentSerializer(serializers.ModelSerializer):
    document_name = serializers.CharField(source='document_type', read_only=True)
    client_name = serializers.CharField(source='profile.user.get_full_name', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.user.get_full_name', read_only=True)

    class Meta:
        model = Document
        fields = [
            'id', 'profile', 'document_type', 'document_name', 'document_file',
            'status', 'reviewed_by', 'reviewed_by_name', 'client_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', "profile"]

class TaskSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='profile.user.get_full_name', read_only=True)
    due_date_formatted = serializers.DateField(source='due_date', format='%Y-%m-%d', read_only=True)
    stage_display = serializers.CharField(source='get_stage_display', read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'profile', 'title', 'description', 'due_date', 'due_date_formatted',
            'is_completed', 'client_name', 'created_at', 'updated_at', 'stage_display'
        ]
        read_only_fields = ['created_at', 'updated_at']

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    consultant = ConsultantSerializer(read_only=True)
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    consultant_details = ConsultantSerializer(source='relocation_consultant', read_only=True)
    consultant_name = serializers.CharField(source='get_consultant_name', read_only=True)
    consultant_employee_id = serializers.CharField(source='get_consultant_employee_id', read_only=True)
    documents = DocumentSerializer(many=True, read_only=True)
    tasks = TaskSerializer(many=True, read_only=True)

    class Meta:
        model = Profile
        fields = [
            'id', 'user', 'full_name', 'email', 'profile_photo', 'phone_number',
            'date_of_birth', 'country', 'relocation_type', 'current_country',
            'current_city', 'destination_country', 'destination_city',
            'expected_relocation_date', 'relocation_start_date', 'expected_move_date',
            'family_members', 'has_children', 'children_ages', 'housing_budget_min',
            'housing_budget_max', 'preferred_neighborhoods', 'preferred_contact_method',
            'notification_preferences', 'relocation_consultant', 'consultant_details',
            'consultant_name', 'consultant_employee_id', 'overall_progress',
            'current_stage', 'documents', 'tasks', 'created_at', 'updated_at', "consultant", 'is_consultant'
        ]
        read_only_fields = ['created_at', 'updated_at']

class ProfileCreateSerializer(serializers.ModelSerializer):
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        source='user',
        write_only=True
    )
    email = serializers.EmailField(write_only=True, required=False)
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Profile
        fields = [
            'user_id', 'email', 'first_name', 'last_name', 'phone_number',
            'date_of_birth', 'country', 'relocation_type', 'current_country',
            'current_city', 'destination_country', 'destination_city',
            'expected_relocation_date', 'family_members', 'has_children',
            'housing_budget_min', 'housing_budget_max', 'preferred_contact_method'
        ]

    def create(self, validated_data):
        user_data = {}
        if 'email' in validated_data:
            user_data['email'] = validated_data.pop('email')
        if 'first_name' in validated_data:
            user_data['first_name'] = validated_data.pop('first_name')
        if 'last_name' in validated_data:
            user_data['last_name'] = validated_data.pop('last_name')
        
        return Profile.objects.create(**validated_data)
    
class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            'profile_photo', 'phone_number', 'date_of_birth', 'country',
            'relocation_type', 'current_country', 'current_city',
            'destination_country', 'destination_city', 'expected_relocation_date',
            'expected_move_date', 'family_members', 'has_children', 'children_ages',
            'housing_budget_min', 'housing_budget_max', 'preferred_neighborhoods',
            'preferred_contact_method', 'notification_preferences',
            'relocation_consultant', 'overall_progress', 'current_stage'
        ]