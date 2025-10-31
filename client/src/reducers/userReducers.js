const initialState = {
    userInfo: null,
    isGuest: false, 
    loading: false,
    error: null
};

export const userLoginReducer = (state = initialState, action) => {
    switch (action.type) {
        case "USER_LOGIN_REQUEST":
        case "GUEST_USER_REQUEST": 
            return { ...state, loading: true };
        
        case "USER_LOGIN_SUCCESS":
            return { 
                loading: false, 
                userInfo: action.payload, 
                isGuest: false,
                error: null 
            };
        
        case "GUEST_USER_SUCCESS":
            return { 
                loading: false, 
                userInfo: action.payload, 
                isGuest: true,
                error: null 
            };
        
        case "USER_LOGIN_FAIL":
        case "GUEST_USER_FAIL":
            return { 
                loading: false, 
                error: action.payload, 
                userInfo: null,
                isGuest: false 
            };
        
        case "USER_LOGOUT":
            return { ...initialState };
        
        default:
            return state;
    }
};

export const userRegisterReducer = (state = initialState, action) => {
    switch (action.type) {
        case "USER_REGISTER_REQUEST":
            return { ...state, loading: true };
        case "USER_REGISTER_SUCCESS":
            return { loading: false, userInfo: action.payload, error: null };
        case "USER_REGISTER_FAIL":
            return { loading: false, error: action.payload, userInfo: null };
        default:
            return state;
    }
};

const userActivateInitialState = {
    loading: false,
    success: false,
    error: null
};

export const userActivateReducer = (state = userActivateInitialState, action) => {
    switch (action.type) {
        case "USER_ACTIVATE_REQUEST":
            return { loading: true, success: false };
        case "USER_ACTIVATE_SUCCESS":
            return { loading: false, success: true, error: null };
        case "USER_ACTIVATE_FAIL":
            return { loading: false, success: false, error: action.payload };
        default:
            return state;
    }
};

const resetPasswordInitialState = {
    loading: false,
    success: false,
    error: null
};

export const userResetPasswordReducer = (state = resetPasswordInitialState, action) => {
    switch (action.type) {
        case "USER_RESET_PASSWORD_REQUEST":
            return { loading: true, success: false };
        case "USER_RESET_PASSWORD_SUCCESS":
            return { loading: false, success: true, error: null };
        case "USER_RESET_PASSWORD_FAIL":
            return { loading: false, success: false, error: action.payload };
        default:
            return state;
    }
};

export const userResetPasswordConfirmReducer = (state = resetPasswordInitialState, action) => {
    switch (action.type) {
        case "USER_RESET_PASSWORD_CONFIRM_REQUEST":
            return { loading: true, success: false };
        case "USER_RESET_PASSWORD_CONFIRM_SUCCESS":
            return { loading: false, success: true, error: null };
        case "USER_RESET_PASSWORD_CONFIRM_FAIL":
            return { loading: false, success: false, error: action.payload };
        default:
            return state;
    }
};
