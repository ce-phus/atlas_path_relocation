import React, { useState } from 'react';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';

const ChatMessage = ({ message, isOwn }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  
  const { userInfo } = useSelector((state) => state.userLoginReducer);
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      return format(date, 'HH:mm');
    } catch (error) {
      return '';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'sent':
        return (
          <svg className="w-3 h-3 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'delivered':
        return (
          <svg className="w-3 h-3 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'read':
        return (
          <svg className="w-3 h-3 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'sending':
        return (
          <div className="w-3 h-3">
            <div className="animate-spin rounded-full h-full w-full border-b-2 border-[#9CA3AF]"></div>
          </div>
        );
      case 'failed':
        return (
          <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };
  
  // Check if message is temporary
  const isTemporary = message.is_temp || message.status === 'sending' || message.status === 'failed';
  
  // Handle image click
  const handleImageClick = () => {
    if (message.image || message.image_url) {
      setShowImageModal(true);
    }
  };
  
  // Handle copy text
  const handleCopyText = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text)
        .then(() => {
          console.log('Message copied to clipboard');
        })
        .catch(err => {
          console.error('Failed to copy text:', err);
        });
    }
  };
  
  // Handle delete message
  const handleDeleteMessage = () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      // Implement delete functionality
      console.log('Delete message:', message.id);
    }
  };
  
  // Get avatar for message
  const getAvatar = () => {
    if (isOwn) {
      return userInfo?.username?.charAt(0).toUpperCase() || 'Y';
    }
    return message.sender?.username?.charAt(0).toUpperCase() || 'U';
  };
  
  // Get avatar color
  const getAvatarColor = () => {
    if (isOwn) {
      return 'from-[#8B5CF6] to-[#7C3AED]';
    }
    return 'from-[#6B7280] to-[#4B5563]';
  };
  
  return (
    <>
      <div 
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Avatar for received messages */}
        {!isOwn && (
          <div className="flex-shrink-0 mr-3 self-end mb-1">
            <div className={`w-8 h-8 bg-gradient-to-br ${getAvatarColor()} rounded-full flex items-center justify-center text-white text-xs font-medium`}>
              {getAvatar()}
            </div>
          </div>
        )}
        
        {/* Message bubble */}
        <div className={`relative max-w-[70%] ${isOwn ? 'ml-12' : 'mr-12'}`}>
          {/* Message content */}
          <div
            className={`rounded-2xl px-4 py-3 ${
              isOwn
                ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white rounded-br-none'
                : 'bg-[#f9fafb] text-[#374151] border border-[#f0f0f0] rounded-bl-none'
            } ${isTemporary ? 'opacity-70' : ''}`}
          >
            {/* Text message */}
            {message.text && (
              <p className="font-light whitespace-pre-wrap break-words">
                {message.text}
              </p>
            )}
            
            {/* Image message */}
            {(message.image || message.image_url) && (
              <div 
                className="mt-2 cursor-pointer rounded-lg overflow-hidden"
                onClick={handleImageClick}
              >
                <img 
                  src={message.image || message.image_url} 
                  alt="Message attachment" 
                  className="max-w-full h-auto max-h-64 object-cover rounded-lg"
                  loading="lazy"
                />
              </div>
            )}
            
            {/* Message info */}
            <div className={`flex items-center justify-end mt-2 space-x-2 ${isOwn ? 'text-white/80' : 'text-[#9CA3AF]'}`}>
              <span className="text-xs font-light">
                {formatTimestamp(message.created_at)}
              </span>
              
              {isOwn && message.status && (
                <span className="flex items-center">
                  {getStatusIcon(message.status)}
                </span>
              )}
              
              {message.edited && (
                <span className="text-xs italic">edited</span>
              )}
            </div>
          </div>
          
          {/* Message actions (hover menu) */}
          {isHovered && !isTemporary && (
            <div className={`absolute top-1/2 -translate-y-1/2 flex items-center space-x-1 ${
              isOwn ? '-left-12' : '-right-12'
            }`}>
              {/* Copy button */}
              {message.text && (
                <button
                  onClick={handleCopyText}
                  className="p-1.5 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                  title="Copy message"
                >
                  <svg className="w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              )}
              
              {/* Delete button (only for own messages) */}
              {isOwn && (
                <button
                  onClick={handleDeleteMessage}
                  className="p-1.5 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                  title="Delete message"
                >
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
              
              {/* Reply button */}
              <button
                className="p-1.5 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                title="Reply"
              >
                <svg className="w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
            </div>
          )}
          
          {/* Temporary message indicator */}
          {isTemporary && (
            <div className={`absolute top-1/2 -translate-y-1/2 flex items-center space-x-1 ${
              isOwn ? '-left-12' : '-right-12'
            }`}>
              <div className="p-1.5">
                {message.status === 'sending' && (
                  <div className="w-4 h-4">
                    <div className="animate-spin rounded-full h-full w-full border-b-2 border-[#9CA3AF]"></div>
                  </div>
                )}
                {message.status === 'failed' && (
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Avatar for sent messages */}
        {isOwn && (
          <div className="flex-shrink-0 ml-3 self-end mb-1">
            <div className={`w-8 h-8 bg-gradient-to-br ${getAvatarColor()} rounded-full flex items-center justify-center text-white text-xs font-medium`}>
              {getAvatar()}
            </div>
          </div>
        )}
      </div>
      
      {/* Image Modal */}
      {showImageModal && (message.image || message.image_url) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="relative max-w-4xl max-h-[90vh]">
            <img 
              src={message.image || message.image_url} 
              alt="Full size" 
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Download button */}
            <a
              href={message.image || message.image_url}
              download
              className="absolute -top-12 right-12 p-2 text-white hover:text-gray-300"
              title="Download image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatMessage;