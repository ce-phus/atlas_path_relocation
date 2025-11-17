const initialState = {
    budgetSummary: null,
    expenses: [],
    loading: false,
    error: null,
    createLoading: false,
    createError: null,
}

export const budgetReducer = (state = initialState, action) => {
    switch (action.type) {
        case "BUDGET_SUMMARY_REQUEST":
        case "EXPENSES_LIST_REQUEST":
            return {
                ...state,
                loading: true,
                error: null
            }

        case "EXPENSE_CREATE_REQUEST":
            return {
                ...state,
                createLoading: true,
                createError: null
            }

        case "EXPENSE_SUBMIT_REQUEST":
        case "EXPENSE_APPROVE_REQUEST":
            return {
                ...state,
                loading: true
            }

        case "BUDGET_SUMMARY_SUCCESS":
            return {
                ...state,
                loading: false,
                budgetSummary: action.payload,
                error: null
            }

        case "EXPENSES_LIST_SUCCESS":
            return {
                ...state,
                loading: false,
                expenses: action.payload,
                error: null
            }

        case "EXPENSE_CREATE_SUCCESS":
            return {
                ...state,
                createLoading: false,
                createError: null
            }

        case "EXPENSE_SUBMIT_SUCCESS":
        case "EXPENSE_APPROVE_SUCCESS":
            return {
                ...state,
                loading: false
            }

        case "BUDGET_SUMMARY_FAIL":
        case "EXPENSES_LIST_FAIL":
            return {
                ...state,
                loading: false,
                error: action.payload
            }

        case "EXPENSE_CREATE_FAIL":
            return {
                ...state,
                createLoading: false,
                createError: action.payload
            }

        case "EXPENSE_SUBMIT_FAIL":
        case "EXPENSE_APPROVE_FAIL":
            return {
                ...state,
                loading: false,
                error: action.payload
            }

        case "BUDGET_RESET":
            return initialState

        default:
            return state
    }
}