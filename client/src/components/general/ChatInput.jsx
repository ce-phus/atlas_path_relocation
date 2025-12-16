import React, { useState, useRef, useEffect } from 'react';

const ChatInput = ({ onSendMessage, onTyping, isConnected = true }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
    
    // Typing indicator logic
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      if (isConnected) {
        onTyping(true);
      }
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator after 1 second of no typing
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping && isConnected) {
        setIsTyping(false);
        onTyping(false);
      }
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && isConnected) {
      onSendMessage(message);
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      // Clear typing indicator
      if (isTyping) {
        setIsTyping(false);
        onTyping(false);
      }
      
      // Clear timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className='border-t border-[#f0f0f0] p-6'>
      {!isConnected && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 font-light">
            ⚠️ Connection lost. Messages may not send until connection is restored.
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className='relative'>
        <div className='flex items-end space-x-4'>
          {/* Attachment Button */}
          <button
            type="button"
            className="p-3 text-[#9CA3AF] hover:text-[#8B5CF6] transition-colors rounded-full hover:bg-[#f9fafb] self-end mb-1"
            aria-label="Attach file"
            disabled={!isConnected}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          
          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              className="w-full px-6 py-4 bg-[#f9fafb] border border-[#e5e7eb] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent text-[#374151] font-light placeholder-[#9CA3AF] resize-none min-h-[60px] max-h-[200px]"
              placeholder={isConnected ? "Type your message..." : "Connecting..."}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={!isConnected}
              rows="1"
            />
            {message.length > 0 && (
              <div className="absolute bottom-2 right-3 text-xs text-[#9CA3AF]">
                {message.length}/2000
              </div>
            )}
          </div>
          
          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim() || !isConnected}
            className={`p-4 rounded-full transition-all duration-200 self-end mb-1 ${
              message.trim() && isConnected
                ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white hover:shadow-lg transform hover:-translate-y-0.5'
                : 'bg-[#f3f4f6] text-[#d1d5db] cursor-not-allowed'
            }`}
            aria-label="Send message"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        
        {/* Typing indicator hint */}
        {isTyping && isConnected && (
          <div className="text-xs text-[#6B7280] mt-2 text-center font-light">
            Typing...
          </div>
        )}
      </form>
    </div>
  )
}

export default ChatInput