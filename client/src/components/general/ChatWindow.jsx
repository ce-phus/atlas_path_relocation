import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchMessages, markMessagesRead } from '../../actions/chatActions'
import ChatInput from './ChatInput'
import ChatMessage from './ChatMessage'
import chatWebsocket from '../../websockets/ChatWebsocket'

const ChatWindow = ({ conversation }) => {
  const dispatch= useDispatch();
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);

  const { messages, loading } = useSelector(state => state.messagesReducer);
  const [liveMessages, setLiveMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(()=> {
    if (conversation?.id) {
      dispatch(fetchMessages(conversation.id, 1));
      setPage(1)
      setLiveMessages([]);
    }
  }, [conversation?.id, dispatch])

  useEffect(() => {
    if (conversation?.other_user?.username) {
      const callbacks = {
        onMessage: (message) => {
          setLiveMessages(prev => [...prev, message]);
          scrollToBottom();
        },
        onTyping: ({ isTyping }) => setIsTyping(isTyping),
        onReadReceipt: ({ messageIds }) => {
          // Update message status
          setLiveMessages(prev => prev.map(msg => 
            messageIds.includes(msg.id) ? { ...msg, status: 'read' } : msg
          ));
        }
      };

      chatWebsocket.connectToChat(conversation.other_user.username, callbacks);

      return () => {
        chatWebsocket.disconnect();
      };
    }
  }, [conversation?.other_user?.username]);


  // Mark messages as read when viewing
  useEffect(() => {
    const unreadLiveMessages = liveMessages.filter(
      msg => msg.status === 'delivered' || msg.status === 'sent'
    );
    const unreadApiMessages = messages?.filter(
      msg => msg.status === 'delivered' || msg.status === 'sent'
    );

    const allUnreadIds = [
      ...unreadLiveMessages.map(msg => msg.id),
      ...(unreadApiMessages?.map(msg => msg.id) || [])
    ];

    if (allUnreadIds.length > 0) {
      dispatch(markMessagesRead(allUnreadIds));
    }
  }, [liveMessages, messages, dispatch]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      dispatch(fetchMessages(conversation.id, nextPage)).then((result) => {
        if (result.payload?.length === 0) {
          setHasMore(false);
        } else {
          setPage(nextPage);
        }
      });
    }
  };

  const handleSendMessage = (text) => {
    if (text.trim()) {
      const tempId = Date.now().toString();
      const tempMessage = {
        id: tempId,
        text: text.trim(),
        sender: { id: 'me', username: 'You' },
        status: 'sending',
        created_at: new Date().toISOString(),
        is_temp: true
      };

      setLiveMessages(prev => [...prev, tempMessage]);
      chatWebsocket.sendMessage(text.trim(), tempId);
      scrollToBottom();
    }
  };

  const handleTyping = (isTyping) => {
    chatWebsocket.sendTyping(isTyping);
  };

  const allMessages = [...(messages || []), ...liveMessages];

  return (
    <div className='bg-white rounded-2xl shadow-lg border border-[#f0f0f0] h-[calc(100vh-12rem)] flex flex-col'>
      {/* Chat Header */}
      <div className='p-6 border-b border-[#f0f0f0]'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <div className='relative'>
              <div className="w-12 h-12 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-full flex items-center justify-center text-white font-medium">
                {conversation.other_user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
                {conversation.other_user?.is_online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
            </div>
            <div>
              <h2 className='text-xl font-light text-[#111827]'>
                {conversation.other_user?.username || 'Unknown User'}
              </h2>
              <p className="text-sm text-[#6B7280] font-light">
                {conversation.other_user?.is_online ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>

          <div className='flex items-center space-x-4'>
            <button className="p-2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors rounded-full cursor-pointer hover:bg-[#f9fafb]" aria-label="Call">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>

            <button 
              className="p-2 text-[#9CA3AF] hover:text-[#6B7280] cursor-pointer transition-colors rounded-full hover:bg-[#f9fafb]"
              aria-label="Search in chat"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar' ref={messageContainerRef}>
        {loading && page === 1 ? (
          <div className='flex justify-center py-8'>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
          </div>
        ): ( 
          <>
          {hasMore && (
              <div className="text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-4 py-2 text-sm text-[#6B7280] cursor-pointer hover:text-[#8B5CF6] transition-colors font-light"
                >
                  {loading ? 'Loading...' : 'Load older messages'}
                </button>
              </div>
            )}

            {allMessages === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-[#f3e8ff] to-[#e9d5ff] rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-light text-[#374151] mb-2">No messages yet</h3>
                <p className="text-[#6B7280] font-light">Send a message to start the conversation</p>
              </div>
            ) : (
              allMessages.map((message, index)=> (
                <ChatMessage 
                  key={message.id || index} 
                  message={message} 
                  isOwn={message.sender?.id === 'me'}
                />
              ))
            )}

            {isTyping && (
              <div className="flex items-center space-x-2 p-4">
                <div className="w-10 h-10 bg-[#f9fafb] rounded-full flex items-center justify-center">
                  <span className="text-[#9CA3AF] text-sm">{conversation.other_user?.username?.charAt(0) || 'U'}</span>
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[#d1d5db] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-[#d1d5db] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-[#d1d5db] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <ChatInput 
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
      />
    </div>
  )
}

export default ChatWindow