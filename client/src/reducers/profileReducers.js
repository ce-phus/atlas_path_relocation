const initialState = {
    loading: false,
    profile: null,
    error: null,
    consultants: [],
    documents: [],
    tasks: [],
    overdueTasks: [],
    success: false,
    documentloading: false,
    documenterror: null,
    taskloading: false,
    taskerror: null,
    overdueloading: false,
    overdueerror: null,
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
        case "AVAILABLE_CONSULTANTS_LOAD_REQUEST":
            return { ...state, loading: true, error: null };
        case "AVAILABLE_CONSULTANTS_LOAD_SUCCESS":
            return { ...state, loading: false, consultants: action.payload, error: null };
        case "AVAILABLE_CONSULTANTS_LOAD_SUCCESS":
            return { ...state, loading: false, error: action.payload };

        // === DOCUMENTS ===
        case "DOCUMENTS_LOAD_REQUEST":
        case "DOCUMENTS_UPLOAD_REQUEST":
        case "DOCUMENT_STATUS_UPDATE_REQUEST":
            return { ...state, documentloading: true, documenterror: null };

        case "DOCUMENTS_LOAD_SUCCESS":
        case "DOCUMENTS_UPLOAD_SUCCESS":
        case "DOCUMENT_STATUS_UPDATE_SUCCESS":
            return { ...state, documentloading: false, documents: action.payload, documenterror: null };

        case "DOCUMENTS_LOAD_FAIL":
        case "DOCUMENTS_UPLOAD_FAIL":
        case "DOCUMENT_STATUS_UPDATE_FAIL":
            return { ...state, documentloading: false, documenterror: action.payload };

        // === TASKS ===
        case "TASKS_LOAD_REQUEST":
        case "TASK_CREATE_REQUEST":
        case "TASK_COMPLETE_REQUEST":
            return { ...state, taskloading: true, taskerror: null };
        case "TASKS_LOAD_SUCCESS":
            return { ...state, taskoading: false, tasks: action.payload, taskerror: null };

        case "TASK_CREATE_SUCCESS":
        case "TASK_COMPLETE_SUCCESS":
            return { ...state, taskloading: false, success: true, taskerror: null };

        case "TASKS_LOAD_FAIL":
        case "TASK_CREATE_FAIL":
        case "TASK_COMPLETE_FAIL":
            return { ...state, taskloading: false, taskerror: action.payload };

        // === OVERDUE TASKS ===
        case "OVERDUE_TASKS_LOAD_REQUEST":
            return { ...state, overdueloading: true, overdueerror: null };
        
        case "OVERDUE_TASKS_LOAD_SUCCESS":
            return { ...state, overdueloading: false, overdueTasks: action.payload, overdueerror: null };
        
        case "OVERDUE_TASKS_LOAD_FAIL":
            return { ...state, overdueloading: false, overdueerror: action.payload };

        default:
            return state;
    }
}

export const getProfileReducer = (state = initialState, action) => {
    switch (action.type) {
        case "GET_PROFILE_REQUEST":
            return { ...state, loading: true };
        case "GET_PROFILE_SUCCESS":
            return { loading: false, profile: action.payload };
        case "GET_PROFILE_FAIL":
            return { loading: false, error: action.payload };
        default:
            return state;
    }
};