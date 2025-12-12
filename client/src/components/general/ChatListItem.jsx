import React from 'react'

const ChatListItem = ({ chat, isSelected, onClick }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatLastMessage = (message) => {
    if (!message?.text) return '';
    const text = message.text;
    return text.length > 40 ? text.substring(0, 40) + '...' : text;
  };

  const isOnline = chat.other_user?.is_online || false;
  const unreadCount = chat.unread_count || 0;
  const lastMessage = chat.last_message;
  const otherUser = chat.other_user;
  const hasImage = lastMessage?.has_image;
  return (
    <div>
      
    </div>
  )
}

export default ChatListItem