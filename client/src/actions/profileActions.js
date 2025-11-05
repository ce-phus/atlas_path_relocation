import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL

export const getAuthHeaders = (getState) => {
    const { userLoginReducer } = getState();
    const { userInfo } = userLoginReducer;

    if (!userInfo?.access) {
        console.error("No access token found");
        throw new Error("Authentication required");
    }

    return {
        headers: {
            Authorization: `Bearer ${userInfo.access}`,
            "Content-Type": "application/json",
        }
    }
}

export const getProfile = () => async (dispatch, getState) => {
    try {
        dispatch({ type: "GET_PROFILE_REQUEST" });

        const { userLoginReducer: { userInfo } } = getState();

        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.access}`,
            },
        };

        const { data } = await axios.get(`${API_URL}/api/v1/profile/get_profile/`, config);
        console.log("Profile data fetched:", data);
        dispatch({
            type: "GET_PROFILE_SUCCESS",
            payload: data,
        });
    } catch (error) {
        dispatch({
            type: "GET_PROFILE_FAIL",
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        });
        if (error.response.data.detail === "Given token not valid for any token type") {
            console.log("error response: ",error.response.data.detail)
            // dispatch(logout());
            
          }
    }
};

export const loadProfile = () => async(dispatch, getState) => {
    try {
        dispatch({ type: "PROFILE_LOAD_REQUEST" });

        const authHeaders = getAuthHeaders(getState);

        // Correct endpoint based on your URLs
        const {data} = await axios.get(`${API_URL}/api/v1/profile/profiles/`, authHeaders);

        console.log("Profile data loaded:", data);

        // Since your viewset filters by user, get the first profile
        const userProfile = data.results ? data.results[0] : data[0];
        
        if (!userProfile) {
            throw new Error("No profile found for current user");
        }

        dispatch({
            type: "PROFILE_LOAD_SUCCESS",
            payload: userProfile,
        })
    } catch(error) {
        console.error("Profile load error details:", {
            message: error.message,
            response: error.response,
            config: error.config
        });
        
        let errorMessage = error.message;
        
        if (error.response) {
            // Server responded with error status
            if (error.response.status === 401) {
                errorMessage = "Authentication failed. Please login again.";
            } else if (error.response.status === 404) {
                errorMessage = "Profile not found.";
            } else if (error.response.data) {
                errorMessage = error.response.data.detail || JSON.stringify(error.response.data);
            }
        } else if (error.request) {
            // Request made but no response received
            errorMessage = "Cannot connect to server. Please check if Django server is running.";
        }

        dispatch({
            type: "PROFILE_LOAD_FAIL",
            payload: errorMessage,
        });
    }
}

export const updateProfile = (profileData) => async(dispatch, getState) => {
    try {
        dispatch({ type: "PROFILE_UPDATE_REQUEST" });
        const authHeaders = getAuthHeaders(getState);

        const {data} = await axios.patch(`${API_URL}/api/v1/profiles/update/`, profileData, authHeaders);

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

        const {data} = await axios.get(`${API_URL}/api/v1/profile/consultants/available_consultants/`, authHeaders);

        console.log("Available consultants loaded:", data);

        dispatch({
            type: "AVAILABLE_CONSULTANTS_LOAD_SUCCESS",
            payload: data,
        })
    } catch(error) {
        dispatch({
            type: "AVAILABLE_CONSULTANTS_LOAD_SUCCESS",
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
        console.log("profile id: ", profileId);
        const authHeaders = getAuthHeaders(getState);

        const { data } = await axios.post(
            `${API_URL}/api/v1/profile/profiles/${profileId}/assign_consultant/`,
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

        const {data} = await axios.post(`${API_URL}/api/v1/profiles/profiles/update_progress/`, progressData, authHeaders);

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

        const {data} = await axios.get(`${API_URL}/api/v1/profile/documents/`, authHeaders);

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

        const {data} = await axios.post(`${API_URL}/api/v1/profile/documents/upload/`, documentData, authHeaders);

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

        const {data} = await axios.get(`${API_URL}/api/v1/profile/tasks/`, authHeaders);

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
            `${API_URL}/api/v1/profile/tasks/${taskId}/mark_complete/`,
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

        const {data} = await axios.get(`${API_URL}/api/v1/profile/tasks/overdue_tasks/`, authHeaders);

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
            `${API_URL}/api/v1/profile/documents/${documentId}/update_status/`,
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

        const {data} = await axios.post(`${API_URL}/api/v1/profile/tasks/`, taskData, authHeaders);

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

export const fetchProgress = (profileId) => async (dispatch, getState) => {
    try {
        dispatch({ type: "PROGRESS_FETCH_REQUEST" });

        if (!profileId) {
            throw new Error("Profile ID is required to fetch progress.");
        }

        const authHeaders = getAuthHeaders(getState);

        const { data } = await axios.get(
            `${API_URL}/api/v1/profile/tasks/progress/?profile_id=${profileId}`,
            authHeaders
        );

        console.log("Progress data fetched:", data);

        dispatch({
            type: "PROGRESS_FETCH_SUCCESS",
            payload: data,
        });
    } catch (error) {
        console.error("Error fetching progress:", error);

        dispatch({
            type: "PROGRESS_FETCH_FAIL",
            payload:
                error.response && error.response.data.detail
                    ? error.response.data.detail
                    : error.message,
        });
    }
};