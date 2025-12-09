from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.timesince import timesince
from .models import Conversation, Message, UserChatProfile

User = get_user_model()


class UserChatProfileSerializer(serializers.ModelSerializer):
    """Serializer for user chat profile"""
    
    class Meta:
        model = UserChatProfile
        fields = ['is_online', 'last_seen', 'custom_status', 
                  'show_read_receipts', 'show_typing_indicators', 'notify_new_messages']
        read_only_fields = ['is_online', 'last_seen']


class UserSerializer(serializers.ModelSerializer):
    """Serializer for users with chat profile"""
    chat_profile = UserChatProfileSerializer(read_only=True)
    is_online = serializers.BooleanField(source='chat_profile.is_online', read_only=True)
    last_seen = serializers.DateTimeField(source='chat_profile.last_seen', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'is_online', 'last_seen', 'chat_profile']
        read_only_fields = ['id', 'username', 'email', 'is_online', 'last_seen']


class LightUserSerializer(serializers.ModelSerializer):
    """Lightweight user serializer for nested data"""
    is_online = serializers.BooleanField(source='chat_profile.is_online', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'is_online']


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for chat messages"""
    sender = LightUserSerializer(read_only=True)
    receiver = serializers.SerializerMethodField()
    time_since = serializers.SerializerMethodField()
    is_deleted_for_current_user = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'receiver', 'text', 'image',
                  'status', 'created_at', 'updated_at', 'time_since', 
                  'is_deleted_for_current_user']
        read_only_fields = ['id', 'created_at', 'updated_at', 'sender', 'receiver']
    
    def get_receiver(self, obj):
        """Get receiver information"""
        receiver = obj.receiver
        return LightUserSerializer(receiver).data if receiver else None
    
    def get_time_since(self, obj):
        """Get human-readable time since creation"""
        return timesince(obj.created_at)
    
    def get_is_deleted_for_current_user(self, obj):
        """Check if message is deleted for current user"""
        request = self.context.get('request')
        if request and request.user:
            return obj.is_deleted_for(request.user)
        return False
    
    def to_representation(self, instance):
        """Custom representation to hide deleted messages"""
        data = super().to_representation(instance)
        request = self.context.get('request')
        
        # If message is deleted for current user, return minimal data
        if request and request.user and instance.is_deleted_for(request.user):
            return {
                'id': str(instance.id),
                'is_deleted': True,
                'created_at': instance.created_at.isoformat()
            }
        
        return data


class ConversationSerializer(serializers.ModelSerializer):
    """Serializer for conversations"""
    user1 = LightUserSerializer(read_only=True)
    user2 = LightUserSerializer(read_only=True)
    other_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    is_other_user_online = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ['id', 'user1', 'user2', 'other_user', 'last_message', 
                  'unread_count', 'is_other_user_online', 'created_at', 
                  'updated_at', 'is_active']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_other_user(self, obj):
        """Get the other user in the conversation"""
        request = self.context.get('request')
        if request and request.user:
            other_user = obj.other_user(request.user)
            return LightUserSerializer(other_user).data
        return None
    
    def get_last_message(self, obj):
        """Get the last message in the conversation"""
        last_msg = obj.messages.exclude(
            deleted_for=self.context['request'].user
        ).last() if self.context.get('request') else None
        
        if last_msg:
            return {
                'id': str(last_msg.id),
                'text': last_msg.text[:100] + "..." if len(last_msg.text) > 100 else last_msg.text,
                'sender_id': str(last_msg.sender.id),
                'status': last_msg.status,
                'created_at': last_msg.created_at.isoformat()
            }
        return None
    
    def get_unread_count(self, obj):
        """Count unread messages in conversation"""
        request = self.context.get('request')
        if request and request.user:
            other_user = obj.other_user(request.user)
            return obj.messages.filter(
                sender=other_user,
                status__in=['sent', 'delivered']
            ).exclude(
                deleted_for=request.user
            ).count()
        return 0
    
    def get_is_other_user_online(self, obj):
        """Check if other user is online"""
        request = self.context.get('request')
        if request and request.user:
            other_user = obj.other_user(request.user)
            try:
                return other_user.chat_profile.is_online
            except UserChatProfile.DoesNotExist:
                return False
        return False


class StartConversationSerializer(serializers.Serializer):
    """Serializer for starting a new conversation"""
    username = serializers.CharField(max_length=150)
    
    def validate_username(self, value):
        """Validate that username exists and is not current user"""
        request = self.context.get('request')
        
        if request and request.user.username == value:
            raise serializers.ValidationError("Cannot start conversation with yourself")
        
        try:
            User.objects.get(username=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")
        
        return value


class UpdateMessageSerializer(serializers.ModelSerializer):
    """Serializer for updating messages"""
    
    class Meta:
        model = Message
        fields = ['text']
    
    def validate_text(self, value):
        """Validate that text is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Message text cannot be empty")
        return value.strip()


class UpdateChatProfileSerializer(serializers.ModelSerializer):
    """Serializer for updating user chat profile"""
    
    class Meta:
        model = UserChatProfile
        fields = ['custom_status', 'show_read_receipts', 
                  'show_typing_indicators', 'notify_new_messages']


class MessageStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating message status"""
    message_ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=1,
        max_length=100
    )
    
    def validate_message_ids(self, value):
        """Validate message IDs"""
        if not value:
            raise serializers.ValidationError("At least one message ID is required")
        return value


class DeleteMessageSerializer(serializers.Serializer):
    """Serializer for deleting messages"""
    message_id = serializers.UUIDField()
    delete_for_everyone = serializers.BooleanField(default=False)
    
    def validate_message_id(self, value):
        """Validate message exists"""
        try:
            Message.objects.get(id=value)
        except Message.DoesNotExist:
            raise serializers.ValidationError("Message not found")
        return value
    
# ADD TO serializers.py
class ChatListSerializer(serializers.ModelSerializer):
    """Serializer for chat list sidebar items"""
    other_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    is_online = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ['id', 'other_user', 'last_message', 'unread_count', 
                  'is_online', 'updated_at']
        read_only_fields = ['updated_at']
    
    def get_other_user(self, obj):
        """Get the other user in conversation"""
        request = self.context.get('request')
        if request and request.user:
            other_user = obj.other_user(request.user)
            return {
                'id': other_user.id,
                'username': other_user.username,
                'first_name': other_user.first_name,
                'last_name': other_user.last_name
            }
        return None
    
    def get_last_message(self, obj):
        """Get last message preview"""
        last_msg = obj.messages.exclude(
            deleted_for=self.context['request'].user
        ).last() if self.context.get('request') else None
        
        if last_msg:
            preview = last_msg.text[:50] + "..." if last_msg.text and len(last_msg.text) > 50 else last_msg.text
            return {
                'text': preview or "📷 Image",
                'sender_id': str(last_msg.sender.id),
                'is_own': last_msg.sender == self.context['request'].user,
                'created_at': last_msg.created_at.isoformat()
            }
        return None
    
    def get_unread_count(self, obj):
        """Count unread messages"""
        request = self.context.get('request')
        if request and request.user:
            other_user = obj.other_user(request.user)
            return obj.messages.filter(
                sender=other_user,
                status__in=['sent', 'delivered']
            ).exclude(
                deleted_for=request.user
            ).count()
        return 0
    
    def get_is_online(self, obj):
        """Check if other user is online"""
        request = self.context.get('request')
        if request and request.user:
            other_user = obj.other_user(request.user)
            try:
                return other_user.chat_profile.is_online
            except:
                return False
        return False