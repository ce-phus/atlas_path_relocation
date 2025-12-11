import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.contrib.auth import get_user_model
from .models import Conversation, Message, UserChatProfile
from django.utils.timezone import now
from channels.layers import get_channel_layer
from django.db.models import Q
import logging
from django.core.files import ContentFile
import base64
import uuid
from typing import Optional, Dict, Any
from channels.db import database_sync_to_async
from django.utils import timezone

User = get_user_model()

logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = None
        self.other_user = None
        self.conversation = None
        self.room_group_name = None
        self.page_size = 50
        self.user_chatlist_group = None    # For updating current user's chat list
        self.other_user_chatlist_group = None  # For updating other user's chat list

    async def connect(self):
        """Handle WebSocket connection."""
        self.user = self.scope["user"]
        if not self.user.is_authenticated:
            await self.close(code=4003)
            return
        
        other_username = self.scope['url_route']['kwargs']['username']

        if self.user.username == other_username:
            await self.close(code=4002)
            return
        
        try:
            self.other_user = await self.get_user_by_username(other_username)
            self.conversation, created = await sync_to_async(Conversation.get_or_create_conversation)(self.user, self.other_user)

            # Set room group name
            self.room_group_name = f'conversation_{self.conversation.id}'
            
            self.user_chatlist_group = f'user_{self.user.id}_chatlist'
            self.other_user_chatlist_group = f'user_{self.other_user.id}_chatlist'

            # Join conversation room
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            
            # Join user's chat list group
            await self.channel_layer.group_add(
                self.user_chatlist_group,
                self.channel_name
            )

            await self.accept()

            # Update user online status
            await self.set_user_online_status(self.user, True)

            # Send recent messages
            await self.send_recent_messages()

            logger.info(f"User {self.user.username} connected to chat with {other_username}")

        except Exception as e:
            logger.error(f"Error connecting chat: {e}")
            await self.close(code=4003)

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        if self.user and self.user.is_authenticated:
            # Leave room group
            if self.room_group_name:
                await self.channel_layer.group_discard(
                    self.room_group_name,
                    self.channel_name
                )
            
            # Leave chat list group
            if self.user_chatlist_group:
                await self.channel_layer.group_discard(
                    self.user_chatlist_group,
                    self.channel_name
                )
            
            # Update user online status
            await self.set_user_online_status(self.user, False)


    async def receive(self, text_data=None, bytes_data=None):
        """Handle incoming WebSocket messages."""
        try:
            data = json.loads(text_data) if text_data else None
            message_type = data.get('type', 'message')

            if message_type == 'message':
                await self.handle_new_message(data)
            elif message_type == 'typing':
                await self.handle_typing_indicator(data)
            elif message_type == 'read_receipt':
                await self.handle_read_receipts(data)
            elif message_type == 'delete_message':
                await self.handle_delete_message(data)
            elif message_type == 'load_more':
                await self.handle_load_more(data)
            elif message_type == 'update_message':
                await self.handle_update_message(data)

        except json.JSONDecodeError:
            logger.error("Invalid JSON received")

        except Exception as e:
            logger.error(f"Error processing message: {e}")

    async def handle_new_message(self, data: Dict[str, Any]):
        """Handle new text or image message"""
        text_content = data.get('text', '').strip()
        image_data = data.get('image', None)
        temp_id = data.get('temp_id')  # For frontend optimistic updates

        if not text_content and not image_data:
            await self.send_error("Message content is required")
            return
        
        # Create message in database
        message = await self.create_message(
            text=text_content,
            image_data=image_data,
            temp_id=temp_id
        )
        
        # IMPORTANT: Update conversation timestamp
        await self.update_conversation_timestamp()

        # Send confirmation to sender immediately
        await self.send_message_to_sender(message, temp_id)

        # Check if receiver is online
        receiver_online = await self.is_user_online(self.other_user)
        
        if receiver_online:
            # Update status to delivered
            await self.mark_message_delivered(message.id)
            
            # Send to receiver
            await self.send_message_to_receiver(message)
        else:
            logger.info(f"User {self.other_user.username} is offline. Message queued.")

        # CRITICAL: Notify chat lists to reorder
        await self.notify_chat_lists_update(message)

        # Send push notification if needed
        await self.send_notification(message)


    async def handle_typing_indicator(self, data:Dict[str, Any]):
        """Handle typing indicator"""
        is_typing = data.get('is_typing', False)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'typing_indicator',
                'user_id': str(self.user.id),
                'is_typing': is_typing,
                'timestamp': now().isoformat()
            }
        )

    async def handle_read_receipts(self, data:Dict[str, Any]):
        """Handle read receipt updates"""
        message_ids = data.get('message_ids', [])

        if not message_ids:
            return
        
        # Updated message status to read
        updated_count = await self.mark_messages_as_read(message_ids)

        if updated_count > 0:
            # Notify sender that messages were read
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'read_receipt',
                    'user_id': str(self.user.id),
                    'message_ids': message_ids,
                    'timestamp': now().isoformat()
                }
            )

    async def handle_delete_message(self, data:Dict[str, Any]):
        """Handle message deletion for the user"""
        message_id = data.get('message_id', None)
        delete_for_everyone = data.get('delete_for_everyone', False)

        if not message_id:
            await self.send_error("Message ID is required for deletion")
            return
        
        deleted = await self.delete_message(message_id, delete_for_everyone)

        if deleted:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'message_deleted',
                    'user_id': str(self.user.id),
                    'message_id': message_id,
                    'delete_for_everyone': delete_for_everyone,
                    'timestamp': now().isoformat()
                }
            )


    async def handle_load_more(self, data:Dict[str, Any]):
        """Handle loading more messages for pagination"""
        before_id = data.get("before_id", None)
        messages = await self.get_messages_before(before_id)

        await self.send(text_data=json.dumps({
            'type': 'messages_loaded',
            'messages': messages,
            'has_more': len(messages) == self.page_size
        }))

    async def handle_update_message(self, data:Dict[str, Any]):
        """Handle message updates (editing)"""
        message_id = data.get('message_id', None)
        new_text = data.get('new_text', '').strip()

        if not message_id or not new_text:
            await self.send_error("Message ID and new text are required for updating")
            return
        
        updated = await self.update_message(message_id, new_text)

        if updated:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'message_updated',
                    'message_id': message_id,
                    'new_text': new_text,
                    'timestamp': now().isoformat(),
                    'updated_by': str(self.user.id)
                }
            )

    async def chat_message(self, event):
        """Handle incoming chat message from group"""
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message']
        }))

    async def typing_indicator(self, event):
        """Handle typing indicator from group"""
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'user_id': event['user_id'],
            'is_typing': event['is_typing'],
            'timestamp': event['timestamp']
        }))

    async def read_receipt(self, event):
        """Handle read receipt from group"""
        await self.send(text_data=json.dumps({
            'type': 'read_receipt',
            'user_id': event['user_id'],
            'message_ids': event['message_ids'],
            'timestamp': event['timestamp']
        }))

    async def message_deleted(self, event):
        """Handle message deletion from group"""
        await self.send(text_data=json.dumps({
            'type': 'message_deleted',
            'user_id': event['user_id'],
            'message_id': event['message_id'],
            'delete_for_everyone': event['delete_for_everyone'],
            'timestamp': event['timestamp']
        }))

    async def message_updated(self, event):
        """Handle message update from group"""
        await self.send(text_data=json.dumps({
            'type': 'message_updated',
            'message_id': event['message_id'],
            'new_text': event['new_text'],
            'timestamp': event['timestamp'],
            'updated_by': event['updated_by']
        }))

    async def user_connected(self, event):
        """Handle user connection notifications"""
        await self.send(text_data=json.dumps({
            'type': 'user_connected',
            'user_id': event['user_id'],
            'timestamp': event['timestamp']
        }))

    async def user_disconnected(self, event):
        """Handle user disconnection notifications"""
        await self.send(text_data=json.dumps({
            'type': 'user_disconnected',
            'user_id': event['user_id'],
            'timestamp': event['timestamp']
        }))

    @database_sync_to_async
    def update_conversation_timestamp(self):
        """Update conversation's updated_at timestamp"""
        self.conversation.save()  # This triggers auto_now=True on updated_at
        return self.conversation.updated_at

    async def notify_chat_lists_update(self, message):
        """
        Notify both users' chat lists to update.
        This makes the chat move to the top.
        """

        # Data to send to chat lists
        update_data = {
            'type': 'chatlist_update',
            'conversation_id': str(self.conversation.id),
            'last_message': {
                'text': message.text[:50] + "..." if message.text and len(message.text) > 50 else message.text or "📷 Image",
                'sender_id': str(message.sender.id),
                'is_own': message.sender == self.user,
                'created_at': message.created_at.isoformat()
            },
            'updated_at': timezone.now().isoformat(),
            'action': 'new_message'
        }
        
        # Notify sender's chat list
        await self.channel_layer.group_send(
            self.user_chatlist_group,
            update_data
        )
        
        # Notify receiver's chat list
        await self.channel_layer.group_send(
            self.other_user_chatlist_group,
            {
                **update_data,
                'unread_increment': 1  # Add unread count for receiver
            }
        )
        
        logger.info(f"📢 Chat list notified for conversation {self.conversation.id}")

    async def chatlist_update(self, event):
        """
        Handle chat list update notifications.
        Frontend uses this to reorder conversations.
        """
        await self.send(text_data=json.dumps({
            'type': 'chatlist_update',
            'conversation_id': event['conversation_id'],
            'last_message': event.get('last_message'),
            'updated_at': event['updated_at'],
            'action': event['action'],
            'unread_increment': event.get('unread_increment', 0)
        }))

    
    # Helper methods
    async def send_recent_messages(self):
        """Send recent message on connect"""
        messages = await self.get_recent_messages()
        await self.send(text_data=json.dumps({
            'type': 'recent_messages',
            'messages': messages,
            "conversation_id": str(self.conversation.id)
        }))

    async def send_message_to_sender(self, message, temp_id=None):
        """Send message to sender immediately"""
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': await self.serialize_message(message),
            'temp_id': temp_id 
        }))

    async def send_message_to_receiver(self, message: Message):
        """Send message to receiver"""
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': await self.serialize_message(message)
            }
        )

    async def send_notification(self, message):
        """Send push notification"""
        channel_layer = get_channel_layer()
        await channel_layer.group_send(
            f'notifications_{self.other_user.id}',
            {
                'type': 'new_message',
                'message': await self.serialize_message_for_notification(message)
            }
        )

    async def send_error(self, error_message):
        """Send error message to client"""
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': error_message
        }))

    # Database interaction methods
    @database_sync_to_async
    def get_user_by_username(self, username):
        """Get user by username"""
        try:
            return User.objects.get(username=username)
        except User.DoesNotExist:
            return None
        
    @database_sync_to_async
    def get_or_create_conversation(self, user1, user2):
        """Get or create conversation between two users"""
        return Conversation.get_or_create_conversation(user1, user2)
    
    @database_sync_to_async
    def create_message(self, text=None, image_data=None, temp_id=None):
        
        message = Message(
            conversation=self.conversation,
            sender=self.user,
            text=text if text else None,
            status="sent"
        )

        if image_data:
            try:
                format, imgstr = image_data.split(';base64,')
                ext = format.split('/')[-1]
                data = base64.b64decode(imgstr)
                from django.core.files.base import ContentFile
                image_file = ContentFile(data, name=f'image_{uuid.uuid4()}.{ext}')
                message.image = image_file
            except Exception as e:
                logger.error(f"Error processing image: {e}")
        
        message.save()
        return message

    
    @database_sync_to_async
    def get_recent_messages(self):
        """Get recent messages with pagination"""
        messages = Message.objects.filter(
            conversation=self.conversation
        ).exclude(
            deleted_for=self.user
        ).select_related('sender').order_by('-created_at')[:self.page_size]

        return [
            {
                'id': str(msg.id),
                'sender_id': str(msg.sender.id),
                'text': msg.text,
                'image_url': msg.image.url if msg.image else None,
                'status': msg.status,
                'created_at': msg.created_at.isoformat(),
                'updated_at': msg.updated_at.isoformat()
            }
            for msg in reversed(messages)
        ]

    @database_sync_to_async
    def get_messages_before(self, before_id):
        """Get messages before a specific message ID"""
        messages = Message.objects.filter(
            conversation=self.conversation,
            created_at__lt=Message.objects.get(id=before_id).created_at
        ).exclude(
            deleted_for=self.user
        ).select_related(
            'sender'
        ).order_by('-created_at')[:self.page_size]
        
        return [
            {
                'id': str(msg.id),
                'text': msg.text,
                'image': msg.image.url if msg.image else None,
                'sender_id': str(msg.sender.id),
                'status': msg.status,
                'created_at': msg.created_at.isoformat()
            }
            for msg in messages
        ]
        

    @database_sync_to_async
    def mark_messages_as_read(self, message_ids):
        """Mark messages as read"""
        updated_count = Message.objects.filter(
            id__in=message_ids,
            conversation=self.conversation,
            receiver=self.user,
            status__in=['sent', 'delivered']
        ).update(status='read')
        return updated_count
    
    @database_sync_to_async
    def delete_message(self, message_id, delete_for_everyone=False):
        """Delete message for user or everyone"""
        try:
            message = Message.objects.get(id=message_id, conversation=self.conversation)
            if delete_for_everyone:
                if message.sender !=self.user:
                    return False
                message.delete()
            else:
                message.deleted_for.add(self.user)
            return True
        except Message.DoesNotExist:
            return False
        
    @database_sync_to_async
    def update_message_text(self, message_id, new_text):
        """Update message text"""
        updated = Message.objects.filter(
                id=message_id,
                conversation=self.conversation,
                sender=self.user
            ).update(text=new_text)
        return updated > 0
    
    @database_sync_to_async
    def is_user_online(self, user):
        """Check if user is online"""
        try:
            profile = UserChatProfile.objects.get(user=user)
            return profile.is_online
        except UserChatProfile.DoesNotExist:
            return False
        
    @database_sync_to_async
    def set_user_online_status(self, user, is_online):
        """Set user online status"""
        profile, created = UserChatProfile.objects.get_or_create(user=user)
        profile.is_online = is_online
        if not is_online:
            profile.last_seen = now()
        profile.save()

    @database_sync_to_async
    def serialize_message(self, message):
        """Serialize message for WebSocket"""
        return {
            'id': str(message.id),
            'conversation_id': str(message.conversation.id),
            'sender_id': str(message.sender.id),
            'text': message.text,
            'image': message.image.url if message.image else None,
            'status': message.status,
            'created_at': message.created_at.isoformat(),
            'updated_at': message.updated_at.isoformat(),
            'is_deleted': message.is_deleted_for(self.user)
        }
    
    @database_sync_to_async
    def serialize_message_for_notification(self, message):
        """Serialize message for notification"""
        return {
            'id': str(message.id),
            'sender_username': message.sender.username,
            'preview': message.text[:100] if message.text else "Image",
            'conversation_id': str(message.conversation.id),
            'created_at': message.created_at.isoformat()
        }

class ChatListConsumer(AsyncWebsocketConsumer):
    """
    WebSocket for real-time chat list updates.
    Handles the 'chat goes to top' feature.
    """
    
    async def connect(self):
        """Connect user to chat list updates"""
        self.user = self.scope['user']
        
        if not self.user.is_authenticated:
            await self.close(code=4003)
            return
        
        # Each user has their own chat list group
        self.group_name = f'user_{self.user.id}_chatlist'
        
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        await self.accept()
        
        logger.info(f"User {self.user.username} connected to chat list updates")

    async def disconnect(self, close_code):
        """Disconnect from chat list updates"""
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def chatlist_update(self, event):
        """
        Receive chat list update from other consumers.
        Send to frontend to reorder chats.
        """
        await self.send(text_data=json.dumps({
            'type': 'chatlist_update',
            'conversation_id': event['conversation_id'],
            'last_message': event.get('last_message'),
            'updated_at': event['updated_at'],
            'action': event['action'],
            'unread_increment': event.get('unread_increment', 0)
        }))

    async def receive(self, text_data):
        """Handle incoming messages (optional)"""
        pass
    
class OnlineStatusConsumer(AsyncWebsocketConsumer):
    """Handle online status updates"""

    async def connect(self):
        self.user = self.scope["user"]
        if not self.user.is_authenticated:
            await self.close(code=4003)
            return
        
        self.user_group = f'status_{self.user.id}'

        self.global_group = 'online_status'
        await self.channel_layer.group_add(
            self.user_group,
            self.channel_name
        )

        await self.accept()

        # Set user online
        await self.set_user_online(True)

        # Broadcast to all users
        await self.channel_layer.group_send(
            self.global_group,
            {
                'type': 'user_status',
                'user_id': str(self.user.id),
                'username': self.user.username,
                'is_online': True,
                'timestamp': now().isoformat()
            }
        )

    async def disconnect(self, close_code):
        if hasattr(self, "user") and self.user.is_authenticated:
            # Set user offline

            await self.set_user_online(False)

            # Broadcast to all users
            await self.channel_layer.group_send(
                self.global_group,
                {
                    'type': 'user_status',
                    'user_id': str(self.user.id),
                    'username': self.user.username,
                    'is_online': False,
                    'timestamp': now().isoformat()
                }
            )

            # Leave groups
            await self.channel_layer.group_discard(
                self.user_group,
                self.channel_name
            )
            await self.channel_layer.group_discard(
                self.global_group,
                self.channel_name
            )

    async def receive(self, text_data=None):
        """Handle incoming status updates"""
        try:
            data = json.loads(text_data) if text_data else None

            if data.get("type") == "update_status":
                # User can update their status (awat, busy, etc)
                status = data.get("status", "online")
                await self.update_user_status(status)
                await self.update_user_status(status)

        except json.JSONDecodeError:
            logger.error("Invalid JSON received in OnlineStatusConsumer")
            pass

    async def user_status(self, event):
        """Handle user status updates from group"""
        await self.send(text_data=json.dumps({
            'type': 'user_status',
            'user_id': event['user_id'],
            'username': event['username'],
            'is_online': event['is_online'],
            'timestamp': event['timestamp']
        }))

    
    @database_sync_to_async
    def set_user_online(self, is_online):
        """Set user online status"""
        profile, created = UserChatProfile.objects.get_or_create(user=self.user)
        profile.is_online = is_online
        if not is_online:
            profile.last_seen = now()
        profile.save()

    @database_sync_to_async
    def update_user_status(self, status):
        """Update user custom status"""
        profile, created = UserChatProfile.objects.get_or_create(user=self.user)
        profile.custom_status = status
        profile.save()
