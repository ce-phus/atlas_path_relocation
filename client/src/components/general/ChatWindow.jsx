import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchMessages, markMessagesRead } from '../../actions/chatActions'
import ChatInput from './ChatInput'
import ChatMessage from './ChatMessage'
import chatWebsocket from '../../websockets/ChatWebsocket'
import { getProfile } from '../../actions/profileActions'

const ChatWindow = ({ conversation }) => {
  const dispatch = useDispatch()
  const messagesEndRef = useRef(null)
  const messageContainerRef = useRef(null)
  const prevScrollHeightRef = useRef(0)

  const { messages, loading } = useSelector(state => state.messagesReducer)
  const { userInfo } = useSelector(state => state.userLoginReducer)
  const { profile, loading: profileLoading } = useSelector(state => state.getProfileReducer)
  console.log("Profile: ", profile)

  const [liveMessages, setLiveMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')


  /* ---------------------------
     Fetch REST messages
  ----------------------------*/
  useEffect(() => {
    if (!conversation?.id) return

    console.log('🔄 Fetching messages for conversation:', conversation.id)
    dispatch(fetchMessages(conversation.id, 1))
    setPage(1)
    setHasMore(true)
    setLiveMessages([])
  }, [conversation?.id, dispatch])

  /* ---------------------------
     WebSocket Connection
     NOTE: Now depends on profile being loaded
  ----------------------------*/
  useEffect(() => {
    // Don't connect until we have both profile and user info
    if (!conversation?.other_user?.username || !userInfo?.access || !profile) {
      console.log('⏳ Waiting for profile/user info:', {
        hasConversation: !!conversation?.other_user?.username,
        hasAccessToken: !!userInfo?.access,
        hasProfile: !!profile
      })
      return
    }

    console.log('🔌 Connecting to chat WebSocket for user:', conversation.other_user.username)

    const callbacks = {
      onConnect: () => {
        console.log('✅ Chat WebSocket connected')
        setConnectionStatus('connected')
      },

      onMessage: incoming => {
        const message = incoming.message || incoming;
        const tempId = incoming.temp_id || incoming.temp_id;
      
        if (!message?.id) return;
      
        setLiveMessages(prev => {
          // Only handle optimistic replacement
          if (tempId) {
            return prev.map(m => 
              m.id === tempId ? { ...message, is_temp: false } : m
            );
          }
      
          return [...prev, message];
        });
      },
      
      // onRecentMessages: recentMessages => {
      //   console.log('📦 Recent messages from WebSocket:', recentMessages)
      //   setLiveMessages(recentMessages || [])
      // },

      onDisconnect: () => {
        console.log('🔌 Chat WebSocket disconnected')
        setConnectionStatus('disconnected')
      },
      
      onError: (error) => {
        console.error('❌ Chat WebSocket error:', error)
        setConnectionStatus('error')
      }
    }

    chatWebsocket.connectToChat(conversation.other_user.username, {
      callbacks,
      accessToken: userInfo.access,
    })

    return () => {
      console.log('🧹 Cleaning up chat WebSocket')
      chatWebsocket.disconnectChat()
      setIsTyping(false)
      setConnectionStatus('disconnected')
    }
  }, [conversation?.other_user?.username, userInfo?.access, profile])

  /* ---------------------------
     Normalize Messages (NO DUPES)
  ----------------------------*/
  const allMessages = useMemo(() => {
    const map = new Map()

    ;[...liveMessages, ...(messages?.results || [])].forEach(msg => {
      map.set(msg.id, msg)
    })

    return Array.from(map.values())
      .filter(msg => !msg.is_deleted)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  }, [messages, liveMessages])

  /* ---------------------------
     Mark Messages as Read
  ----------------------------*/
  useEffect(() => {
    if (!profile?.id || allMessages.length === 0) return

    const unreadIds = allMessages
      .filter(
        msg =>
          msg.sender_id !== profile.user.id &&
          (msg.status === 'sent' || msg.status === 'delivered')
      )
      .map(msg => msg.id)

    if (unreadIds.length === 0) return

    console.log('✓ Marking messages as read:', unreadIds)
    dispatch(markMessagesRead(unreadIds))

    if (chatWebsocket.isChatConnected()) {
      chatWebsocket.sendReadReceipt(unreadIds)
    }
  }, [allMessages, profile?.id, dispatch])

  /* ---------------------------
     Scroll Helpers
  ----------------------------*/
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      })
    }, 50)
  }

  useEffect(scrollToBottom, [allMessages.length])

  /* ---------------------------
     Load Older Messages
  ----------------------------*/
  const handleLoadMore = async () => {
    if (!hasMore || loading) return

    prevScrollHeightRef.current = messageContainerRef.current?.scrollHeight || 0

    const nextPage = page + 1
    const result = await dispatch(fetchMessages(conversation.id, nextPage))

    if (!result.payload?.length) {
      setHasMore(false)
    } else {
      setPage(nextPage)
    }

    setTimeout(() => {
      const container = messageContainerRef.current
      if (container) {
        container.scrollTop = container.scrollHeight - prevScrollHeightRef.current
      }
    }, 0)
  }

  /* ---------------------------
     Send Message (Optimistic)
  ----------------------------*/
  const handleSendMessage = text => {
    if (!text.trim() || !profile) {
      console.error('❌ Cannot send message: no profile or empty text')
      return
    }

    const tempId = `temp-${Date.now()}`
    const tempMessage = {
      id: tempId,
      text: text.trim(),
      sender_id: profile.user.id, 
      sender: {
        id: profile.user.id,
        username: profile.user.username
      },
      status: 'sending',
      created_at: new Date().toISOString(),
      is_temp: true,
    }

    console.log('📤 Sending message (optimistic):', tempId, 'from:', profile.user.username)
    setLiveMessages(prev => [...prev, tempMessage])

    const sent = chatWebsocket.sendMessage(text.trim(), tempId)

    if (!sent) {
      console.error('❌ Failed to send message via WebSocket')
      setLiveMessages(prev =>
        prev.map(msg =>
          msg.id === tempId ? { ...msg, status: 'failed' } : msg
        )
      )
    }
  }

  const handleTyping = isTyping => {
    if (!chatWebsocket.isChatConnected()) {
      console.error('❌ Cannot send typing: WebSocket not connected')
      return
    }
    
    console.log('⌨️ Sending typing indicator:', isTyping)
    chatWebsocket.sendTyping(isTyping)
  }

  /* ---------------------------
     Determine if message is own
     FIXED: Now uses profile.username properly
  ----------------------------*/
  const getIsOwn = (message) => {
    if (!message || !profile?.user?.id) {
      console.log('🔍 Cannot determine isOwn - missing data:', {
        hasMessage: !!message,
        hasProfileUserId: !!profile?.user?.id,
        messageSenderId: message?.sender_id,
        messageSenderUsername: message?.sender?.username
      })
      return false
    }
  
    // Primary: use sender_id (available in REST messages)
    if (message.sender_id) {
      const isOwn = message.sender_id === profile.user.id
      // Optional debug log (remove later if too noisy)
      // console.log('✅ isOwn via sender_id:', isOwn, message.id)
      return isOwn
    }
  
    // Fallback: use nested sender.username (for WebSocket or optimistic messages)
    if (message.sender?.username) {
      return message.sender.username === profile.user.username
    }
  
    // Final fallback: use sender.id if available
    if (message.sender?.id) {
      return message.sender.id === profile.user.id
    }
  
    return false
  }
  /* ---------------------------
     UI Rendering
  ----------------------------*/
  const renderMessages = () => {
    console.log('🔄 Rendering messages, profile.username:', profile?.user.username)
    
    if (profileLoading || !profile) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6] mx-auto mb-4"></div>
          <p className="text-[#6B7280] font-light">Loading profile...</p>
        </div>
      )
    }

    return allMessages.map((message, index) => {
      const isOwn = getIsOwn(message)
      
      return (
        <ChatMessage 
          key={message.id || `temp-${index}`} 
          message={message} 
          isOwn={isOwn}
        />
      )
    })
  }

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
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 
                  connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
                }`}></div>
                <p className="text-sm text-[#6B7280] font-light">
                  {connectionStatus === 'connected' ? 'Connected' : 
                   connectionStatus === 'error' ? 'Connection Error' : 'Disconnected'} • 
                  {conversation.other_user?.is_online ? ' Online' : ' Offline'}
                </p>
              </div>
            </div>
          </div>

          <div className='flex items-center space-x-4'>
            <button 
              className="p-2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors rounded-full cursor-pointer hover:bg-[#f9fafb]" 
              aria-label="Call"
            >
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
        ) : ( 
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

            {allMessages.length === 0 ? (
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
              renderMessages()
            )}

            {isTyping && (
              <div className="flex items-center space-x-2 p-4">
                <div className="w-10 h-10 bg-[#f9fafb] rounded-full flex items-center justify-center">
                  <span className="text-[#9CA3AF] text-sm">
                    {conversation.other_user?.username?.charAt(0) || 'U'}
                  </span>
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
        isConnected={connectionStatus === 'connected' && !!profile}
        isLoadingProfile={!profile}
      />
    </div>
  )
}

export default ChatWindow