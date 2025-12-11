from rest_framework.routers import DefaultRouter
from django.urls import path, include
from . import views
router = DefaultRouter()
router.register(r'conversations', views.ConversationViewSet, basename='conversation')
router.register(r'messages', views.MessageViewSet, basename='message')

urlpatterns = [
    path('', include(router.urls)),
    path('convesation/stats/', views.conversation_stats, name='conversation_stats'),
    path('chat/list', views.ChatListView.as_view(), name='chat_list'),
    path("chat/profile/", views.ChatProfileView.as_view(), name="chat_profile"),
    path("converstaion/search/", views.ConversationSearchView.as_view(), name="conversation_search"),
    path("users/online/", views.OnlineUsersView.as_view(), name="online_users"),
]