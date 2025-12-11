export const chatListReducer = (
    state = { chats: [], loading: false, error: null },
    action
) => {
    switch (action.type) {
        case "CHAT_LIST_REQUEST":
            return { ...state, loading: true };
        case "CHAT_LIST_SUCCESS":
            return { loading: false, chats: action.payload };
        case "CHAT_LIST_FAIL":
            return { loading: false, error: action.payload };
        default:
            return state;
    }
};

export const startConversationReducer = (
    state = { conversation: null, loading: false, error: null },
    action
) => {
    switch (action.type) {
        case "START_CONVERSATION_REQUEST":
            return { ...state, loading: true };
        case "START_CONVERSATION_SUCCESS":
            return { loading: false, conversation: action.payload };
        case "START_CONVERSATION_FAIL":
            return { loading: false, error: action.payload };
        default:
            return state;
    }
};

export const messagesReducer = (
    state = { messages: [], loading: false, error: null },
    action
) => {
    switch (action.type) {
        case "MESSAGES_REQUEST":
            return { loading: true, messages: [] };
        case "MESSAGES_SUCCESS":
            return { loading: false, messages: action.payload };
        case "MESSAGES_FAIL":
            return { loading: false, error: action.payload };
        default:
            return state;
    }
};

export const sendMessageReducer = (
    state = { message: null, loading: false, error: null },
    action
) => {
    switch (action.type) {
        case "SEND_MESSAGE_REQUEST":
            return { loading: true };
        case "SEND_MESSAGE_SUCCESS":
            return { loading: false, message: action.payload };
        case "SEND_MESSAGE_FAIL":
            return { loading: false, error: action.payload };
        default:
            return state;
    }
};

export const messageReadReducer = (
    state = { result: null, loading: false, error: null },
    action
) => {
    switch (action.type) {
        case "MARK_READ_REQUEST":
            return { loading: true };
        case "MARK_READ_SUCCESS":
            return { loading: false, result: action.payload };
        case "MARK_READ_FAIL":
            return { loading: false, error: action.payload };
        default:
            return state;
    }
};

export const chatProfileReducer = (
    state = { profile: null, loading: false, error: null },
    action
) => {
    switch (action.type) {
        case "CHAT_PROFILE_REQUEST":
        case "CHAT_PROFILE_UPDATE_REQUEST":
            return { ...state, loading: true };

        case "CHAT_PROFILE_SUCCESS":
        case "CHAT_PROFILE_UPDATE_SUCCESS":
            return { loading: false, profile: action.payload };

        case "CHAT_PROFILE_FAIL":
        case "CHAT_PROFILE_UPDATE_FAIL":
            return { loading: false, error: action.payload };

        default:
            return state;
    }
};
