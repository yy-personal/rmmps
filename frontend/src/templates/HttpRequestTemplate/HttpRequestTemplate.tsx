import Box from "@mui/material/Box";
import { useEffect, useState } from "react";

// remember to import the custom hook
import { useHttpClient } from "hooks/http-hook";

interface DummyDataType {
  name: string;
  age: number;
  isMarried: boolean;
}

function HttpRequestTemplate() {
  const { isLoading, sendRequest, serverError, statusCode } = useHttpClient();
  const [dummyData, setDummyData] = useState<DummyDataType>();

  useEffect(() => {
    const fetchDummyData = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/dummy-route`
        );

        setDummyData(responseData);
      } catch (err) {
        console.log(
          serverError ||
            err.message ||
            `Unknown error occurred. Status Code: ${statusCode}`
        );
      }
    };
    fetchDummyData();
  }, [setDummyData, sendRequest, serverError, statusCode]);

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
