import React, { useEffect, useState } from 'react'
import { fetchChats } from '../../actions/chatActions'
import { useSelector, useDispatch } from 'react-redux'
import ChatListItem from './ChatListItem'
import chatWebsocket from "../../websockets/ChatWebsocket"

const ChatSidebar = ({ onSelectConversation, onStartNewChat, selectedConversationId }) => {
  const dispatch = useDispatch();

  const { chats, loading, error } = useSelector((state) => state.chatListReducer);
  const [searchTerm, setSearchTerm] = useState('');
  const [forceRefresh, setForceRefresh] = useState(0);

  const { userInfo } = useSelector(state => state.userLoginReducer);

  const filteredChats = chats?.filter(chat => 
    chat.other_user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.last_message?.text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // useEffect(() => {
  //   dispatch(fetchChats());
    
  //   const interval = setInterval(() => {
  //     dispatch(fetchChats());
  //   }, 30000);

  //   return () => clearInterval(interval);
  // }, [dispatch, forceRefresh]);

  useEffect(() => {
    if (!userInfo?.access) return;
  
    const callbacks = {
      onConnect: () => console.log('✅ Chat list WebSocket connected'),
      onChatListUpdate: (update) => {
        console.log('📨 Chat list update:', update);
        setChatsUpdated(prev => prev + 1);
      },
      onError: (error) => console.error('❌ Chat list WebSocket error:', error),
      onDisconnect: (event) => console.log('🔌 Chat list WebSocket disconnected:', event?.code, event?.reason)
    };
  
    // Make sure callbacks is defined
    chatWebsocket.connectToChatList({
      callbacks, // This must be included
      accessToken: userInfo.access,
    });
  
    return () => {
      chatWebsocket.disconnectChatList();
    };
  }, [userInfo?.access]);
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[#f0f0f0] h-[calc(100vh-12rem)] flex flex-col">
      {/* Header */}
      <div className='p-6 border-b border-[#f0f0f0]'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-light text-[#111827]'>Conversations</h2>
          <button
          onClick={onStartNewChat}
          className='cursor-pointer w-10 h-10 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white rounded-full flex items-center justify-center hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200'
          aria-label="Start new chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent text-[#374151] font-light placeholder-[#9CA3AF]"
          />
        </div>
      </div>
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-4 p-4 animate-pulse">
                <div className="w-12 h-12 bg-[#e5e7eb] rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-[#e5e7eb] rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-[#e5e7eb] rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-[#d1d5db] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[#6B7280] font-light">Failed to load conversations</p>
          </div>
        ) : filteredChats?.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-[#d1d5db] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-[#6B7280] font-light mb-2">No conversations found</p>
            <p className="text-[#9CA3AF] text-sm font-light">Start a new chat to begin messaging</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredChats?.map(chat => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isSelected={chat.id === selectedConversationId}
                onClick={() => onSelectConversation(chat)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default ChatSidebar