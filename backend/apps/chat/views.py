from django.db.models import Q
from rest_framework import viewsets, generics, status, permissions, filters
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction

from .models import Conversation, Message, UserChatProfile
from .serializers import (
    ConversationSerializer, StartConversationSerializer,
    MessageSerializer, UpdateMessageSerializer, LightUserSerializer,
    UpdateChatProfileSerializer, MessageStatusUpdateSerializer,
    DeleteMessageSerializer, UserSerializer, ChatListSerializer
)

User = get_user_model()

class StandardPagination(PageNumberPagination):
    """Standard pagination settings"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class ConversationViewSet(viewsets.ModelViewSet):
    """
    API endpint for conversations.
    List conversations, create new ones, retrive conversation details.
    """
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardPagination
    filter_backends = [filters.OrderingFilter]
    ordering = ['-updated_at']
    ordering_fields = ['updated_at', 'created_at']

    def get_queryset(self):
        """Get conversations for the authenticated/current user"""
        user = self.request.user
        return Conversation.objects.filter(
            Q(user1=user) | Q(user2=user),
            is_active=True
        ).select_related('user1', 'user2').prefetch_related('messages').distinct()
    
    def get_serializer_context(self):
        """"Add request to serializer context"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=False, methods=['post'], url_path='start', url_name='start_conversation')
    def start(self, request):
        """
        STart a new converstaion with a user.
        POST  /api/v1/conversations/start/
        """
        serializer = StartConversationSerializer(
            data=request.data, context={'request': request}
        )

        if serializer.is_valid():
            username = serializer.validated_data['username']
            try:
                other_user = User.objects.get(username=username)
            except User.DoesNotExist:
                return Response(
                    {'detail': 'User not found.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            conversation, created_at = Conversation.get_or_create_conversation(
                request.user, other_user
            )

            if not conversation.is_active:
                conversation.is_active = True
                conversation.save()

            return Response(
                ConversationSerializer(
                    conversation,
                    context={'request': request}
                ).data,
                status=status.HTTP_201_CREATED if created_at else status.HTTP_200_OK
            )
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=True, methods=['post'], url_path='messages', url_name='messages')
    def message(self,request, pk=None):
        """
        Get messages for a conversation with pagination.
        GET /api/conversation/{id}/messages/
        """

        conversation = self.get_object()
        messages = conversation.messages.exclude(
            deleted_for=request.user
        ).select_related('sender').order_by('-created_at')

        page = self.paginate_queryset(messages)

        if page is not None:
            serializer = MessageSerializer(
                page,
                many=True,
                context={'request': request}
            )
            return self.get_paginated_response(serializer.data)
        
        serializer = MessageSerializer(
            messages,
            many=True,
            context={'request': request}
        )

        return Response(serializer.data, status=status.HTTP_200_OK)
    

    @action(detail=True, methods=['post'], url_path='mark_as_read', url_name='mark_as_read')
    def mark_as_read(self, request, id=None):
        """
        Mark all messages in the conversation as read for the current user.
        POST /api/conversations/{id}/mark_as_read/
        """
        conversation = self.get_object()
        other_user = conversation.other_user(request.user)

        updated = conversation.messages.filter(
            sender=other_user,
            status__in=['sent', 'delivered']
        ).exclude(
            deleted_for=request.user
        ).update(status='read', updated_at=timezone.now())

        return Response({
            'status': 'success',
            'messages_updated': updated,
            'conversation_id': str(conversation.id)
        })
    
    @action(detail=True, methods=['post'], url_path='archive', url_name='archive')
    def archive(self, request, id=None):
        """
        Archive a conversation for the current user.
        POST /api/conversations/{id}/archive/
        """
        conversation = self.get_object()
        conversation.is_active = False
        conversation.save()

        return Response({
            'status': 'success',
            'conversation_id': str(conversation.id),
            'message': "Conversation archived successfully.",
            "conversation_id": str(conversation.id)
        })
    
class MessageViewSet(viewsets.ModelViewSet):
    """
    API endpoint for messages.
    For past data, message management and status updates.
    """
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    pagination_class = StandardPagination

    def get_queryset(self):
        """Get messages that the user can see"""
        return Message.objects.filter(
            conversation__in=Conversation.objects.filter(
                Q(user1=self.request.user) | Q(user2=self.request.user)
            )
        ).exclude(
            deleted_for=self.request.user
        ).select_related('sender', 'conversation').order_by('-created_at')
    
    def get_serializer_context(self):
        """"Add request to serializer context"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=False, methods=['post'])
    def mark_as_read(self, request):
        """
        Mark specific messages as read.
        POST /api/messages/mark_as_read/
        """
        serializer = MessageStatusUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            message_ids = serializer.validated_data['message_ids']
            
            # Update messages where user is receiver
            updated = Message.objects.filter(
                id__in=message_ids,
                receiver=request.user,
                status__in=['sent', 'delivered']
            ).exclude(
                deleted_for=request.user
            ).update(status='read', updated_at=timezone.now())
            
            return Response({
                'status': 'success',
                'messages_updated': updated,
                'message_ids': message_ids
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def mark_as_delivered(self, request):
        """
        Mark specific messages as delivered.
        POST /api/messages/mark_as_delivered/
        """
        serializer = MessageStatusUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            message_ids = serializer.validated_data['message_ids']
            
            # Update messages where user is receiver
            updated = Message.objects.filter(
                id__in=message_ids,
                receiver=request.user,
                status='sent'
            ).exclude(
                deleted_for=request.user
            ).update(status='delivered', updated_at=timezone.now())
            
            return Response({
                'status': 'success',
                'messages_updated': updated,
                'message_ids': message_ids
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['put'])
    def update_text(self, request, pk=None):
        """
        Update message text.
        PUT /api/messages/{id}/update_text/
        """
        message = self.get_object()
        
        # Only sender can update message
        if message.sender != request.user:
            return Response(
                {'error': 'You can only edit your own messages'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = UpdateMessageSerializer(
            message, 
            data=request.data, 
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def delete(self, request, pk=None):
        """
        Delete message for user or everyone.
        POST /api/messages/{id}/delete/
        """
        message = self.get_object()
        serializer = DeleteMessageSerializer(data=request.data)
        
        if serializer.is_valid():
            delete_for_everyone = serializer.validated_data['delete_for_everyone']
            
            if delete_for_everyone:
                # Only sender can delete for everyone
                if message.sender != request.user:
                    return Response(
                        {'error': 'Only the sender can delete messages for everyone'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                message.delete()
                action = 'deleted_for_everyone'
            else:
                # Delete for current user only
                message.deleted_for.add(request.user)
                action = 'deleted_for_user'
            
            return Response({
                'status': 'success',
                'action': action,
                'message_id': str(message.id)
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class OnlineUsersView(generics.ListAPIView):
    """
    Get list of online users.
    GET /api/users/online/
    """
    serializer_class = LightUserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get users who are online (excluding current user)"""
        return User.objects.filter(
            chat_profile__is_online=True
        ).exclude(
            id=self.request.user.id
        ).select_related('chat_profile').order_by('username')
    

class ConversationSearchView(generics.ListAPIView):
    """
    Search within user's conversations.
    GET /api/conversations/search/?q=search_term
    """
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Search conversations by user name or message content"""
        user = self.request.user
        search_term = self.request.query_params.get('q', '').strip()
        
        if not search_term:
            return Conversation.objects.none()
        
        # Find conversations where other user matches search
        conversations_by_user = Conversation.objects.filter(
            (Q(user1=user) & Q(user2__username__icontains=search_term)) |
            (Q(user1=user) & Q(user2__email__icontains=search_term)) |
            (Q(user1=user) & Q(user2__first_name__icontains=search_term)) |
            (Q(user1=user) & Q(user2__last_name__icontains=search_term)) |
            (Q(user2=user) & Q(user1__username__icontains=search_term)) |
            (Q(user2=user) & Q(user1__email__icontains=search_term)) |
            (Q(user2=user) & Q(user1__first_name__icontains=search_term)) |
            (Q(user2=user) & Q(user1__last_name__icontains=search_term))
        ).distinct()
        
        # Find conversations with messages containing search term
        conversations_by_message = Conversation.objects.filter(
            Q(user1=user) | Q(user2=user),
            messages__text__icontains=search_term
        ).exclude(
            messages__deleted_for=user
        ).distinct()
        
        # Combine and return unique conversations
        all_conversations = (conversations_by_user | conversations_by_message).distinct()
        
        return all_conversations.select_related('user1', 'user2').order_by('-updated_at')
    
    def get_serializer_context(self):
        """Add request to serializer context"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def conversation_stats(request):
    """
    Get conversation statistics.
    GET /api/conversations/stats/
    """
    user = request.user
    
    total_conversations = Conversation.objects.filter(
        Q(user1=user) | Q(user2=user),
        is_active=True
    ).count()
    
    unread_conversations = 0
    for conv in Conversation.objects.filter(Q(user1=user) | Q(user2=user), is_active=True):
        other_user = conv.other_user(user)
        if conv.messages.filter(sender=other_user, status__in=['sent', 'delivered']).exists():
            unread_conversations += 1
    
    online_conversations = 0
    for conv in Conversation.objects.filter(Q(user1=user) | Q(user2=user), is_active=True):
        other_user = conv.other_user(user)
        try:
            if other_user.chat_profile.is_online:
                online_conversations += 1
        except UserChatProfile.DoesNotExist:
            pass
    
    return Response({
        'total_conversations': total_conversations,
        'unread_conversations': unread_conversations,
        'online_conversations': online_conversations
    })

class ChatListView(generics.ListAPIView):
    """
    GET /api/chat/list/
    Returns conversations for sidebar, sorted by most recent activity.
    """
    serializer_class = ChatListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get conversations sorted by most recent update"""
        user = self.request.user
        return Conversation.objects.filter(
            Q(user1=user) | Q(user2=user),
            is_active=True
        ).select_related('user1', 'user2').order_by('-updated_at')
    
    def get_serializer_context(self):
        """Add request to serializer context"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
class ChatProfileView(generics.RetrieveUpdateAPIView):
    """
    GET /api/chat/profile/
    PUT /api/chat/profile/
    Manage user's chat profile (online status, custom status).
    """
    serializer_class = UpdateChatProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        """Get or create the user's chat profile"""
        profile, created = UserChatProfile.objects.get_or_create(user=self.request.user)
        return profile
