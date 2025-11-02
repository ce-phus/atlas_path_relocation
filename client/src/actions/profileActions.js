import axios from "axios";

export const getAuthHeaders = (getState) => {
    const { userLoginReducer } = getState();
    const { userInfo } = userLoginReducer;

    return {
        headers: {
            Authorization: `Bearer ${userInfo?.access}`,
            "Content-Type": "application/json",
        }
    }
}



export const loadProfile = () => async(dispatch, getState) => {
    try {
        dispatch({ type: "PROFILE_LOAD_REQUEST" });

        const authHeaders = getAuthHeaders(getState);

        const {data} = await axios.get("/api/v1/profile/user_profile/profiles", authHeaders);

        console.log("Profile data loaded:", data);

        dispatch({
            type: "PROFILE_LOAD_SUCCESS",
            payload: data,
        })
    } catch(error) {
        dispatch({
            type: "PROFILE_LOAD_FAIL",
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        });
    }
}

export const updateProfile = (profileData) => async(dispatch, getState) => {
    try {
        dispatch({ type: "PROFILE_UPDATE_REQUEST" });
        const authHeaders = getAuthHeaders(getState);

        const {data} = await axios.patch("/api/v1/profiles/user_profile/profiles/update/", profileData, authHeaders);

        console.log("Profile data updated:", data);

        dispatch({
            type: "PROFILE_UPDATE_SUCCESS",
            payload: data,
        })
    } catch(error) {
        dispatch({
            type: "PROFILE_UPDATE_FAIL",
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        });
    }
}

export const loadAvailableConsultants = () => async(dispatch, getState) => {
    try {
        dispatch({ type: "AVAILABLE_CONSULTANTS_LOAD_REQUEST" });
        const authHeaders = getAuthHeaders(getState);

        const {data} = await axios.get("/api/v1/profile/user_profile/profiles/available_consultants/", authHeaders);

        console.log("Available consultants loaded:", data);

        dispatch({
            type: "AVAILABLE_CONSULTANTS_LOAD_SUCCESS",
            payload: data,
        })
    } catch(error) {
        dispatch({
            type: "AVAILABLE_CONSULTANTS_LOAD_FAIL",
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        });
    }
}

export const assignConsultant = (consultantId) => async(dispatch, getState) => {
    try {
        dispatch({ type: "ASSIGN_CONSULTANT_REQUEST" });

        const { profile } = getState();
        const profileId = profile.profile?.id;
        const authHeaders = getAuthHeaders(getState);

        const { data } = await axios.post(
            `api/v1/profile/user_profile/profiles/${profileId}/assign_consultant/`,
            { consultant_id: consultantId },
            authHeaders
        )
        console.log("Consultant assigned:", data);

        dispatch({
            type: "ASSIGN_CONSULTANT_SUCCESS",
            payload: data,
        })
    } catch(error) {
        dispatch({
            type: "ASSIGN_CONSULTANT_FAIL",
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        });
    }
}

export const updateProfileProgress = (progressData) => async(dispatch, getState) => {
    try {
        dispatch({ type: "PROFILE_PROGRESS_UPDATE_REQUEST" });
        const authHeaders = getAuthHeaders(getState);

        const {data} = await axios.post("/api/v1/profiles/user_profile/profiles/update_progress/", progressData, authHeaders);

        console.log("Profile progress updated:", data);

        dispatch({
            type: "PROFILE_PROGRESS_UPDATE_SUCCESS",
            payload: data,
        })
    } catch(error) {
        dispatch({
            type: "PROFILE_PROGRESS_UPDATE_FAIL",
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        });
    }
}

export const loadDocuments = () => async(dispatch, getState) => {
    try {
        dispatch({ type: "DOCUMENTS_LOAD_REQUEST" });

        const authHeaders = getAuthHeaders(getState);

        const {data} = await axios.get("/api/v1/profile/user_profile/documents/", authHeaders);

        console.log("Documents loaded:", data);

        dispatch({
            type: "DOCUMENTS_LOAD_SUCCESS",
            payload: data,
        })
    } catch(error) {
        dispatch({
            type: "DOCUMENTS_LOAD_FAIL",
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        });
    }
}

export const uploadDocument = (documentData) => async(dispatch, getState) => {
    try {
        dispatch({ type: "DOCUMENT_UPLOAD_REQUEST" });
        const authHeaders = {
            headers: {
                Authorization: `Bearer ${getState().userLoginReducer.userInfo?.access}`,
                "Content-Type": "multipart/form-data",
            }
        }

        const {data} = await axios.post("/api/v1/profile/user_profile/documents/upload/", documentData, authHeaders);

        console.log("Document uploaded:", data);

        dispatch({
            type: "DOCUMENT_UPLOAD_SUCCESS",
            payload: data,
        })
    } catch(error) {
        dispatch({
            type: "DOCUMENT_UPLOAD_FAIL",
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        });
    }
}

export const loadTasks = () => async(dispatch, getState) => {
    try {
        dispatch({ type: "TASKS_LOAD_REQUEST" });

        const authHeaders = getAuthHeaders(getState);

        const {data} = await axios.get("/api/v1/profile/user_profile/tasks/", authHeaders);

        console.log("Tasks loaded:", data);

        dispatch({
            type: "TASKS_LOAD_SUCCESS",
            payload: data,
        })
    } catch(error) {
        dispatch({
            type: "TASKS_LOAD_FAIL",
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        });
    }
}

export const markTaskComplete = (taskId) => async(dispatch, getState) => {
    try {
        dispatch({ type: "TASK_COMPLETE_REQUEST" });

        const authHeaders = getAuthHeaders(getState);

        const {data} = await axios.post(
            `/api/v1/profile/user_profile/tasks/${taskId}/complete/`,
            {},
            authHeaders
        );

        console.log("Task marked complete:", data);

        dispatch({
            type: "TASK_COMPLETE_SUCCESS",
            payload: data,
        })

        dispatch(loadTasks());
    } catch(error) {
        dispatch({
            type: "TASK_COMPLETE_FAIL",
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        });
    }
}

export const loadOverdueTasks = () => async(dispatch, getState) => {
    try {
        dispatch({ type: "OVERDUE_TASKS_LOAD_REQUEST" });

        const authHeaders = getAuthHeaders(getState);

        const {data} = await axios.get("/api/v1/profile/user_profile/tasks/overdue_tasks/", authHeaders);

        console.log("Overdue tasks loaded:", data);

        dispatch({
            type: "OVERDUE_TASKS_LOAD_SUCCESS",
            payload: data,
        })
    } catch(error) {
        dispatch({
            type: "OVERDUE_TASKS_LOAD_FAIL",
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        });
    }
}

export const updateDocumentStatus = (documentId, statusData) => async(dispatch, getState) => {
    try {
        dispatch({ type: "DOCUMENT_STATUS_UPDATE_REQUEST" });

        const authHeaders = getAuthHeaders(getState);

        const {data} = await axios.patch(
            `/api/v1/profile/user_profile/documents/${documentId}/update_status/`,
            statusData,
            authHeaders
        );

        console.log("Document status updated:", data);

        dispatch({
            type: "DOCUMENT_STATUS_UPDATE_SUCCESS",
            payload: data,
        })

        dispatch(loadDocuments());
    } catch(error) {
        dispatch({
            type: "DOCUMENT_STATUS_UPDATE_FAIL",
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        });
    }
}

// Create New task (for consultants)

export const createTask = (taskData) => async(dispatch, getState) => {
    try {
        dispatch({ type: "TASK_CREATE_REQUEST" });
        const authHeaders = getAuthHeaders(getState);

        const {data} = await axios.post("/api/v1/profile/user_profile/tasks/", taskData, authHeaders);

        console.log("Task created:", data);

        dispatch({
            type: "TASK_CREATE_SUCCESS",
            payload: data,
        })
    } catch(error) {
        dispatch({
            type: "TASK_CREATE_FAIL",
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        });
    }
}