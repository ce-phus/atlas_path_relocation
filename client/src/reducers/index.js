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
    getConsultantProfileReducer,
    documentUpdateStatusReducer,
    createTaskReducer,
    updateTaskReducer,
    deleteTaskReducer
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

import {
    chatListReducer,
    startConversationReducer,
    messagesReducer,
    messageReadReducer,
    chatProfileReducer,
} from "./chatReducers";

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
    documentUpdateStatusReducer,
    createTaskReducer,
    updateTaskReducer,
    deleteTaskReducer,

    progressReducer,
    budgetReducer,

    fetchConsultantClientReducer,
    fetchConsultantStatsReducer,

    chatListReducer,
    startConversationReducer,
    messagesReducer,
    messageReadReducer,
    chatProfileReducer,
});

export default allReducers;