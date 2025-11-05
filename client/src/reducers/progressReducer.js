export const progressReducer = (state = { loading: false, progress: {} }, action) => {
    switch (action.type) {
        case "PROGRESS_FETCH_REQUEST":
            return { ...state, loading: true };

        case "PROGRESS_FETCH_SUCCESS":
            return { loading: false, progress: action.payload };

        case "PROGRESS_FETCH_FAIL":
            return { loading: false, error: action.payload };

        default:
            return state;
    }
};