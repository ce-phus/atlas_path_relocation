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
