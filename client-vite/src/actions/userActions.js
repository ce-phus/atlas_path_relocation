import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL 

// login

export const login = (email, password) => async (dispatch) => {

    try {
      dispatch({ type: "USER_LOGIN_REQUEST" });
  
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
  
      const { data } = await axios.post(`${API_URL}/api/v1/auth/jwt/create/`, { email, password }, config);
  
      const userData = {
        ...data,
        isGuest: false 
      };
  
      dispatch({
        type: "USER_LOGIN_SUCCESS",
        payload: data,
      });
  
      localStorage.setItem('userInfo', JSON.stringify(userData));
    } catch (error) {
      dispatch({
        type: "USER_LOGIN_FAIL",
        payload: error.response && error.response.data.detail ? error.response.data.detail : error.message,
      });
  
      if (error.response.data.detail === "Given token not valid for any token type") {
        dispatch(logout());
        navigate('/')
      }
    }
  };


export const register = (username, firstName, lastName, email, password, re_password) => async (dispatch) => {
try {
    dispatch({ type: "USER_REGISTER_REQUEST" });

    const config = {
        headers: {
        'Content-Type': 'application/json',
        },
    }

    const { data } = await axios.post(`${API_URL}/api/v1/auth/users/`, { 
        username, 
        first_name: firstName, 
        last_name: lastName, 
        email, 
        password, 
        re_password 
    }, config);

    dispatch({
        type: "USER_REGISTER_SUCCESS",
        payload: data,
    });

    dispatch({
        type: "USER_LOGIN_SUCCESS",
        payload: data,
    });

    localStorage.setItem('userInfo', JSON.stringify(data));

} catch (error) {
    let errorMessage = "Registration failed. Please check your details.";

    if (error.response && error.response.data) {
        const errorData = error.response.data;

        errorMessage = Object.entries(errorData)
            .map(([key, messages]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${messages.join(", ")}`)
            .join(" | ");
    }

    dispatch({
        type: "USER_REGISTER_FAIL",
        payload: errorMessage,
    });
}
};

export const activateUser = (uid, token) => async (dispatch) => {
    try {
      dispatch({ type: "USER_ACTIVATE_REQUEST" });

      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      }
  
      const { data } = await axios.post(`${API_URL}/api/v1/auth/users/activation/`, { uid, token }, config);
      console.log("ACTIVATION: ", data)
  
      dispatch({ type: "USER_ACTIVATE_SUCCESS", payload: data });
  
    } catch (error) {
      dispatch({
        type: "USER_ACTIVATE_FAIL",
        payload: error.response && error.response.data.detail ? error.response.data.detail : error.message,
      });
    }
  };

  export const logout = () => (dispatch) => {
    localStorage.removeItem("userInfo"); 
    dispatch({ type: "USER_LOGOUT" }); 
  };

  export const reset_password = (email) => async (dispatch) => {
    try {
      dispatch({ type: "USER_RESET_PASSWORD_REQUEST" })
  
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      }
  
      const { data } = await axios.post(`${API_URL}/api/v1/auth/users/reset_password/`, { email }, config);
      console.log("Reset password: ", data)
      dispatch({ type: "USER_RESET_PASSWORD_SUCCESS", payload: data })
  
    } catch (error) {
      dispatch({ 
        type: "USER_RESET_PASSWORD_FAIL",
        payload: error.response && error.response.data.detail ? error.response.data.detail : error.message,
      })
    }
  }

  export const reset_password_confirm = (new_password, re_new_password, uid, token) => async (dispatch) => {
    try {
      dispatch({ type:"USER_RESET_PASSWORD_CONFIRM_REQUEST" })
  
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      }
  
      const { data } = await axios.post(`${API_URL}/api/v1/auth/users/reset_password_confirm/`, { new_password, re_new_password, uid, token }, config);
      dispatch({ type:"USER_RESET_PASSWORD_CONFIRM_SUCCESS", payload:data })
  
    } catch(error) {
      dispatch({
        type:"USER_RESET_PASSWORD_CONFIRM_FAIL",
        payload: error.response && error.response.data.detail ? error.response.data.detail : error.message,
      })
    }
  }