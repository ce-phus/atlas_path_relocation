class Websocket {
    constructor() {
        this.chatSocket = null;
        this.chatListSocket = null;
        this.chatListCallbacks = null;
    }

    getWebSocketUrl(endpoint, accessToken) {
        const apiUrl = import.meta.env.VITE_API_URL;
        const wsBase = apiUrl.replace(/^http/, 'ws');
    
        return `${wsBase}${endpoint}?token=${encodeURIComponent(accessToken)}`;
    }
    

    connectToChatList({ callbacks, accessToken }) {
        if (!accessToken) {
            console.error("Cannot connect to chat list WS: missing access token");
            return;
        }
    
        if (this.chatListSocket?.readyState === WebSocket.OPEN) {
            this.chatListSocket.close();
        }
    
        const wsUrl = this.getWebSocketUrl('/ws/chat/list/', accessToken);
        console.log("Connecting to chat list websocket at:", wsUrl);
    
        this.chatListSocket = new WebSocket(wsUrl);
        this.chatListCallbacks = callbacks;
    
        this.chatListSocket.onopen = () => {
            console.log("Chat list websocket connected");
        };
    
        this.chatListSocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("Received chat list data:", data);
    
                if (data.type === 'chatlist_update' && this.chatListCallbacks?.onChatListUpdate) {
                    this.chatListCallbacks.onChatListUpdate(data.chats);
                }
            } catch (error) {
                console.error("Error parsing chat list message:", error);
            }
        };
    }

    connectToChat({ callbacks, accessToken, otherUsername }) {
        if (!accessToken) {
            console.error("Cannot connect to chat list WS: missing access token");
            return;
        }

        const wsUrl = this.getWebSocketUrl('/ws/chat/', accessToken);
        this.chatSocket = new Websocket(wsUrl);

        this.chatSocket.onopen = () => {
            console.log("COnnected to chat Websocket")
            callbacks.onConnect?.()
        }

        this.chatSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleChatMessage(data, callbacks);
        };
        
        this.chatSocket.onclose = () => {
        console.log('Chat WebSocket disconnected');
        callbacks.onDisconnect?.();
        };
        
        this.chatSocket.onerror = (error) => {
        console.error('Chat WebSocket error:', error);
        callbacks.onError?.(error);
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
            console.error("Cannot connect to chat list WS: missing access token");
            return;
        }

        const wsUrl = this.getWebSocketUrl('/ws/status/', accessToken);
        this.statusSocket = new Websocket(wsUrl);
        this.statusSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'user_status') {
              callbacks.onUserStatus?.({
                userId: data.user_id,
                isOnline: data.is_online
              });
            }
          };
    }

    handleChatMessage(data, callbacks) {
        switch(data.type) {
          case 'message':
            callbacks.onMessage?.(data.message);
            break;
          case 'typing':
            callbacks.onTyping?.({
              userId: data.user_id,
              isTyping: data.is_typing
            });
            break;
          case 'read_receipt':
            callbacks.onReadReceipt?.({
              messageIds: data.message_ids,
              readerId: data.reader_id
            });
            break;
          case 'message_delivered':
            callbacks.onMessageDelivered?.(data.message_id);
            break;
        }
      }

    sendMessage(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.socket.send(JSON.stringify({
            type: 'message',
            text: message.text,
            temp_id: message.temp_id  // For optimistic updates
          }));
        }
      }

    sendTyping(isTyping) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
        type: 'typing',
        is_typing: isTyping
        }));
    }
    }
    
    sendReadReceipt(messageIds) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
        type: 'read_receipt',
        message_ids: messageIds
        }));
    }
    }

    isConnected() {
        return this.chatListSocket?.readyState === WebSocket.OPEN;
    }

    disconnect() {
        if (this.chatListSocket) {
            this.chatListSocket.close();
            this.chatListSocket = null;
            this.chatListCallbacks = null;
        }
    }
}

const chatWebsocket = new Websocket();
export default chatWebsocket;
