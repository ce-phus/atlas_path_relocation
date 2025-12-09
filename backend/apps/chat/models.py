from django.db import models
from django.contrib.auth import get_user_model
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.utils import timezone
from apps.common.models import TimeStampedUUIDModel
from django.utils.translation import gettext_lazy as _
from django.db.models.signals import post_save
import uuid

User = get_user_model()

class Conversation(TimeStampedUUIDModel):
    """
    Represents a coversation between two users.
    Each conversation is uniques to a pair of users.
    """

    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations_initiated')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations_received')
    is_active = models.BooleanField(default = True, verbose_name=_("Is Active"))

    class Meta:
        unique_together = [['user1', 'user2']]
        ordering = ['-updated_at']

    def other_user(self, user):
        "Get the other user in the coversation"
        return self.user2 if user == self.user1 else self.user1
    
    @classmethod
    def get_or_create_conversation(cls, user1, user2):
        """
        Get or create a conversation between two users, ensuring consistent ordering.
        """
        # Sort user IDs to ensure user1 < user2 for uniqueness
        sorted_outs = sorted([user1, user2], key=lambda u: u.id)

        conversation, created = cls.objects.get_or_create(
            user1=sorted_outs[0],
            user2=sorted_outs[1]
        )

        return conversation, created
    
class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')

    # Message content
    text = models.TextField(blank=True, null=True, verbose_name=_("Text"))
    image = models.ImageField(upload_to='chat_images/', blank=True, null=True, verbose_name=_("Image"))

    # Message status tracking
    STATUS_CHOICES = [
        ('sent', _("Sent")),
        ('delivered', _("Delivered")),
        ('read', _("Read")),
    ]

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='sent', verbose_name=_("Status"))
    deleted_for = models.ManyToManyField(User, related_name='deleted_messages', blank=True, verbose_name=_("Deleted For"))

    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation', 'created_at']),
            models.Index(fields=['sender', 'created_at']),
            models.Index(fields=['conversation', 'sender', 'created_at'])
        ]

    def __str__(self) -> str:
        return f"Message {self.id} from {self.sender.username} in Conversation {self.conversation.id}"
    
    @property
    def receiver(self):
        "Get the receiver of the message"
        return self.conversation.other_user(self.sender)
    
    def is_deleted_for(self, user):
        "Check if the message is deleted for a specific user"
        return self.deleted_for.filter(id=user.id).exists()
    
class UserChatProfile(TimeStampedUUIDModel):
    """
    User-specific chat preference and state
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='chat_profile')
    is_online = models.BooleanField(default=False, verbose_name=_("Is Online"))
    last_seen = models.DateTimeField(blank=True, null=True, verbose_name=_("Last Seen"), auto_now=True)
    custom_status = models.CharField(max_length=255, blank=True, null=True, verbose_name=_("Custom Status"))

    # User preferences
    show_read_receipts = models.BooleanField(default=True, verbose_name=_("Show Read Receipts"))
    show_typing_indicators = models.BooleanField(default=True, verbose_name=_("Show Typing Indicator"))
    notify_new_messages = models.BooleanField(default=True, verbose_name=_("Notify New Messages"))

    def __str__(self) -> str:
        return f"Chat Profile for {self.user.username}"