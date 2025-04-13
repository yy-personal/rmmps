import { useCallback, useState, useRef, useEffect } from "react";

export const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [statusCode, setStatusCode] = useState<Number>();
  const activeHttpRequests = useRef<AbortController[]>([]);

  const sendRequest = useCallback(
    async (
      url: string,
      method = "GET",
      body: BodyInit | null | undefined = null,
      headers: HeadersInit | undefined = {}
    ) => {
      setIsLoading(true);
      setStatusCode(undefined);
      setServerError("");
      const httpAbortCtrl = new AbortController();
      activeHttpRequests.current.push(httpAbortCtrl);

      try {
        console.log(`Sending ${method} request to ${url}`);
        console.log("Request headers:", headers);
        if (body) console.log("Request body:", body);

        const response = await fetch(url, {
          method,
          body,
          headers,
          signal: httpAbortCtrl.signal,
        });

        // Remove current abort controller from active list
        activeHttpRequests.current = activeHttpRequests.current.filter(
          (reqCtrl) => reqCtrl !== httpAbortCtrl
        );

        console.log(`Response status: ${response.status}`);
        setStatusCode(response.status);

        // For debugging, log all headers
        console.log("Response headers:");
        response.headers.forEach((value, key) => {
          console.log(`${key}: ${value}`);
        });

        let responseData;

        // Check content-type header
        const contentType = response.headers.get("content-type");
        console.log(`Content-Type: ${contentType}`);

        // Try to parse response appropriately
        if (contentType && contentType.includes("application/json")) {
          try {
            const text = await response.text();
            console.log("Response text:", text);
            responseData = text ? JSON.parse(text) : null;
          } catch (parseErr) {
            console.error("Failed to parse JSON response:", parseErr);
            throw new Error("Invalid JSON response from server");
          }
        } else {
          // Handle non-JSON responses
          const text = await response.text();
          console.log("Non-JSON response:", text);
          try {
            // Try to parse as JSON anyway in case Content-Type is wrong
            responseData = text ? JSON.parse(text) : null;
          } catch (err) {
            // If it's not JSON, just use the text
            responseData = text || null;
          }
        }

        if (!response.ok) {
          const errorMessage = responseData?.message ||
            `Request failed with status ${response.status}`;
          console.error(`Error response:`, errorMessage);
          throw new Error(errorMessage);
        }

        console.log("Parsed response data:", responseData);
        setIsLoading(false);
        return responseData;
      } catch (err) {
        // Check if the error is due to an aborted request
        if (err.name === 'AbortError') {
          console.log('Request was aborted');
          // Don't set error state for aborted requests
        } else {
          console.error(`Request error:`, err);
          setServerError(err.message || "Unknown error occurred");
        }
        setIsLoading(false);
        throw err;
      }
    },
    []
  );

  // Cleanup function to abort any in-progress requests when component unmounts
  useEffect(() => {
    return () => {
      activeHttpRequests.current.forEach((abortCtrl) => abortCtrl.abort());
    };
  }, []);

  return { isLoading, sendRequest, serverError, statusCode };
};