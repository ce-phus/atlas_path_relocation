from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Message

@receiver(post_save, sender=Message)
def update_conversation_on_new_message(sender, instance, created, **kwargs):
    """
    Update conversation timestamp when a new message is sent.
    This ensures chats move to the top when new messages arrive.
    """
    if created:
        instance.conversation.save() 
        
        print(f"Updated conversation {instance.conversation.id} timestamp")