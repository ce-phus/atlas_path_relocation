import axios from "axios"

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

export const fetchBudgetData = () => async (dispatch, getState) => {
    try {
        dispatch({
            type: "BUDGET_SUMMARY_REQUEST"
        })

        const headers = getAuthHeaders(getState);
        const { data } = await axios.get(
            `${API_URL}/api/v1/budget/dashboard/budget_summary/`,
            headers
        );

        dispatch({
            type: "BUDGET_SUMMARY_SUCCESS",
            payload: data
        })

    } catch(error) {
        dispatch({
            type: "BUDGET_SUMMARY_FAIL",
            payload: error.response && error.response.data.error
                ? error.response.data.error
                : error.response.data.error,
        })
        console.log(error, "error")
    }
}

export const fetchExpenses = () => async (dispatch, getState) => {
    try {
        dispatch({
            type: "EXPENSES_LIST_REQUEST"
        })

        const headers = getAuthHeaders(getState);
        const { data } = await axios.get(
            `${API_URL}/api/v1/budget/expenses/`,
            headers
        );

        dispatch({
            type: "EXPENSES_LIST_SUCCESS",
            payload: data
        })

    } catch(error) {
        dispatch({
            type: "EXPENSES_LIST_FAIL",
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        })
    }
}

export const createExpense = (expenseData) => async (dispatch, getState) => {
    try {
        dispatch({
            type: "EXPENSE_CREATE_REQUEST"
        })

        const { userLoginReducer } = getState();
        const { userInfo } = userLoginReducer;

        const formData = new FormData();
        Object.keys(expenseData).forEach(key => {
            if (expenseData[key] !== null && expenseData[key] !== undefined) {
                formData.append(key, expenseData[key]);
            }
        });

        const { data } = await axios.post(
            `${API_URL}/api/v1/budget/expenses/`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${userInfo.access}`,
                    "Content-Type": "multipart/form-data",
                }
            }
        );

        dispatch({
            type: "EXPENSE_CREATE_SUCCESS",
            payload: data
        })

        // Refresh expenses list
        if (expenseData.case) {
            dispatch(fetchExpenses(expenseData.case));
            dispatch(fetchBudgetData(expenseData.case));
        }

    } catch(error) {
        dispatch({
            type: "EXPENSE_CREATE_FAIL",
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        })
    }
}

export const submitExpenseForApproval = (expenseId) => async (dispatch, getState) => {
    try {
        dispatch({
            type: "EXPENSE_SUBMIT_REQUEST"
        })

        const headers = getAuthHeaders(getState);
        const { data } = await axios.post(
            `${API_URL}/api/v1/budget/expenses/${expenseId}/submit_for_approval/`,
            {},
            headers
        );

        dispatch({
            type: "EXPENSE_SUBMIT_SUCCESS",
            payload: data
        })

        // Refresh data
        dispatch(fetchExpenses()); // You might need to pass caseId here

    } catch(error) {
        dispatch({
            type: "EXPENSE_SUBMIT_FAIL",
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        })
    }
}

export const approveExpense = (expenseId) => async (dispatch, getState) => {
    try {
        dispatch({
            type: "EXPENSE_APPROVE_REQUEST"
        })

        const headers = getAuthHeaders(getState);
        const { data } = await axios.post(
            `${API_URL}/api/v1/budget/expenses/${expenseId}/approve/`,
            {},
            headers
        );

        dispatch({
            type: "EXPENSE_APPROVE_SUCCESS",
            payload: data
        })

        // Refresh data
        dispatch(fetchExpenses()); // You might need to pass caseId here
        dispatch(fetchBudgetData()); // You might need to pass caseId here

    } catch(error) {
        dispatch({
            type: "EXPENSE_APPROVE_FAIL",
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message,
        })
    }
}