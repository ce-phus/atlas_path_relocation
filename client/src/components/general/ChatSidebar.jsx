import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { fetchChats } from '../../actions/chatActions'
import { useSelector, useDispatch } from 'react-redux'
import ChatListItem from './ChatListItem'
import chatWebsocket from "../../websockets/ChatWebsocket"

const ChatSidebar = ({ onSelectConversation, onStartNewChat, selectedConversationId }) => {
  const dispatch = useDispatch();
  const wsConnectedRef = useRef(false); // Track WebSocket connection state
  const isInitialMount = useRef(true);

  const { chats, loading, error } = useSelector((state) => state.chatListReducer);
  const [searchTerm, setSearchTerm] = useState('');
  const [forceRefresh, setForceRefresh] = useState(0);
  const [localChats, setLocalChats] = useState([]);

  const { userInfo } = useSelector(state => state.userLoginReducer);

  // Initialize local chats with Redux data when it loads
  useEffect(() => {
    if (chats && chats.length > 0 && isInitialMount.current) {
      setLocalChats(chats);
      isInitialMount.current = false;
    }
  }, [chats]);


  // Memoize displayed chats for better performance
  const displayedChats = useMemo(() => {
    if (localChats.length > 0) {
      return localChats;
    }
    return chats || [];
  }, [localChats, chats]);

  // Memoize filtered chats
  const filteredChats = useMemo(() => {
    if (!displayedChats || displayedChats.length === 0) {
      return [];
    }
    
    return displayedChats.filter(chat => {
      const searchLower = searchTerm.toLowerCase();
      const username = chat.other_user?.username || '';
      const firstName = chat.other_user?.first_name || '';
      const lastName = chat.other_user?.last_name || '';
      const lastMessage = chat.last_message?.text || '';
      
      return (
        username.toLowerCase().includes(searchLower) ||
        firstName.toLowerCase().includes(searchLower) ||
        lastName.toLowerCase().includes(searchLower) ||
        lastMessage.toLowerCase().includes(searchLower)
      );
    });
  }, [displayedChats, searchTerm]);

  // Fetch chats when component mounts
  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch, forceRefresh]);

  // Handle WebSocket connection for real-time updates
  useEffect(() => {
    // Don't connect if no access token
    if (!userInfo?.access) {
      console.log('❌ No access token for WebSocket');
      return;
    }

    console.log('🔌 Setting up chat list WebSocket connection...');
    
    const callbacks = {
      onConnect: () => {
        console.log('✅ Chat list WebSocket connected');
        wsConnectedRef.current = true;
      },
      
      onChatListUpdate: (updateData) => {
        console.log('📨 Chat list update received:', updateData);
        
        // Update local chats state based on WebSocket update
        setLocalChats(prevChats => {
          // Start with either previous local chats or Redux chats
          const updatedChats = [...(prevChats.length > 0 ? prevChats : chats || [])];
          
          // Find if this conversation already exists in the list
          const existingIndex = updatedChats.findIndex(
            chat => chat.id === updateData.conversation_id
          );
          
          if (existingIndex >= 0) {
            // Update existing conversation
            const updatedChat = {
              ...updatedChats[existingIndex],
              last_message: updateData.last_message || updatedChats[existingIndex].last_message,
              updated_at: updateData.updated_at || updatedChats[existingIndex].updated_at,
            };
            
            // Add unread count if present
            if (updateData.unread_increment) {
              updatedChat.unread_count = (updatedChats[existingIndex].unread_count || 0) + updateData.unread_increment;
            }
            
            // Remove old entry and add updated one at the top
            updatedChats.splice(existingIndex, 1);
            updatedChats.unshift(updatedChat);
          } else {
            // Add new conversation to the top
            // We need to fetch full conversation details
            console.log('🔄 New conversation detected, refreshing chat list...');
            dispatch(fetchChats()); // Refresh the full list
            return prevChats; // Return unchanged until Redux updates
          }
          
          return updatedChats;
        });
      },
      
      onError: (error) => {
        console.error('❌ Chat list WebSocket error:', error);
        wsConnectedRef.current = false;
      },
      
      onDisconnect: (event) => {
        console.log('🔌 Chat list WebSocket disconnected:', event?.code, event?.reason);
        wsConnectedRef.current = false;
      }
    };

    try {
      // Only connect if not already connected
      if (!wsConnectedRef.current) {
        chatWebsocket.connectToChatList({
          callbacks,
          accessToken: userInfo.access,
        });
        wsConnectedRef.current = true;
      }
    } catch (error) {
      console.error('❌ Failed to connect to chat list WebSocket:', error);
      wsConnectedRef.current = false;
    }

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up chat list WebSocket connection');
      if (wsConnectedRef.current && chatWebsocket.isChatListConnected()) {
        chatWebsocket.disconnectChatList();
        wsConnectedRef.current = false;
      }
    };
  }, [userInfo?.access, dispatch, chats]);

  // Debug: Log the chats data
  useEffect(() => {
    console.log('🔄 ChatSidebar - chats data:', {
      hasChats: !!chats,
      chatsCount: chats?.length || 0,
      chatsData: chats,
      localChatsCount: localChats.length,
      displayedChatsCount: displayedChats?.length || 0,
      filteredChatsCount: filteredChats?.length || 0
    });
  }, [chats, localChats, displayedChats, filteredChats]);

  // Debounced search
  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

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
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent text-[#374151] font-light placeholder-[#9CA3AF]"
          />
          {searchTerm && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <button
                onClick={() => setSearchTerm('')}
                className="text-[#9CA3AF] hover:text-[#6B7280]"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {/* Debug info - remove in production */}
        <div className="text-xs text-gray-400 mb-2 px-2">
          Showing {filteredChats?.length || 0} of {displayedChats?.length || 0} conversations
        </div>
        
        {loading && localChats.length === 0 ? (
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
            <button
              onClick={() => dispatch(fetchChats())}
              className="mt-4 px-4 py-2 text-sm text-[#8B5CF6] hover:text-[#7C3AED] font-light"
            >
              Retry
            </button>
          </div>
        ) : filteredChats?.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-[#d1d5db] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {searchTerm ? (
              <>
                <p className="text-[#6B7280] font-light mb-2">No conversations found for "{searchTerm}"</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-sm text-[#8B5CF6] hover:text-[#7C3AED] font-light"
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <p className="text-[#6B7280] font-light mb-2">No conversations yet</p>
                <p className="text-[#9CA3AF] text-sm font-light">Start a new chat to begin messaging</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredChats?.map(chat => {
              // Debug each chat - remove in production
              console.log('Rendering chat:', {
                id: chat.id,
                other_user: chat.other_user,
                hasOtherUser: !!chat.other_user,
                hasUsername: !!chat.other_user?.username
              });
              
              return (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  isSelected={chat.id === selectedConversationId}
                  onClick={() => {
                    console.log('Selecting conversation:', chat.id);
                    onSelectConversation(chat);
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar