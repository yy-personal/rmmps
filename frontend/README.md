# RMMPS - Frontend service

The frontend service for RMMPS.

## Running the app locally

### Pre-requisites

- Node: Install at https://nodejs.org/en/download

### Configuration

Configure the backend connection in `.env`:

```.env
REACT_APP_BACKEND_URL=http://localhost:8080/api
REACT_APP_ASSET_URL=http://localhost:8080
```

### Running Locally

```bash
# From the root folder of the project, navigate to the frontend folder
cd frontend

# Install all necessary packages with npm
npm i

# Run the frontend at localhost:3000
npm start
```

## Styling

In this project, [MaterialUI](https://mui.com/) is chosen for styling.

## Development Guide

### Making HTTP Requests

For convenience, the custom React hook 'useHttpClient' is defined in hooks/http-hook.ts. You may refer to the following example on how to use the hook.

```tsx
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";

// Remember to import the custom hook
import { useHttpClient } from "hooks/http-hook";

interface DummyDataType {
  name: string;
  age: number;
  isMarried: boolean;
}

function HttpRequestTemplate() {
  // Only sendRequest is required to send requests, the other 3 are optional
  const { isLoading, sendRequest, serverError, statusCode } = useHttpClient();
  const [dummyData, setDummyData] = useState<DummyDataType>();

  useEffect(() => {
    // Recommended to use async-await paradigm. First, wrap the sendRequest call in an async function.
    const createDummyData = async () => {
      try {
        // Send the request by providing the URL, request type, request body, and headers
        // Only the URL is required, the other 3 are optional
        // Make sure to wrap the request within a try block
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/dummy-route`,
          "POST",
          JSON.stringify({
            name: "dummy name",
            age: 25,
            isMarried: true,
          }),
          {
            "Content-Type": "application/json",
          }
        );

        setDummyData(responseData);
      } catch (err) {
        // In case of an error, you may use serverError and/or statusCode for logging or displaying to users
        console.log(
          serverError ||
            err.message ||
            `Unknown error occurred. Status Code: ${statusCode}`
        );
      }
    };
    createDummyData();
  }, [setDummyData, sendRequest]);

  // Do something while the HTTP request is being handled
  if (isLoading) {
    return <Box>Loading data. Please hold on...</Box>;
  }

  // Handle the case where the data couln't be loaded
  if (dummyData === undefined) {
    return <Box>No data found. Please try again later...</Box>;
  }

  return (
    <Box>{`Name: ${dummyData.name}, Age: ${dummyData.age}, Married: ${
      dummyData.isMarried ? "Yes" : "No"
    }`}</Box>
  );
}

export default HttpRequestTemplate;
```

### Responsiveness (MaterialUI Version)

Ensuring a responsive design is crucial for a seamless user experience across different screen sizes. Material UI provides built-in breakpoints, the _sx_ prop, and the _useMediaQuery_ hook to make components adapt dynamically.

#### Using the sx Prop with Breakpoints

Material UI allows you to specify styles for different screen sizes using its breakpoints system _(xs, sm, md, lg, xl)_.

**Example: Responsive Grid Layout**

```tsx
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

const ResponsiveComponent = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" }, // Stack on small screens, row on medium+
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        p: 3,
      }}
    >
      <Typography
        variant="h4"
        sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }} // Adjust font size for screens
      >
        Responsive Design
      </Typography>
      <Button
        variant="contained"
        sx={{ width: { xs: "100%", sm: "auto" } }} // Full width on small screens
      >
        Click Me
      </Button>
    </Box>
  );
};

export default ResponsiveComponent;
```
