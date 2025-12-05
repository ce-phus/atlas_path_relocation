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

    statusLoading: false,
    statusSuccess: false,
    statusError: null,
    updatedDocument: null,
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
            return { ...state, loading: false, error: action.payload, success: false };
                            
        // === CONSULTANTS ===
        case "AVAILABLE_CONSULTANTS_LOAD_REQUEST":
            return { ...state, loading: true, error: null };
            
        case "AVAILABLE_CONSULTANTS_LOAD_SUCCESS":
            return { ...state, loading: false, consultants: action.payload, error: null };
            
        case "AVAILABLE_CONSULTANTS_LOAD_FAIL":
            return { ...state, loading: false, error: action.payload };

        // === DOCUMENTS LOADING ===
        case "DOCUMENTS_LOAD_REQUEST":
            return { ...state, documentloading: true, documenterror: null };
            
        case "DOCUMENTS_LOAD_SUCCESS":
            return { ...state, documentloading: false, documents: action.payload, documenterror: null };

        case "DOCUMENTS_LOAD_FAIL":
            return { ...state, documentloading: false, documenterror: action.payload };

        // === DOCUMENT UPLOAD ===
        case "DOCUMENTS_UPLOAD_REQUEST":
            return { ...state, documentloading: true, documenterror: null };
            
        case "DOCUMENTS_UPLOAD_SUCCESS":
            return { ...state, documentloading: false, success: true, documenterror: null };

        case "DOCUMENTS_UPLOAD_FAIL":
            return { ...state, documentloading: false, documenterror: action.payload, success: false };

        // === TASKS ===
        case "TASKS_LOAD_REQUEST":
        case "TASK_COMPLETE_REQUEST":
            return { ...state, taskloading: true, taskerror: null };
            
        case "TASKS_LOAD_SUCCESS":
            return { ...state, taskloading: false, tasks: action.payload, taskerror: null };

        case "TASK_COMPLETE_SUCCESS":
            return { ...state, taskloading: false, success: true, taskerror: null };

        case "TASKS_LOAD_FAIL":
        case "TASK_COMPLETE_FAIL":
            return { ...state, taskloading: false, taskerror: action.payload, success: false };

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
};

export const createTaskReducer = (state = initialState, action) => {
    switch (action.type) {
        case "TASK_CREATE_REQUEST":
            return { ...state, loading: true, error: null, success: false };
        case "TASK_CREATE_SUCCESS":
            return { ...state, loading: false, success: true, error: null };
        case "TASK_CREATE_FAIL":
            return { ...state, loading: false, error: action.payload, success: false };
        default:
            return state;
    }
}

export const updateTaskReducer = (state = initialState, action) => {
    switch (action.type) {
        case "TASK_UPDATE_REQUEST":
            return { ...state, loading: true, error: null, success: false };
        case "TASK_UPDATE_SUCCESS":
            return { ...state, loading: false, success: true, error: null };
        case "TASK_UPDATE_FAIL":
            return { ...state, loading: false, error: action.payload, success: false };
        default:
            return state;
    }
}

export const deleteTaskReducer = (state = initialState, action) => {
    switch (action.type) {
        case "TASK_DELETE_REQUEST":
            return { ...state, loading: true, error: null, success: false };
        case "TASK_DELETE_SUCCESS":
            return { ...state, loading: false, success: true, error: null };
        case "TASK_DELETE_FAIL":
            return { ...state, loading: false, error: action.payload, success: false };
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

export const documentSearchReducer = (state = { documents: [] }, action) => {
    switch (action.type) {
        case "DOCUMENT_SEARCH_REQUEST":
            return { ...state, loading: true };
        case "DOCUMENT_SEARCH_SUCCESS":
            return { loading: false, documents: action.payload };
        case "DOCUMENT_SEARCH_FAIL":
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const documentStatusReducer = (state = { overview: {}, loading: false }, action) => {
    switch (action.type) {
        case "DOCUMENT_STATUS_REQUEST":
            return { ...state, loading: true };

        case "DOCUMENT_STATUS_SUCCESS":
            return { loading: false, overview: action.payload };

        case "DOCUMENT_STATUS_FAIL":
            return { loading: false, error: action.payload };

        default:
            return state;
    }
}

export const taskSearchReducer = (state = { tasks: [] }, action) => {
    switch (action.type) {
        case "TASK_SEARCH_REQUEST":
            return { ...state, loading: true };
        case "TASK_SEARCH_SUCCESS":
            return { loading: false, tasks: action.payload };
        case "TASK_SEARCH_FAIL":
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const taskDueOverviewReducer = (state = { overview: {}, loading: false }, action) => {
    switch (action.type) {
        case "TASK_DUE_OVERVIEW_REQUEST":
            return {
                ...state,
                loading: true,
                error: null,
            };

        case "TASK_DUE_OVERVIEW_SUCCESS":
            return {
                ...state,
                loading: false,
                tasks: action.payload, 
            };

        case "TASK_DUE_OVERVIEW_FAIL":
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        default:
            return state;
    }
};

export const getConsultantProfileReducer = (state = { loading: false, consultant: null, error: null }, action) => {
    switch (action.type) {
        case "GET_CONSULTANT_PROFILE_REQUEST":
            return { ...state, loading: true };
        case "GET_CONSULTANT_PROFILE_SUCCESS":
            return { loading: false, consultant: action.payload };
        case "GET_CONSULTANT_PROFILE_FAIL":
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const documentUpdateStatusReducer = (state = initialState, action) => {
    switch (action.type) {
        case "DOCUMENT_STATUS_UPDATE_REQUEST":
            return { 
                ...state, 
                statusLoading: true, 
                statusSuccess: false,
                statusError: null,
                updatedDocument: null
            };

        case "DOCUMENT_STATUS_UPDATE_SUCCESS":
            return { 
                ...state, 
                statusLoading: false, 
                statusSuccess: true,
                statusError: null,
                updatedDocument: action.payload
            };

        case "DOCUMENT_STATUS_UPDATE_FAIL":
            return { 
                ...state, 
                statusLoading: false, 
                statusSuccess: false,
                statusError: action.payload,
                updatedDocument: null
            };

        case "DOCUMENT_STATUS_UPDATE_RESET":
            return documentStatusInitialState;

        default:
            return state;
    }
};
