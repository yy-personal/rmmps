import { createContext } from "react";

// Define the shape of the authentication context
interface AuthContextType {
  isLoggedIn: boolean;
  userEmail: string;
  // userName: string;
  // profilePicture: string;
  accessToken: string;
  refreshToken: string;
  // successMessage: string;
  login: (
    email: string,
    accessToken: string,
    refreshToken: string,
    expirationDate: Date | null
  ) => void;
  logout: () => void;
  // updateSuccessMessage: (message: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  userEmail: "",
  // userName: "",
  // profilePicture: "",
  accessToken: "",
  refreshToken: "",
  // successMessage: "",
  login: () => {}, // Placeholder function
  logout: () => {},
  // updateSuccessMessage: () => {},
});

export { AuthContext };
