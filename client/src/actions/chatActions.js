import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL 

export const fetchChats = () => async (dispatch, getState) => {
    try {
        dispatch({ type: "CHAT_LIST_REQUEST" });

        const { userLoginReducer: { userInfo } } = getState();

        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.access}`,
            },
        };

        const { data } = await axios.get(`${API_URL}/api/v1/chat/list`, config);

        dispatch({ type: "CHAT_LIST_SUCCESS", payload: data });
    } catch (error) {
        dispatch({
            type: "CHAT_LIST_FAIL",
            payload: error.response?.data || error.message,
        });
    }
};

export const startConversation = (username) => async (dispatch, getState) => {
    try {
        dispatch({ type: "START_CONVERSATION_REQUEST" });

        const { userLoginReducer: { userInfo } } = getState();

        const config = {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userInfo.access}`,
            },
        };

        const { data } = await axios.post(
            `${API_URL}/api/v1/chat/conversations/start/`,
            { username },
            config
        );

        dispatch({ type: "START_CONVERSATION_SUCCESS", payload: data });
        return data;

    } catch (error) {
        dispatch({
            type: "START_CONVERSATION_FAIL",
            payload: error.response?.data || error.message,
        });
    }
};

export const fetchMessages = (conversationId, page = 1) => async (dispatch, getState) => {
    try {
        dispatch({ type: "MESSAGES_REQUEST" });

        const { userLoginReducer: { userInfo } } = getState();

        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.access}`,
            },
        };

        const { data } = await axios.post(
            `${API_URL}/api/v1/chat/conversations/${conversationId}/messages/?page=${page}`,
            {},
            config
        );

        dispatch({ type: "MESSAGES_SUCCESS", payload: data });

    } catch (error) {
        dispatch({
            type: "MESSAGES_FAIL",
            payload: error.response?.data || error.message,
        });
    }
};


export const markMessagesRead = (messageIds) => async (dispatch, getState) => {
    try {
        dispatch({ type: "MARK_READ_REQUEST" });

        const { userLoginReducer: { userInfo } } = getState();

        const config = {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userInfo.access}`,
            },
        };

        const { data } = await axios.post(
            `${API_URL}/api/v1/chat/messages/mark_as_read/`,
            { message_ids: messageIds },
            config
        );

        dispatch({ type: "MARK_READ_SUCCESS", payload: data });

    } catch (error) {
        dispatch({
            type: "MARK_READ_FAIL",
            payload: error.response?.data || error.message,
        });
    }
};

export const getChatProfile = () => async (dispatch, getState) => {
    try {
        dispatch({ type: "CHAT_PROFILE_REQUEST" });

        const { userLoginReducer: { userInfo } } = getState();

        const { data } = await axios.get(`${API_URL}/api/v1/chat/profile/`, {
            headers: { Authorization: `Bearer ${userInfo.access}` },
        });

        dispatch({ type: "CHAT_PROFILE_SUCCESS", payload: data });

    } catch (error) {
        dispatch({
            type: "CHAT_PROFILE_FAIL",
            payload: error.response?.data || error.message
        });
    }
};

export const updateChatProfile = (payload) => async (dispatch, getState) => {
    try {
        dispatch({ type: "CHAT_PROFILE_UPDATE_REQUEST" });

        const { userLoginReducer: { userInfo } } = getState();

        const { data } = await axios.put(
            `${API_URL}/api/v1/chat/profile/`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userInfo.access}`,
                },
            }
        );

        dispatch({ type: "CHAT_PROFILE_UPDATE_SUCCESS", payload: data });

    } catch (error) {
        dispatch({
            type: "CHAT_PROFILE_UPDATE_FAIL",
            payload: error.response?.data || error.message,
        });
    }
};
