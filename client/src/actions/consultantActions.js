import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL

export const fetchConsultantsClients = () => async (dispatch, getState) => {
    try {
        dispatch({ type: 'CONSULTANTS_CLIENTS_REQUEST' });

        const { userLoginReducer: { userInfo } } = getState();

        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.access}`,
            },
        };

        const { data } = await axios.get(`${API_URL}/api/v1/profile/consultant-clients`, config);

        console.log("data fetched", data);

        dispatch({
            type: 'CONSULTANTS_CLIENTS_SUCCESS',
            payload: data,
        });
    } catch (error) {
        console.error(error, "Error fetching consultant clients");
        dispatch({
            type: 'CONSULTANTS_CLIENTS_FAIL',
            payload: error
        });
    }
}


export const fetchConsultantStats = () => async (dispatch, getState) => {
    try {
        dispatch({ type: 'CONSULTANT_STATS_REQUEST' });

        const { userLoginReducer: { userInfo } } = getState();

        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.access}`,
            },
        };

        const { data } = await axios.get(`${API_URL}/api/v1/profile/consultant-clients/client_stats`, config);

        dispatch({
            type: 'CONSULTANT_STATS_SUCCESS',
            payload: data,
        });
    } catch (error) {
        dispatch({
            type: 'CONSULTANT_STATS_FAIL',
            payload:
                error.response?.data?.error ??
                error.response?.data ??
                error.message,
        });
    }
}