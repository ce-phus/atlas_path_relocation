import { combineReducers } from "redux";

import { 
    userLoginReducer,
    userRegisterReducer,
    userActivateReducer,
    userResetPasswordConfirmReducer,
    userResetPasswordReducer,
} from "./userReducers";

import {
    profileReducer
} from "./profileReducers"

const allReducers = combineReducers({
    userLoginReducer,
    userRegisterReducer,
    userActivateReducer,
    userResetPasswordReducer,
    userResetPasswordConfirmReducer,

    profileReducer,
});

export default allReducers;