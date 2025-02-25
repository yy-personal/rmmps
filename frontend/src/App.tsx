import "./App.css";
import Box from "@mui/material/Box";
import Header from "components/Header/Header";
import { Outlet, useNavigate } from "react-router-dom";

import { AuthContext } from "./contexts/auth-context";
import { useCallback, useEffect, useState } from "react";
import { useHttpClient } from "hooks/http-hook";

const userDataIdentifier = "rmmps-userData";
const defaultTokenExpiry = 1000 * 890; // 15 minutes - 10 seconds buffer
let refreshTimer: NodeJS.Timeout;

function App() {
  const navigate = useNavigate();
  const { sendRequest, serverError, statusCode } = useHttpClient();
  /* Auth-related states */
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [accessTokenExpiry, setAccessTokenExpiry] = useState<
    Date | undefined
  >();
  const [userEmail, setUserEmail] = useState("");
  // const [userName, setUserName] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(
    (
      // _userName: string,
      _userEmail: string,
      _accessToken: string,
      _refreshToken: string,
      expirationDate: Date | null
    ) => {
      // setUserName(_userName);
      setAccessToken(_accessToken);
      setRefreshToken(_refreshToken);
      setUserEmail(_userEmail);

      // 15 min access token expiry unless stated by BE
      const tokenExpirationDate =
        expirationDate || new Date(new Date().getTime() + defaultTokenExpiry);

      setAccessTokenExpiry(tokenExpirationDate);

      const userDataObject = {
        // userName: _userName,
        userEmail: _userEmail,
        accessToken: _accessToken,
        refreshToken: _refreshToken,
        expiration: tokenExpirationDate.toISOString(),
      };

      localStorage.setItem(userDataIdentifier, JSON.stringify(userDataObject));
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      if (!accessToken) {
        throw new Error("User is not logged in!");
      }

      /* Update states and local storage */
      setAccessToken("");
      setRefreshToken("");
      setUserEmail("");
      // setUserName("");
      setAccessTokenExpiry(undefined);
      localStorage.removeItem(userDataIdentifier);
      navigate("/");
    } catch (err) {
      console.log(err.message || "unknown error");
    }
  }, [accessToken, navigate]);

  const authRefresh = useCallback(
    async (_refreshToken: string) => {
      // alert("refreshing token"); // TODO: remove after sufficient test
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/auth/refresh`,
          "POST",
          null,
          {
            Authorization: `Bearer ${_refreshToken}`,
          }
        );

        setAccessToken(responseData["accessToken"]);

        // 15 min access token expiry unless stated by BE
        const tokenExpirationDate = new Date(
          new Date().getTime() + defaultTokenExpiry
        );

        setAccessTokenExpiry(tokenExpirationDate);

        /* Update local storage */
        const storedUserData = JSON.parse(
          localStorage.getItem(userDataIdentifier) || ""
        );

        const updatedUserData = {
          ...storedUserData,
          accessToken: responseData["accessToken"],
          expiration: tokenExpirationDate.toISOString(),
        };
        // setUserName(updatedUserData["userName"]);
        setUserEmail(updatedUserData["userEmail"]);
        setRefreshToken(updatedUserData["refreshToken"]);
        localStorage.setItem(
          userDataIdentifier,
          JSON.stringify(updatedUserData)
        );
      } catch (err) {
        if (statusCode === 401) {
          console.log("Session expired");
          logout();
        }
        console.log(serverError);
      }
    },
    [sendRequest, logout, serverError, statusCode]
  );

  useEffect(() => {
    if (accessTokenExpiry && refreshToken) {
      const remainingTime = accessTokenExpiry.getTime() - new Date().getTime();

      refreshTimer = setTimeout(() => {
        authRefresh(refreshToken);
      }, remainingTime);
    } else {
      clearTimeout(refreshTimer);
    }
  }, [accessTokenExpiry, refreshToken, authRefresh]);

  // auto-login
  useEffect(() => {
    setLoading(true);
    let storedUserData;

    try {
      storedUserData = JSON.parse(
        localStorage.getItem(userDataIdentifier) || ""
      );
    } catch (err) {
      console.log(err.message);
      return;
    }

    if (storedUserData && storedUserData.accessToken) {
      const tokenExpiry = new Date(storedUserData.expiration);

      if (tokenExpiry < new Date()) {
        // access token expired
        authRefresh(storedUserData.refreshToken);
      } else {
        login(
          // storedUserData.userName,
          storedUserData.userEmail,
          storedUserData.accessToken,
          storedUserData.refreshToken,
          new Date(storedUserData.expiration)
        );
      }
    }
    setLoading(false);
  }, [login, authRefresh]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!accessToken,
        accessToken: accessToken,
        refreshToken: refreshToken,
        userEmail: userEmail,
        login: login,
        logout: logout,
      }}
    >
      <Box className="App">
        <Header />
        <Box
          sx={{ backgroundColor: "#FBFBFB", minHeight: "calc(100vh - 70px)" }}
        >
          <Outlet />
        </Box>
      </Box>
    </AuthContext.Provider>
  );
}

export default App;
