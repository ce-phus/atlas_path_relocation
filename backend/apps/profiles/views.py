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
    ProfileUpdateSerializer,
    ConsultantUpdateSerialzier,
    TaskCreateSerializer
)
from django.db import models
from rest_framework.views import APIView

from django.core.paginator import Paginator
from datetime import datetime
from django.utils import timezone
from rest_framework.exceptions import ValidationError, PermissionDenied


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
    lookup_field = "id"

    def get_serializer_class(self):
        user = self.request.user
        if self.action == "create":
            return ProfileCreateSerializer
        elif self.action in ["update", "partial_update"]:
            if hasattr(user, "consultant_profile") and self.get_object() == user.consultant_profile:
                return ConsultantUpdateSerialzier
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
    def assign_consultant(self, request, id=None):
        # 1) Find profile by pk (explicit lookup)
        try:
            profile = Profile.objects.get(id=id)
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        is_owner = hasattr(user, "profile") and user.profile.id == profile.id
        if not (user.is_staff or is_owner):
            return Response({"error": "You do not have permission to modify this profile."},status=status.HTTP_403_FORBIDDEN)

        consultant_id = request.data.get("consultant_id")
        try:
            consultant = Consultant.objects.get(id=consultant_id, is_active=True)
        except Consultant.DoesNotExist:
            return Response({"error": "Consultant not found."}, status=status.HTTP_404_NOT_FOUND)

        if consultant.current_client_count >= consultant.max_clients:
            return Response({"error": "Consultant has reached maximum client capacity."}, status=status.HTTP_400_BAD_REQUEST)

        profile.relocation_consultant = consultant
        profile.save()

        consultant.current_client_count = consultant.assigned_clients.count()
        consultant.save()

        return Response({"status": "Consultant assigned successfully."}, status=status.HTTP_200_OK)

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
    
    @action(detail=True, methods=["get"])
    def client_details(self, request, id=None):
       
        try:
            profile = Profile.objects.get(id=id)
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)
        
        user = request.user
        if not (hasattr(user, "consultant_profile") and profile.relocation_consultant == user.consultant_profile) or user.is_staff:
            return Response({"error": "You do not have permission to view this profile."}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class DocumentViewset(viewsets.ModelViewSet):
    queryset = Document.objects.select_related('profile__user', 'reviewed_by__user').all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["document_type", "status", "profile"]
    search_fields = ["document_type", "profile__user__first_name", "profile__user__last_name"]
    lookup_field = 'id'

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
    def update_status(self, request, id=None):
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
    
    @action(detail=False, methods=["post"], url_path="upload")
    def upload(self, request):
        profile = getattr(request.user, 'profile', None)

        if not profile:
            return Response({"error": "Only clients can upload documents."}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = DocumentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(profile=profile)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=["post"])
    def update_status_bulk(self, request, pk=None):
        document = self.get_object()
        new_status = request.data.get("status")
        consultant = getattr(request.user, 'consultant_profile', None)

        if not consultant:
            return Response({"error": "Only consultants can update document status."}, status=status.HTTP_403_FORBIDDEN)
        if new_status in dict(Document.STATUS_CHOICES):
            related_documents = Document.objects.filter(profile=document.profile, document_type=document.document_type)
            updated_count = related_documents.update(status=new_status, reviewed_by=consultant)
            return Response({"status": f"{updated_count} documents updated."}, status=status.HTTP_200_OK)
        
        return Response({"error": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)
    

class TaskViewset(viewsets.ModelViewSet):
    queryset = Task.objects.select_related('profile__user').all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["is_completed", "due_date", "profile"]
    search_fields = ["title", "description", "profile__user__first_name", "profile__user__last_name"]
    ordering_fields = ["due_date", "created_at", "is_completed"]
    lookup_field = 'id'

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TaskCreateSerializer
        return TaskSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        if hasattr(user, 'consultant_profile'):
            return self.queryset.filter(profile__relocation_consultant=user.consultant_profile)
        elif hasattr(user, 'profile'):
            return self.queryset.filter(profile__user=user)
        elif user.is_staff:
            return self.queryset
        
        return Task.objects.none()
    
    def perform_create(self, serializer):
        profile_id = serializer.validated_data.get('profile')

        try:
            profile = Profile.objects.get(id=profile_id)
        except Profile.DoesNotExist:
            raise ValidationError({"profile": "Profile not found."})

        serializer.save(profile=profile)

    
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
    def stage_tasks(self, request):
        """Get tasks grouped by stage"""
        profile_id = request.query_params.get('profile_id')
        if profile_id:
            tasks = self.get_queryset().filter(profile_id=profile_id)
        else:
            tasks = self.get_queryset()
        
        stage_tasks = {}
        for stage_code, stage_name in Task.RELOCATION_STAGES:
            stage_tasks[stage_code] = {
                'name': stage_name,
                'tasks': TaskSerializer(tasks.filter(stage=stage_code), many=True).data,
                'progress': 0  # Will be calculated in frontend
            }
        
        return Response(stage_tasks, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=["get"])
    def progress(self, request):
        """Calculate weighted progress per stage and overall for a profile."""
        profile_id = request.query_params.get('profile_id')
        if not profile_id:
            return Response({"error": "profile_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        tasks = self.get_queryset().filter(profile__id=profile_id)
        if not tasks.exists():
            return Response({
                "overall_progress": 0,
                "stages": []
            }, status=status.HTTP_200_OK)

        stage_progress_data = []
        total_tasks = 0
        total_completed_tasks = 0

        # Loop through each stage
        for stage_code, stage_name in Task.RELOCATION_STAGES:
            stage_tasks = tasks.filter(stage=stage_code)
            total_stage = stage_tasks.count()
            completed_stage = stage_tasks.filter(is_completed=True).count()

            progress = round((completed_stage / total_stage) * 100, 2) if total_stage > 0 else 0

            # Accumulate for overall progress
            total_tasks += total_stage
            total_completed_tasks += completed_stage

            stage_progress_data.append({
                "stage": stage_code,
                "name": stage_name,
                "progress": progress,
                "total_tasks": total_stage,
                "completed_tasks": completed_stage
            })

        # ✅ Weighted overall progress based on total tasks completed
        overall_progress = round((total_completed_tasks / total_tasks) * 100, 2) if total_tasks > 0 else 0

        return Response({
            "overall_progress": overall_progress,
            "stages": stage_progress_data
        }, status=status.HTTP_200_OK)


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
            if user.is_consultant:
                profile = Consultant.objects.get(user=user)
                if not profile:
                    return Response({"error": "Consultant profile not found."}, status=status.HTTP_404_NOT_FOUND)
                serializer = ConsultantSerializer(profile)
            else:
                profile = Profile.objects.get(user=user)
                if not profile:
                    return Response({"error": "User profile not found."}, status=status.HTTP_404_NOT_FOUND)
                serializer = ProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)
        
class DocumentSearchAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        query = request.query_params.get('q', '')
        user = request.user

        if hasattr(user, 'consultant_profile'):
            documents = Document.objects.filter(
                profile__relocation_consultant=user.consultant_profile,
                document_type__icontains=query
            )
        elif hasattr(user, 'profile'):
            documents = Document.objects.filter(
                profile__user=user,
                document_type__icontains=query
            )
        elif user.is_staff:
            documents = Document.objects.filter(document_type__icontains=query)
        else:
            return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

        serializer = DocumentSerializer(documents, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class DocumentStatusOverviewAPIView(APIView):
    def get(self, request):
        user =self.request.user
        status_filter = request.query_params.get('status', None)

        documents = Document.objects.all()

        if hasattr(user, "consultant_profile"):
            consulant = user.consultant_profile
            documents = documents.filter(reviewed_by=consulant)

        elif hasattr(user, "profile"):
            documents = documents.filter(profile__user=user)
        else:
            return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

        if status_filter:
            documents = Document.objects.filter(status=status_filter)
            serializer = DocumentSerializer(documents, many=True)
            return Response({
                "status": status_filter,
                "documents": serializer.data,
                "count": documents.count()
            }, status=status.HTTP_200_OK)
        
        status_count = (
            Document.objects
            .values('status')
            .annotate(count=models.Count('id'))
            .order_by('status')
        )
        total_documents = Document.objects.count()

        consultant_data = []

        consultants = Consultant.objects.select_related('user').all()

        if user.is_staff or user.is_superuser:
            for consultant in consultants:
                consultant_docs = Document.objects.filter(reviewed_by=consultant)
                consultant_counts ={
                    consultant_docs.values('status')
                    .annotate(count=models.Count('id'))
                    .order_by('status')
                }

                consultant_data.append({
                    "consultant_id": consultant.id,
                    "consultant_name": consultant.user.get_full_name(),
                    "document_counts": list(consultant_counts),
                    "employee_id": consultant.employee_id,
                    "specialization": consultant.specialization,
                    "status_breakdown": consultant_counts,
                    "total_reviewed": consultant_docs.count()
                })

        return Response({
            "total_documents": total_documents,
            "status_overview": list(status_count),
            "consultant_overview": consultant_data
        }, status=status.HTTP_200_OK)
    
class TaskSearchAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        query = request.query_params.get('q', '')
        user = request.user

        if hasattr(user, 'consultant_profile'):
            tasks = Task.objects.filter(
                profile__relocation_consultant=user.consultant_profile,
                title__icontains=query
            )
        elif hasattr(user, 'profile'):
            tasks = Task.objects.filter(
                profile__user=user,
                title__icontains=query
            )
        elif user.is_staff:
            tasks = Task.objects.filter(title__icontains=query)
        else:
            return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class TaskDueOverviewAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            user = request.user
            filter_type = request.query_params.get('filter', 'all')  # New parameter for filter type
            search_query = request.query_params.get('q', '')  # Search query parameter
            page = request.query_params.get('page', 1)
            page_size = request.query_params.get('page_size', 10)

            # Base queryset based on user role
            if hasattr(user, "consultant_profile"):
                consultant = user.consultant_profile
                tasks = Task.objects.filter(profile__relocation_consultant=consultant)
            elif hasattr(user, "profile"):
                tasks = Task.objects.filter(profile__user=user)
            else:
                return Response({
                    "total_tasks": 0,
                    "page": 1,
                    "total_pages": 0,
                    "has_next": False,
                    "has_previous": False,
                    "due_overview": [],
                    "tasks": [],
                }, status=status.HTTP_200_OK)

            # Apply search filter if query provided
            if search_query:
                tasks = tasks.filter(
                    models.Q(title__icontains=search_query) |
                    models.Q(description__icontains=search_query)
                )

            # Apply filter type
            if filter_type == 'completed':
                tasks = tasks.filter(is_completed=True)
            elif filter_type == 'pending':
                tasks = tasks.filter(is_completed=False)
            elif filter_type == 'overdue':
                today = timezone.now().date()
                tasks = tasks.filter(is_completed=False, due_date__lt=today)
            # 'all' - no additional filtering needed

            # Apply pagination
            paginator = Paginator(tasks.order_by('due_date'), page_size)
            paginated_tasks = paginator.get_page(page)

            serializer = TaskSerializer(paginated_tasks, many=True)

            # Aggregate overview (for all tasks, not just paginated)
            due_count = (
                tasks.values('due_date')
                .annotate(count=models.Count('id'))
                .order_by('due_date')
            )
            total_tasks = tasks.count()

            return Response({
                "total_tasks": total_tasks,
                "page": paginated_tasks.number,
                "total_pages": paginator.num_pages,
                "has_next": paginated_tasks.has_next(),
                "has_previous": paginated_tasks.has_previous(),
                "due_overview": list(due_count),
                "tasks": serializer.data,
                "filter_type": filter_type,
                "search_query": search_query, 
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Unexpected error in TaskDueOverviewAPIView: {e}")
            import traceback
            traceback.print_exc()
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ConsultantClientsViewset(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        user  = request.user

        if not hasattr(user, 'consultant_profile'):
            return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
        consultant = user.consultant_profile
        clients = Profile.objects.filter(relocation_consultant=consultant).select_related('user').all().prefetch_related('documents', 'tasks')

        search_query = request.query_params.get('search', '')

        if search_query:
            clients = clients.filter(
                models.Q(user__first_name__icontains=search_query) |
                models.Q(user__last_name__icontains=search_query) |
                models.Q(user__email__icontains=search_query)
            )

        progress_filter = request.query_params.get('progress', "")
        if progress_filter:
            if progress_filter == "high":
                clients = clients.filter(overall_progress__gte=75)

            elif progress_filter == "medium":
                clients = clients.filter(overall_progress__gte=25, overall_progress__lt=75)

            elif progress_filter == "low":
                clients = clients.filter(overall_progress__lt=25)

        serializer = ProfileSerializer(clients, many=True)

        total_clients = clients.count()
        avg_progress = clients.aggregate(avg_progress=models.Avg('overall_progress'))['avg_progress'] or 0 
        high_progress_count = clients.filter(overall_progress__gte=75).count()

        return Response({
            "clients": serializer.data,
            "summary": {
                "total_clients": total_clients,
                "average_progress": round(avg_progress, 2),
                "high_progress_clients": high_progress_count,
                "consultant_capacity": f"{consultant.current_client_count}/{consultant.max_clients}"
            }
        })
    
    @action(detail=False, methods=['get'])
    def client_stats(self, request):
        """Get detailed statistics for consultant's clients"""
        user = request.user
        
        if not hasattr(user, "consultant_profile"):
            return Response(
                {"error": "Only consultants can access this endpoint"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        consultant = user.consultant_profile
        clients = Profile.objects.filter(relocation_consultant=consultant)

        # Relocation type breakdown
        relocation_stats = (
            clients
            .values('relocation_type')
            .annotate(count=models.Count('id'))
            .order_by('-count')
        )

        # Progress distribution
        progress_distribution = {
            '0-25%': clients.filter(overall_progress__range=[0, 25]).count(),
            '26-50%': clients.filter(overall_progress__range=[26, 50]).count(),
            '51-75%': clients.filter(overall_progress__range=[51, 75]).count(),
            '76-100%': clients.filter(overall_progress__range=[76, 100]).count(),
        }

        # Document status summary
        document_stats = (
            Document.objects.filter(profile__relocation_consultant=consultant)
            .values('status')
            .annotate(count=models.Count('id'))
            .order_by('status')
        )

        # Task completion stats
        total_tasks = Task.objects.filter(profile__relocation_consultant=consultant).count()
        completed_tasks = Task.objects.filter(
            profile__relocation_consultant=consultant, 
            is_completed=True
        ).count()
        task_completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        return Response({
            'relocation_type_breakdown': list(relocation_stats),
            'progress_distribution': progress_distribution,
            'document_status': list(document_stats),
            'task_completion_rate': round(task_completion_rate, 1),
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks
        })