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
    taskDueOverviewReducer,
    getConsultantProfileReducer
} from "./profileReducers"

import {
    progressReducer
} from "./progressReducer"

import {
    budgetReducer
} from "./budgetReducer"

import {
    fetchConsultantClientReducer,
    fetchConsultantStatsReducer
} from "./consultantReducer"

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
    getConsultantProfileReducer,

    progressReducer,
    budgetReducer,

    fetchConsultantClientReducer,
    fetchConsultantStatsReducer
});

export default allReducers;