import * as React from "react";
import { Navigate, useNavigate } from "react-router-dom";

import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid2 from "@mui/material/Grid2";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";

import { AuthContext } from "../../contexts/auth-context";
import { useHttpClient } from "../../hooks/http-hook";

interface LoginProps {
  isLogin: boolean;
}

export default function Login(props: LoginProps) {
  const navigate = useNavigate();
  const { sendRequest, statusCode, serverError } = useHttpClient();
  const { isLogin } = props;
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
        `${process.env.REACT_APP_BACKEND_URL}/auth/${
          isLogin ? "login" : "register"
        }`,
        "POST",
        JSON.stringify({
          email: loginFormState.email,
          passwordHash: loginFormState.password,
        }),
        {
          "Content-Type": "application/json",
        }
      );

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
        display: "flex",
        alignItems: "center",
      }}
    >
      <Card>
        <Stack alignItems="center" py={6} px={4} display={"flex"}>
          <Typography
            component="h1"
            variant="h5"
            sx={{
              color: "#EB5A3C",
              fontWeight: "bold",
            }}
          >
            {isLogin ? "Welcome back!" : "Join our community!"}
          </Typography>

          <Typography component="p">
            {isLogin
              ? "The community has missed you!"
              : "We can't wait for your contributions!"}
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
              error={!!serverError}
              helperText={
                statusCode === 401
                  ? "Invalid username or password"
                  : serverError
              }
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
              {isLogin ? "Sign In" : "Register"}
            </Button>
            <Grid2 container>
              {/* <Grid2 item xs> */}
              <Container>
                <Link
                  href="/forgot-password"
                  style={{ textDecoration: "none", color: "#EB5B00" }}
                >
                  Forgot password?
                </Link>
              </Container>
              {/* <Grid2 item> */}
              <Container>
                <Link
                  href={isLogin ? "/register" : "/login"}
                  style={{ textDecoration: "none", color: "#EB5B00" }}
                >
                  {isLogin
                    ? "Don't have an account? Sign Up"
                    : "Already have an account? Sign In"}
                </Link>
              </Container>
            </Grid2>
          </Box>
        </Stack>
      </Card>
    </Container>
  );
}
