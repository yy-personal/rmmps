import { useCallback, useState, useRef, useEffect } from "react";

// Set to true only during development
const DEBUG_MODE = process.env.NODE_ENV === 'development' && false; // Set to true to enable debugging

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
        if (DEBUG_MODE) {
          console.log(`Sending ${method} request to ${url}`);
          console.log("Request headers:", headers);
          if (body) console.log("Request body:", body);
        }

        const response = await fetch(url, {
          method,
          body,
          headers,
          signal: httpAbortCtrl.signal,
        });

        activeHttpRequests.current = activeHttpRequests.current.filter(
          (reqCtrl) => reqCtrl !== httpAbortCtrl
        );

        setStatusCode(response.status);

        const contentType = response.headers.get("content-type");

        let responseData;
        const text = await response.text();

        if (contentType && contentType.includes("application/json")) {
          try {
            if (DEBUG_MODE) console.log("Response text:", text);
            responseData = text ? JSON.parse(text) : null;
          } catch (parseErr) {
            if (DEBUG_MODE) console.error("Failed to parse JSON response:", parseErr);
            throw new Error("Invalid JSON response from server");
          }
        } else {
          if (DEBUG_MODE) console.log("Non-JSON response:", text);
          try {
            responseData = text ? JSON.parse(text) : null;
          } catch (err) {
            responseData = text || null;
          }
        }

        if (!response.ok) {
          const errorMessage = responseData?.message ||
            `Request failed with status ${response.status}`;
          if (DEBUG_MODE) console.error(`Error response:`, errorMessage);
          throw new Error(errorMessage);
        }

        if (DEBUG_MODE) console.log("Response data parsed successfully");
        setIsLoading(false);
        return responseData;
      } catch (err) {
        if (err.name === 'AbortError') {
          if (DEBUG_MODE) console.log('Request was aborted');
        } else {
          if (DEBUG_MODE) console.error(`Request error:`, err);
          setServerError(err.message || "Unknown error occurred");
        }
        setIsLoading(false);
        throw err;
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      activeHttpRequests.current.forEach((abortCtrl) => abortCtrl.abort());
    };
  }, []);

  return { isLoading, sendRequest, serverError, statusCode };
};