import { combineReducers } from "redux";

import { 
    userLoginReducer,
    userRegisterReducer,
    userActivateReducer,
    userResetPasswordConfirmReducer,
    userResetPasswordReducer,
} from "./userReducers";

import {
    profileReducer,
    getProfileReducer,
    documentSearchReducer,
    documentStatusReducer
} from "./profileReducers"

import {
    progressReducer
} from "./progressReducer"

const allReducers = combineReducers({
    userLoginReducer,
    userRegisterReducer,
    userActivateReducer,
    userResetPasswordReducer,
    userResetPasswordConfirmReducer,

    profileReducer,
    getProfileReducer,
    documentSearchReducer,
    documentStatusReducer,

    progressReducer,
});

export default allReducers;