import React, { createContext, useReducer, useContext } from "react";
import jwtDecode from "jwt-decode";

const AuthDispatchContext = createContext();
const AuthStateContext = createContext();

let user = null;
const token = localStorage.getItem("token");
if (token) {
  const decodedToken = jwtDecode(token);
  const expiresAt = new Date(decodedToken.exp * 1000); // need in ms

  if (new Date() > expiresAt) {
    localStorage.removeItem("token");
  } else {
    user = {
      ...decodedToken,
      id: decodedToken.id.toString(),
    };

    console.log(user);
  }
}

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      console.log("login action");
      localStorage.setItem("token", action.payload.token);

      return { ...state, user: action.payload };

    case "LOGOUT":
      localStorage.removeItem("token");
      return { ...state, user: null };

    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, { user });

  return (
    <AuthDispatchContext.Provider value={dispatch}>
      <AuthStateContext.Provider value={state}>
        {children}
      </AuthStateContext.Provider>
    </AuthDispatchContext.Provider>
  );
};

export const useAuthState = () => useContext(AuthStateContext);
export const useAuthDispatch = () => useContext(AuthDispatchContext);
