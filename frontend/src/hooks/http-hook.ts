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

        let responseData;

        // Try to parse response as JSON if it's not empty
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const text = await response.text();
          if (text) {
            responseData = JSON.parse(text);
          }
        } else {
          try {
            responseData = await response.json();
          } catch (err) {
            // If response is not JSON, handle accordingly
            console.log("Response is not JSON or is empty");
          }
        }

        setStatusCode(response.status);
        if (!response.ok) {
          const errorMessage = responseData?.message ||
            `Request failed with status ${response.status}`;
          console.error(`Error response:`, errorMessage);
          throw new Error(errorMessage);
        }

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