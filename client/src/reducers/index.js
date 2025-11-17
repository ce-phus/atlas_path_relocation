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
    documentStatusReducer,
    taskSearchReducer,
    taskDueOverviewReducer
} from "./profileReducers"

import {
    progressReducer
} from "./progressReducer"

import {
    budgetReducer
} from "./budgetReducer"

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
    taskSearchReducer,
    taskDueOverviewReducer,

    progressReducer,
    budgetReducer,
});

export default allReducers;