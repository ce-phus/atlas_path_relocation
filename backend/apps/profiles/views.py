from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Profile, Consultant, Document, Task
from .serializers import (
    ProfileSerializer,
    ConsultantSerializer,
    ConsultantCreateSerializer,
    DocumentSerializer,
    TaskSerializer,
    ProfileCreateSerializer,
    ProfileUpdateSerializer
)
from django.db import models
from rest_framework.views import APIView

class ConsultantViewset(viewsets.ModelViewSet):
    queryset = Consultant.objects.select_related('user').all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["specialization", "country", "availability_status", "is_active"]
    search_fields = ["user__first_name", "user__last_name", "employee_id", "bio", "expertise"]
    ordering_fields = ["years_of_experience", "current_client_count", "created_at"]

    def get_serializer_class(self):
        if self.action == "create":
            return ConsultantCreateSerializer
        return ConsultantSerializer
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return self.queryset
        return self.queryset.filter(is_active=True, availability_status="available")
    
    @action(detail=True, methods=["post"])
    def update_availability(self, request, pk=None):
        consultant = self.get_object()
        new_status = request.data.get("availability_status")

        if new_status in dict(Consultant.AVAILABLE_CHOICES): 
            consultant.availability_status = new_status
            consultant.save()
            return Response({"status": "availability updated"}, status=status.HTTP_200_OK)
        return Response({"error": "invalid status"}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=["get"]) 
    def available_consultants(self, request):
        available_consultants = self.get_queryset().filter( 
            current_client_count__lt=models.F('max_clients')
        )
        serializer = self.get_serializer(available_consultants, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class ProfileViewset(viewsets.ModelViewSet):
    queryset = Profile.objects.select_related('user', "relocation_consultant__user").prefetch_related("documents", "tasks").all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["relocation_type","current_country", "destination_country", "has_children"]
    search_fields = ["user__first_name", "user__last_name", "user__email"]
    ordering_fields = ["overall_progress", "created_at"]

    def get_serializer_class(self):
        if self.action == "create":
            return ProfileCreateSerializer
        elif self.action in ["update", "partial_update"]:
            return ProfileUpdateSerializer
        return ProfileSerializer
    
    def get_queryset(self):
        user = self.request.user

        if hasattr(user, "consultant_profile"):
            return self.queryset.filter(relocation_consultant=user.consultant_profile)
        
        # if user is a client, only show their own profile
        elif hasattr(user, "profile"):
            return self.queryset.filter(user=user)
        
        # For other users (e.g., admins), return all profiles
        elif user.is_staff:
            return self.queryset
        return Profile.objects.none()
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        if (hasattr(user, "profile") and instance.user != user) and not user.is_staff:
            return Response({"error": "You do not have permission to view this profile."}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def assign_consultant(self, request, pk=None):
        profile = self.get_object()
        consultant_id = request.data.get("consultant_id")

        try:
            consultant = Consultant.objects.get(id=consultant_id, is_active=True)
            if consultant.current_client_count >= consultant.max_clients:
                return Response({"error": "Consultant has reached maximum client capacity."}, status=status.HTTP_400_BAD_REQUEST)
            
            profile.relocation_consultant = consultant
            profile.save()

            consultant.current_client_count = consultant.assigned_clients.count()
            consultant.save()

            return Response({"status": "Consultant assigned successfully."}, status=status.HTTP_200_OK)

            # Update consultant's client count
        except Consultant.DoesNotExist:
            return Response({"error": "Consultant not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=["post"])   
    def update_progress(self, request, pk=None):
        profile = self.get_object()
        progress = request.data.get("progress")
        current_stage = request.data.get("current_stage")

        if progress is not None:
            profile.overall_progress = progress
        if current_stage:
            profile.current_stage = current_stage

        profile.save()
        return Response({"status": "Profile progress updated."}, status=status.HTTP_200_OK)
    

class DocumentViewset(viewsets.ModelViewSet):
    queryset = Document.objects.select_related('profile__user', 'reviewed_by__user').all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["document_type", "status", "profile"]
    search_fields = ["document_type", "profile__user__first_name", "profile__user__last_name"]

    def get_queryset(self):
        user = self.request.user
        
        if hasattr(user, 'consultant_profile'):
            return self.queryset.filter(profile__relocation_consultant=user.consultant_profile)
        elif hasattr(user, 'profile'):
            return self.queryset.filter(profile__user=user)
        elif user.is_staff:
            return self.queryset
        
        return Document.objects.none()
    
    @action(detail=True, methods=["post"])
    def update_status(self, request, pk=None):
        document = self.get_object()
        new_status = request.data.get("status")
        consultant = getattr(request.user, 'consultant_profile', None)

        if not consultant:
            return Response({"error": "Only consultants can update document status."}, status=status.HTTP_403_FORBIDDEN)
        if new_status in dict(Document.STATUS_CHOICES):
            document.status = new_status
            document.reviewed_by = consultant
            document.save()
            return Response({"status": "Document status updated."}, status=status.HTTP_200_OK)
        
        return Response({"error": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)
    

class TaskViewset(viewsets.ModelViewSet):
    queryset = Task.objects.select_related('profile__user').all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["is_completed", "due_date", "profile"]
    search_fields = ["title", "description", "profile__user__first_name", "profile__user__last_name"]
    ordering_fields = ["due_date", "created_at", "is_completed"]
    lookup_field = 'id'  # Use the UUID field for lookups
    
    def get_queryset(self):
        user = self.request.user
        
        if hasattr(user, 'consultant_profile'):
            return self.queryset.filter(profile__relocation_consultant=user.consultant_profile)
        elif hasattr(user, 'profile'):
            return self.queryset.filter(profile__user=user)
        elif user.is_staff:
            return self.queryset
        
        return Task.objects.none()
    
    @action(detail=True, methods=["post"])
    def mark_complete(self, request, id=None):  
        try:
            task = self.get_object()
            
            user = request.user
            if hasattr(user, 'consultant_profile'):
                if task.profile.relocation_consultant != user.consultant_profile:
                    return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
            elif hasattr(user, 'profile'):
                if task.profile.user != user:
                    return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
            elif not user.is_staff:
                return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
            
            task.is_completed = True
            task.save()
            return Response({"status": "Task marked as complete."}, status=status.HTTP_200_OK)
            
        except Task.DoesNotExist:
            return Response({"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=["get"])
    def overdue_tasks(self, request):
        from django.utils import timezone
        today = timezone.now().date()
        overdue_tasks = self.get_queryset().filter(is_completed=False, due_date__lt=today)
        serializer = self.get_serializer(overdue_tasks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class GetProfileAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        try:
            profile = Profile.objects.get(user=user)
            serializer = ProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)

