from django.contrib import admin
from .models import Conversation, Message, UserChatProfile

# Optional: Customize the User model display if needed
# from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
# from django.contrib.auth import get_user_model
# User = get_user_model()


class MessageInline(admin.TabularInline):
    """
    Allows messages related to a conversation to be viewed inline within the
    Conversation admin page.
    """
    model = Message
    extra = 0  # Don't show extra empty forms by default
    fields = ('sender', 'text', 'status', 'created_at')
    readonly_fields = ('created_at',)
    can_delete = False # Messages shouldn't usually be deleted via conversation view

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Conversation model.
    """
    list_display = ('id', 'user1_username', 'user2_username', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('user1__username', 'user2__username', 'user1__email', 'user2__email')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [MessageInline]

    # Helper methods to display usernames clearly in the list display
    def user1_username(self, obj):
        return obj.user1.username
    user1_username.short_description = 'User 1'

    def user2_username(self, obj):
        return obj.user2.username
    user2_username.short_description = 'User 2'


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Message model.
    """
    list_display = ('id', 'conversation_id', 'sender_username', 'status', 'created_at', 'has_image')
    list_filter = ('status', 'created_at', 'image')
    search_fields = ('text', 'sender__username', 'conversation__id')
    readonly_fields = ('id', 'created_at', 'updated_at')
    date_hierarchy = 'created_at'

    # Helper method to display the sender username
    def sender_username(self, obj):
        return obj.sender.username
    sender_username.short_description = 'Sender'
    
    # Helper method to show if an image is present
    def has_image(self, obj):
        return bool(obj.image)
    has_image.boolean = True
    has_image.short_description = 'Image Attached'


@admin.register(UserChatProfile)
class UserChatProfileAdmin(admin.ModelAdmin):
    """
    Admin configuration for the UserChatProfile model.
    """
    list_display = ('user_username', 'is_online', 'last_seen', 'show_read_receipts')
    list_filter = ('is_online', 'show_read_receipts', 'notify_new_messages')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('id', 'created_at', 'updated_at', 'last_seen')

    # Helper method to display the related username
    def user_username(self, obj):
        return obj.user.username
    user_username.short_description = 'Username'

