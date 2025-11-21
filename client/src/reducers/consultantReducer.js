export const fetchConsultantClientReducer = (state = { clients_data: [], loading:false, error:null }, action) => {
    switch (action.type) {
        case 'CONSULTANTS_CLIENTS_REQUEST':
            return { loading: true, clients_data: [] };
        case 'CONSULTANTS_CLIENTS_SUCCESS':
            return { loading: false, clients_data: action.payload };
        case 'CONSULTANTS_CLIENTS_FAIL':
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const fetchConsultantStatsReducer = (state = { stats_data: [], loading:false, error:null }, action) => {
    switch (action.type) {
        case 'CONSULTANT_STATS_REQUEST':
            return { loading: true, stats_data: [] };
        case 'CONSULTANT_STATS_SUCCESS':
            return { loading: false, stats_data: action.payload };
        case 'CONSULTANT_STATS_FAIL':
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}