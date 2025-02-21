import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Stack,
  Button,
  Card,
  Container,
  Typography,
  Box,
  Grid2,
  Checkbox,
  FormControlLabel,
  TextField,
} from "@mui/material";
import { Navigate, Link } from "react-router-dom";

import { AuthContext } from "../../contexts/auth-context";
import { useHttpClient } from "../../hooks/http-hook";

export default function Login() {
  const navigate = useNavigate();
  const { sendRequest, statusCode, serverError } = useHttpClient();
  const auth = React.useContext(AuthContext);
  const [loginFormState, setLoginFormState] = React.useState({
    email: "",
    password: "",
  });

  // Redirect if already logged in.
  if (auth.isLoggedIn) {
    return <Navigate to={"/"} replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginFormState({
      ...loginFormState,
      [name]: value,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const responseData = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/auth/login`,
        "POST",
        JSON.stringify({
          email: loginFormState.email,
          passwordHash: loginFormState.password,
        }),
        {
          "Content-Type": "application/json",
        }
      );

      // const responseData = await response.json();

      // if (!response.ok) {
      //   throw new Error(responseData.message || "unknown");
      // }

      console.log(`act: ${responseData.accessToken}`);

      auth.login(
        loginFormState.email,
        responseData.accessToken,
        responseData.refreshToken,
        null
      );
      navigate("/");
    } catch (err) {
      console.log(`Status code: ${statusCode}`);
      console.log(serverError);
    }
  };

  return (
    <Container
      component="main"
      maxWidth="sm"
      sx={{
        height: "calc(100vh - 70px)",
        // border: "1px solid grey",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Card>
        <Stack
          alignItems="center"
          py={6}
          px={4}
          display={"flex"}
          sx={
            {
              // border: "2px solid red",
            }
          }
        >
          <Typography
            component="h1"
            variant="h5"
            sx={{
              color: "#EB5A3C",
              fontWeight: "bold",
            }}
          >
            Welcome back!
          </Typography>

          <Typography component="p">
            Ready for another productive session? Let's dive in.
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={loginFormState.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={loginFormState.password}
              onChange={handleChange}
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: "#EB5B00",
                ":hover": { backgroundColor: "#C14600" },
              }}
            >
              Sign In
            </Button>
            <Grid2 container>
              {/* <Grid2 item xs> */}
              <Container>
                <Link
                  to="/forgot-password"
                  style={{ textDecoration: "none", color: "#EB5B00" }}
                >
                  Forgot password?
                </Link>
              </Container>
              {/* <Grid2 item> */}
              <Container>
                <Link
                  to="/register"
                  style={{ textDecoration: "none", color: "#EB5B00" }}
                >
                  Don't have an account? Sign Up
                </Link>
              </Container>
            </Grid2>
          </Box>
        </Stack>
      </Card>
    </Container>
  );
}
