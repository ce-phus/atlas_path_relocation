import React, { useState, useEffect } from 'react'
import { ChatSidebar, ChatWindow, OnlineStatus, UserSearchModal } from './general'
import { fetchChats, getChatProfile } from "../actions/chatActions"
import { useDispatch, useSelector } from "react-redux"
import chatWebsocket from '../websockets/ChatWebsocket'
import { getProfile } from '../actions/profileActions'

const ChatLayout = () => {
  const dispatch = useDispatch();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [chatsUpdated, setChatsUpdated] = useState(0)

  const { userInfo } = useSelector((state) => state.userLoginReducer);


useEffect(() => {
  dispatch(fetchChats());
  dispatch(getChatProfile());
}, [dispatch, chatsUpdated]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleStartNewChat = () => {
    setIsSearchModalOpen(true);
  };

  const handleNewConversationStarted = (newConversation) => {
    console.log('New conversation started:', newConversation);
    setSelectedConversation(newConversation);
    setChatsUpdated(prev => prev + 1);
    dispatch(fetchChats());
  };

  // WebSocket for chat list updates
  useEffect(() => {
    if (!userInfo?.access) {
      console.log('❌ No access token available for WebSocket');
      return;
    }
  
    const callbacks = {
      onConnect: () => {
        console.log('✅ Chat list WebSocket connected');
      },
      onChatListUpdate: (update) => {
        console.log('📨 Chat list update received:', update);
        // Trigger a refresh of chat list
        setChatsUpdated(prev => prev + 1);
        
        // If this update is for the currently selected conversation, update it
        if (selectedConversation && update.conversation_id === selectedConversation.id) {
          // Update the selected conversation with new message info
          setSelectedConversation(prev => ({
            ...prev,
            last_message: update.last_message,
            updated_at: update.updated_at
          }));
        }
      },
      onError: (error) => {
        console.error('❌ Chat list WebSocket error:', error);
      },
      onDisconnect: (event) => {
        console.log('🔌 Chat list WebSocket disconnected:', event?.code, event?.reason);
      }
    };
  
    console.log('🔌 Connecting to chat list WebSocket...');
    chatWebsocket.connectToChatList({
      callbacks,
      accessToken: userInfo.access,
    });
  
    return () => {
      console.log('🧹 Cleaning up chat list WebSocket');
      chatWebsocket.disconnectChatList();
    };
  }, [userInfo?.access, selectedConversation?.id]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#f9fafb] to-white font-light'>
      <header className="bg-white border-b border-[#f0f0f0] shadow-sm">
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div className='flex items-center space-x-3'>
              <div className="w-10 h-10 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <h1 className="text-2xl font-light text-[#111827]">
                Chat <span className="text-[#8B5CF6] font-normal">Sphere</span>
              </h1>
            </div>
            <OnlineStatus />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <ChatSidebar 
              onSelectConversation={handleSelectConversation}
              onStartNewChat={handleStartNewChat}
              selectedConversationId={selectedConversation?.id}
              key={chatsUpdated}
            />
          </div>
          
          {/* Main Chat Area */}
          <div className='lg:col-span-3'>
            {selectedConversation ? (
              <ChatWindow 
                conversation={selectedConversation} 
                key={selectedConversation.id}
              />
            ) : (
              <div className="h-[calc(100vh-12rem)] flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg border border-[#f0f0f0]">
                <div className="w-24 h-24 bg-gradient-to-br from-[#f3e8ff] to-[#e9d5ff] rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-light text-[#374151] mb-2">Welcome to ChatSphere</h3>
                <p className="text-[#6B7280] text-center max-w-md font-light">
                  Select a conversation from the sidebar or start a new chat to begin messaging.
                  Your messages will appear here in real-time.
                </p>
                <button
                  onClick={handleStartNewChat}
                  className="mt-8 px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-light"
                >
                  Start New Conversation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <UserSearchModal 
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onNewConversationStarted={handleNewConversationStarted}
      />
    </div>
  )
}

export default ChatLayout