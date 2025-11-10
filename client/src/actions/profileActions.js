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

export const updateProfile = (profileData, id) => async(dispatch, getState) => {
    try {
        dispatch({ type: "PROFILE_UPDATE_REQUEST" });
        const authHeaders = getAuthHeaders(getState);

        const cleanedData = Object.fromEntries(
            Object.entries(profileData)
              .filter(([_, v]) => v !== "" && v !== undefined)
              .map(([k, v]) => [k, typeof v === "boolean" ? v : v])
          );

        const {data} = await axios.patch(`${API_URL}/api/v1/profile/profiles/${id}/`, cleanedData, authHeaders);

        console.log("Profile data updated:", data);

        dispatch({
            type: "PROFILE_UPDATE_SUCCESS",
            payload: data,
        })

        dispatch(loadProfile());
    } catch(error) {
        console.log("Error: ", error)
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

        const { getProfileReducer } = getState();
        const profileId = getProfileReducer.profile?.id;
        console.log("profile id: ", profileId);
        const authHeaders = getAuthHeaders(getState);
        
        console.log("Sending request to:", `${API_URL}/api/v1/profile/profiles/${profileId}/assign_consultant/`);

        const { data } = await axios.post(
            `${API_URL}/api/v1/profile/profiles/${profileId}/assign_consultant/`,
            { consultant_id: consultantId },
            authHeaders
        )
        console.log("Consultant assigned:", data);
        loadAvailableConsultants();
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

export const loadDocuments = (profileId) => async (dispatch, getState) => {
    try {
        dispatch({ type: "DOCUMENTS_LOAD_REQUEST" });

        const authHeaders = getAuthHeaders(getState);
        const { data } = await axios.get(
            `${API_URL}/api/v1/profile/documents/`,
            authHeaders
        );

        dispatch({
            type: "DOCUMENTS_LOAD_SUCCESS",
            payload: data,
        });
    } catch (error) {
        dispatch({
            type: "DOCUMENTS_LOAD_FAIL",
            payload: error.response?.data?.detail || error.message,
        });
    }
};
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

export const documentSearch = (query) => async (dispatch, getState) => {
    try {
        dispatch({ type: "DOCUMENT_SEARCH_REQUEST" });

        const authHeaders = getAuthHeaders(getState);

        const { data } = await axios.get(
            `${API_URL}/api/v1/profile/search_documents/?q=${encodeURIComponent(query)}`,
            authHeaders
        );

        console.log("Document search results:", data);

        dispatch({
            type: "DOCUMENT_SEARCH_SUCCESS",
            payload: data,
        });
    } catch (error) {
        console.error("Error searching documents:", error);

        dispatch({
            type: "DOCUMENT_SEARCH_FAIL",
            payload:
                error.response && error.response.data.detail
                    ? error.response.data.detail
                    : error.message,
        });
    }
}

export const documentStatus = (statusFilter = "") => async (dispatch, getState) => {
    try {
        dispatch({ type: "DOCUMENT_STATUS_REQUEST" });

        const authHeaders = getAuthHeaders(getState);

        const url = statusFilter
            ? `${API_URL}/api/v1/profile/document_status_overview/?status=${encodeURIComponent(statusFilter)}`
            : `${API_URL}/api/v1/profile/document_status_overview/`;

        const { data } = await axios.get(url, authHeaders);

        console.log("Document status overview:", data);

        dispatch({
            type: "DOCUMENT_STATUS_SUCCESS",
            payload: data,
        });
    } catch (error) {
        console.error("Error fetching document status overview:", error);

        dispatch({
            type: "DOCUMENT_STATUS_FAIL",
            payload:
                error.response && error.response.data.detail
                    ? error.response.data.detail
                    : error.message,
        });
    }
};

export const taskSearch = (query) => async (dispatch, getState) => {
    try {
        dispatch({ type: "TASK_SEARCH_REQUEST" });

        const authHeaders = getAuthHeaders(getState);

        const { data } = await axios.get(
            `${API_URL}/api/v1/profile/search_tasks/?q=${encodeURIComponent(query)}`,
            authHeaders
        );

        console.log("Task search results:", data);

        dispatch({
            type: "TASK_SEARCH_SUCCESS",
            payload: data,
        });
    } catch (error) {
        console.error("Error searching tasks:", error);

        dispatch({
            type: "TASK_SEARCH_FAIL",
            payload:
                error.response && error.response.data.detail
                    ? error.response.data.detail
                    : error.message,
        });
    }
}

export const taskDueOverview = (filters = {}) => async (dispatch, getState) => {
    try {
        dispatch({ type: "TASK_DUE_OVERVIEW_REQUEST" });

        const authHeaders = getAuthHeaders(getState);
        const params = new URLSearchParams();

        // Add all possible filter parameters
        if (filters.filter) params.append("filter", filters.filter);
        if (filters.q) params.append("q", filters.q);
        if (filters.due) params.append("due", filters.due);
        if (filters.start) params.append("start", filters.start);
        if (filters.end) params.append("end", filters.end);
        if (filters.page) params.append("page", filters.page);
        if (filters.page_size) params.append("page_size", filters.page_size);

        const baseUrl = `${API_URL}/api/v1/profile/task_due_overview/`;
        const queryString = params.toString();
        const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

        console.log("Fetching Task Due Overview:", url);

        const { data } = await axios.get(url, authHeaders);

        dispatch({
            type: "TASK_DUE_OVERVIEW_SUCCESS",
            payload: data,
        });
    } catch (error) {
        console.error("Error fetching task due overview:", error);

        dispatch({
            type: "TASK_DUE_OVERVIEW_FAIL",
            payload: error.response?.data?.detail || error.message,
        });
    }
};