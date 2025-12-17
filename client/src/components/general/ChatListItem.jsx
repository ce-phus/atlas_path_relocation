import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const ChatListItem = ({ chat, isSelected, onClick }) => {
  if (!chat) {
    console.warn('ChatListItem received null/undefined chat');
    return null;
  }

  const { other_user, last_message, unread_count, updated_at } = chat;
  
  // Safely handle missing data
  const username = other_user?.username || 'Unknown User';
  const firstName = other_user?.first_name || '';
  const lastName = other_user?.last_name || '';
  const displayName = firstName || lastName ? `${firstName} ${lastName}`.trim() : username;
  
  const lastMessageText = last_message?.text || 'No messages yet';
  const isOwnMessage = last_message?.is_own || false;
  const messagePreview = isOwnMessage ? `You: ${lastMessageText}` : lastMessageText;
  
  const unread = unread_count > 0;
  const formattedTime = updated_at 
    ? formatDistanceToNow(new Date(updated_at), { addSuffix: true })
    : '';

  return (
    <div
      onClick={onClick}
      className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'bg-gradient-to-r from-[#f3e8ff] to-[#e9d5ff] border border-[#8B5CF6]' 
          : 'hover:bg-[#f9fafb] border border-transparent hover:border-[#e5e7eb]'
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0 mr-4">
        <div className="w-12 h-12 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-full flex items-center justify-center text-white font-medium">
          {username.charAt(0).toUpperCase()}
        </div>
        {other_user?.is_online && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        )}
      </div>
      
      {/* Chat Info */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-light text-[#111827] truncate">
            {displayName}
          </h3>
          <span className="text-xs text-[#9CA3AF] font-light whitespace-nowrap ml-2">
            {formattedTime}
          </span>
        </div>
        
        <p className={`text-sm truncate ${unread ? 'text-[#111827] font-medium' : 'text-[#6B7280] font-light'}`}>
          {messagePreview}
        </p>
      </div>
      
      {/* Unread Badge */}
      {unread && (
        <div className="flex-shrink-0 ml-3">
          <div className="w-6 h-6 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] rounded-full flex items-center justify-center text-white text-xs font-medium">
            {unread_count > 9 ? '9+' : unread_count}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatListItem;