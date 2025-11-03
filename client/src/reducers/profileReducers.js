const initialState = {
    loading: false,
    profile: null,
    error: null,
    consultants: [],
    documents: [],
    tasks: [],
    overdueTasks: [],
    success: false,
}

export const profileReducer = (state = initialState, action) => {
    switch (action.type) {
        // === PROFILE ===
        case "PROFILE_LOAD_REQUEST":
        case "PROFILE_UPDATE_REQUEST":
        case "PROFILE_PROGRESS_UPDATE_REQUEST":
        case "ASSIGN_CONSULTANT_REQUEST":
            return { ...state, loading: true, error: null, success: false };
        case "PROFILE_LOAD_SUCCESS":
            return { ...state, loading: false, profile: action.payload, error: null };
        case "PROFILE_UPDATE_SUCCESS":
        case "PROFILE_PROGRESS_UPDATE_SUCCESS":
        case "ASSIGN_CONSULTANT_SUCCESS":
            return { ...state, loading: false, profile: action.payload, error: null, success: true };

        case "PROFILE_LOAD_FAIL":
        case "PROFILE_UPDATE_FAIL":
        case "PROFILE_PROGRESS_UPDATE_FAIL":
        case "ASSIGN_CONSULTANT_FAIL":
            return { ...state, loading: false, error: action.payload };
                            
        //  === CONSULTANTS ===
        case "AVAILABALE_CONSULTANTS_LOAD_REQUEST":
            return { ...state, loading: true, error: null };
        case "AVAILABALE_CONSULTANTS_LOAD_SUCCESS":
            return { ...state, loading: false, consultants: action.payload, error: null };
        case "AVAILABALE_CONSULTANTS_LOAD_FAIL":
            return { ...state, loading: false, error: action.payload };

        // === DOCUMENTS ===
        case "DOCUMENTS_LOAD_REQUEST":
        case "DOCUMENTS_UPLOAD_REQUEST":
        case "DOCUMENT_STATUS_UPDATE_REQUEST":
            return { ...state, loading: true, error: null };
        case "DOCUMENTS_LOAD_SUCCESS":
        case "DOCUMENTS_UPLOAD_SUCCESS":
        case "DOCUMENT_STATUS_UPDATE_SUCCESS":
            return { ...state, loading: false, documents: action.payload, error: null };
        case "DOCUMENTS_LOAD_FAIL":
        case "DOCUMENTS_UPLOAD_FAIL":
        case "DOCUMENT_STATUS_UPDATE_FAIL":
            return { ...state, loading: false, error: action.payload };

        // === TASKS ===
        case "TASKS_LOAD_REQUEST":
        case "TASK_CREATE_REQUEST":
        case "TASK_COMPLETE_REQUEST":
            return { ...state, loading: true, error: null };
        case "TASKS_LOAD_SUCCESS":
            return { ...state, loading: false, tasks: action.payload, error: null };

        case "TASK_CREATE_SUCCESS":
        case "TASK_COMPLETE_SUCCESS":
            return { ...state, loading: false, success: true, error: null };

        case "TASKS_LOAD_FAIL":
        case "TASK_CREATE_FAIL":
        case "TASK_COMPLETE_FAIL":
            return { ...state, loading: false, error: action.payload };

        // === OVERDUE TASKS ===
        case "OVERDUE_TASKS_LOAD_REQUEST":
            return { ...state, loading: true, error: null };
        
        case "OVERDUE_TASKS_LOAD_SUCCESS":
            return { ...state, loading: false, overdueTasks: action.payload, error: null };
        
        case "OVERDUE_TASKS_LOAD_FAIL":
            return { ...state, loading: false, error: action.payload };

        default:
            return state;
    }
}

export const getProfileReducer = (state = { profile: {} }, action) => {
    switch (action.type) {
        case "GET_PROFILE_REQUEST":
            return { ...state, loading: true };
        case "GET_PROFILE_SUCCESS":
            return { loading: false, profile: action.payload.profile };
        case "GET_PROFILE_FAIL":
            return { loading: false, error: action.payload };
        default:
            return state;
    }
};