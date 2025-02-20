import { createContext } from "react";

const AuthContext = createContext({
  isLoggedIn: false,
  // userName: null,
  userEmail: null,
  // profilePicture: null,
  accessToken: null,
  refreshToken: null,
  successMessage: "",
  login: () => {},
  logout: () => {},
  updateSuccessMessage: () => {},
});

export { AuthContext };
