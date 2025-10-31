import { configureStore } from '@reduxjs/toolkit';
// import metricsMiddleware from "../src/middleware/metricsmiddleware"
import allReducers from "./src/reducers/index"

const userInfoFromStorage = typeof window !== 'undefined'
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

const store = configureStore({
  reducer: allReducers,
  
  preloadedState: {
    userLoginReducer: {
      userInfo: userInfoFromStorage,
      isGuest:userInfoFromStorage?.isGuest || false
    },
  },
});

export default store;