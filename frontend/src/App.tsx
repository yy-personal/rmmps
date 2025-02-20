import "./App.css";
import Box from "@mui/material/Box";
import Header from "components/Header/Header";
import { Outlet } from "react-router-dom";

import { AuthContext } from "./components/contexts/auth-context";
import { useCallback, useState } from "react";
import { useHttpClient } from "hooks/http-hook";

const userDataIdentifier = "rmmps-userData";
const defaultTokenExpiry = 1000 * 890; // 15 minutes - 10 seconds buffer
let refreshTimer;

function App() {
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
      expirationDate: Date
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

      const responseData = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/auth/logout`,
        "POST",
        null,
        {
          Authorization: `Bearer ${accessToken}`,
        }
      );

      /* Update states and local storage */
      setAccessToken("");
      setRefreshToken("");
      setUserEmail("");
      // setUserName("");
      setAccessTokenExpiry(undefined);
      localStorage.removeItem(userDataIdentifier);
      window.location.reload();
    } catch (err) {
      console.log(serverError);
    }
  }, [accessToken, sendRequest]);

  const authRefresh = useCallback(
    async (_refreshToken: string) => {
      // let responseData;

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

        // const responseData = await response.json();

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
          // CHECKPOINT
        }
        logout();
        console.log(serverError);
      }
    },
    [sendRequest, logout]
  );

  return (
    <Box className="App">
      <Header />
      <Box sx={{ backgroundColor: "#FBFBFB", minHeight: "calc(100vh - 70px)" }}>
        <Outlet />
      </Box>
    </Box>
  );
}

export default App;
