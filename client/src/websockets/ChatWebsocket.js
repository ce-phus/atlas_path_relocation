// ChatWebSocket.js - CORRECTED VERSION
class ChatWebSocket {
    constructor() {
        this.chatSocket = null;
        this.chatListSocket = null;
        this.statusSocket = null;
        this.chatListCallbacks = null;
        this.chatCallbacks = null;
        this.statusCallbacks = null;
    }

    getWebSocketUrl(endpoint, accessToken) {
        const apiUrl = import.meta.env.VITE_API_URL;
        const wsBase = apiUrl.replace(/^http/, 'ws');
    
        return `${wsBase}${endpoint}?token=${encodeURIComponent(accessToken)}`;
    }
    

    connectToChatList({ callbacks, accessToken }) {
        if (!accessToken) {
            console.error("❌ Cannot connect to chat list WS: missing access token");
            if (callbacks.onError) {
                callbacks.onError(new Error('Authentication required'));
            }
            return;
        }
    
        // Close existing connection
        if (this.chatListSocket) {
            if (this.chatListSocket.readyState === WebSocket.OPEN) {
                this.chatListSocket.close(1000, 'Reconnecting');
            }
            this.chatListSocket = null;
        }
    
        const wsUrl = this.getWebSocketUrl('/ws/chat/list/', accessToken);
        console.log("🔌 Connecting to chat list WebSocket at:", wsUrl);
    
        this.chatListSocket = new WebSocket(wsUrl);
        this.chatListCallbacks = callbacks;
    
        this.chatListSocket.onopen = () => {
            console.log("✅ Chat list WebSocket connected");
            if (this.chatListCallbacks?.onConnect) {
                this.chatListCallbacks.onConnect();
            }
        };
    
        this.chatListSocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("📨 Chat list update:", data);
    
                if (data.type === 'chatlist_update' && this.chatListCallbacks?.onChatListUpdate) {
                    this.chatListCallbacks.onChatListUpdate(data); // Send the whole data object
                } else if (data.type === 'connected' && this.chatListCallbacks?.onConnect) {
                    this.chatListCallbacks.onConnect(data);
                }
            } catch (error) {
                console.error("❌ Error parsing chat list message:", error);
                if (this.chatListCallbacks?.onError) {
                    this.chatListCallbacks.onError(error);
                }
            }
        };
        
        this.chatListSocket.onerror = (error) => {
            console.error("❌ Chat list WebSocket error:", error);
            if (this.chatListCallbacks?.onError) {
                this.chatListCallbacks.onError(error);
            }
        };
        
        this.chatListSocket.onclose = (event) => {
            console.log(`🔌 Chat list WebSocket closed: ${event.code} - ${event.reason}`);
            if (this.chatListCallbacks?.onDisconnect) {
                this.chatListCallbacks.onDisconnect(event);
            }
        };
    }

    // FIXED: Now includes username in URL
    connectToChat(otherUsername, { callbacks, accessToken }) {
        if (!accessToken) {
            console.error("❌ Cannot connect to chat: missing access token");
            if (callbacks.onError) {
                callbacks.onError(new Error('Authentication required'));
            }
            return;
        }
        
        if (!otherUsername) {
            console.error("❌ Cannot connect to chat: missing other user username");
            return;
        }

        // Close existing chat connection
        if (this.chatSocket) {
            if (this.chatSocket.readyState === WebSocket.OPEN) {
                this.chatSocket.close(1000, 'Switching chat');
            }
            this.chatSocket = null;
        }

        // IMPORTANT: URL includes username parameter
        const wsUrl = this.getWebSocketUrl(`/ws/chat/${otherUsername}/`, accessToken);
        console.log("🔌 Connecting to chat WebSocket:", wsUrl);
        
        this.chatSocket = new WebSocket(wsUrl); // FIXED: was using Websocket constructor instead of WebSocket
        this.chatCallbacks = callbacks;

        this.chatSocket.onopen = () => {
            console.log("✅ Connected to chat WebSocket");
            if (this.chatCallbacks?.onConnect) {
                this.chatCallbacks.onConnect();
            }
        };

        this.chatSocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("📨 Chat message:", data);
                this.handleChatMessage(data);
            } catch (error) {
                console.error("❌ Error parsing chat message:", error);
                if (this.chatCallbacks?.onError) {
                    this.chatCallbacks.onError(error);
                }
            }
        };
        
        this.chatSocket.onclose = (event) => {
            console.log('🔌 Chat WebSocket disconnected:', event.code, event.reason);
            if (this.chatCallbacks?.onDisconnect) {
                this.chatCallbacks.onDisconnect(event);
            }
        };
        
        this.chatSocket.onerror = (error) => {
            console.error('❌ Chat WebSocket error:', error);
            if (this.chatCallbacks?.onError) {
                this.chatCallbacks.onError(error);
            }
        };
    }
    

    requestChatListRefresh() {
        if (this.chatListSocket?.readyState === WebSocket.OPEN) {
            this.chatListSocket.send(JSON.stringify({
                type: 'refresh_chatlist',
                timestamp: new Date().toISOString()
            }));
            return true;
        }
        return false;
    }

    connectToStatus({callbacks, accessToken}) {
        if (!accessToken) {
            console.error("❌ Cannot connect to status: missing access token");
            if (callbacks.onError) {
                callbacks.onError(new Error('Authentication required'));
            }
            return;
        }

        // Close existing status connection
        if (this.statusSocket) {
            if (this.statusSocket.readyState === WebSocket.OPEN) {
                this.statusSocket.close(1000, 'Reconnecting');
            }
            this.statusSocket = null;
        }

        const wsUrl = this.getWebSocketUrl('/ws/status/', accessToken);
        console.log("🔌 Connecting to status WebSocket:", wsUrl);
        
        this.statusSocket = new WebSocket(wsUrl); // FIXED: was using Websocket constructor
        this.statusCallbacks = callbacks;
        
        this.statusSocket.onopen = () => {
            console.log("✅ Status WebSocket connected");
            if (this.statusCallbacks?.onConnect) {
                this.statusCallbacks.onConnect();
            }
        };
        
        this.statusSocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("📨 Status update:", data);
                if (data.type === 'user_status') {
                    if (this.statusCallbacks?.onUserStatus) {
                        this.statusCallbacks.onUserStatus({
                            userId: data.user_id,
                            username: data.username,
                            isOnline: data.is_online,
                            timestamp: data.timestamp
                        });
                    }
                }
            } catch (error) {
                console.error("❌ Error parsing status message:", error);
            }
        };
        
        this.statusSocket.onerror = (error) => {
            console.error("❌ Status WebSocket error:", error);
        };
        
        this.statusSocket.onclose = (event) => {
            console.log("🔌 Status WebSocket disconnected:", event.code, event.reason);
        };
    }

    handleChatMessage(data) {
        if (!this.chatCallbacks) return;
        
        switch(data.type) {
            case 'message':
                if (this.chatCallbacks.onMessage) {
                    this.chatCallbacks.onMessage(data); // ← pass the whole data object, not just data.message
                }
                break;
            case 'typing':
                if (this.chatCallbacks.onTyping) {
                    this.chatCallbacks.onTyping({
                        userId: data.user_id,
                        isTyping: data.is_typing
                    });
                }
                break;
            case 'read_receipt':
                if (this.chatCallbacks.onReadReceipt) {
                    this.chatCallbacks.onReadReceipt({
                        messageIds: data.message_ids,
                        readerId: data.user_id
                    });
                }
                break;
            case 'recent_messages':
                if (this.chatCallbacks.onRecentMessages) {
                    this.chatCallbacks.onRecentMessages(data.messages);
                }
                break;
            case 'chat_message': // From group send
                if (this.chatCallbacks.onMessage) {
                    this.chatCallbacks.onMessage(data.message);
                }
                break;
        }
    }

    // FIXED: Use the correct socket (chatSocket, not this.socket)
    sendMessage(text, temp_id = null) {
        if (this.chatSocket && this.chatSocket.readyState === WebSocket.OPEN) {
            this.chatSocket.send(JSON.stringify({
                type: 'message',
                text: text,
                temp_id: temp_id
            }));
            return true;
        }
        console.error("❌ Cannot send message: Chat socket not connected");
        return false;
    }

    // FIXED: Use chatSocket
    sendTyping(isTyping) {
        if (this.chatSocket && this.chatSocket.readyState === WebSocket.OPEN) {
            this.chatSocket.send(JSON.stringify({
                type: 'typing',
                is_typing: isTyping
            }));
            return true;
        }
        return false;
    }
    
    // FIXED: Use chatSocket
    sendReadReceipt(messageIds) {
        if (this.chatSocket && this.chatSocket.readyState === WebSocket.OPEN) {
            this.chatSocket.send(JSON.stringify({
                type: 'read_receipt',
                message_ids: messageIds
            }));
            return true;
        }
        return false;
    }

    isChatListConnected() {
        return this.chatListSocket?.readyState === WebSocket.OPEN;
    }
    
    isChatConnected() {
        return this.chatSocket?.readyState === WebSocket.OPEN;
    }
    
    isStatusConnected() {
        return this.statusSocket?.readyState === WebSocket.OPEN;
    }

    disconnectChatList() {
        if (this.chatListSocket) {
            this.chatListSocket.close();
            this.chatListSocket = null;
            this.chatListCallbacks = null;
        }
    }
    
    disconnectChat() {
        if (this.chatSocket) {
            this.chatSocket.close();
            this.chatSocket = null;
            this.chatCallbacks = null;
        }
    }
    
    disconnectStatus() {
        if (this.statusSocket) {
            this.statusSocket.close();
            this.statusSocket = null;
            this.statusCallbacks = null;
        }
    }
    
    disconnectAll() {
        this.disconnectChatList();
        this.disconnectChat();
        this.disconnectStatus();
    }
}

const chatWebsocket = new ChatWebSocket();
export default chatWebsocket;