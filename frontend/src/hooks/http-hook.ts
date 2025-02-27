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
        const response = await fetch(url, {
          method,
          body,
          headers,
          signal: httpAbortCtrl.signal,
        });

        const responseData = await response.json();

        activeHttpRequests.current = activeHttpRequests.current.filter(
          (reqCtrl) => reqCtrl !== httpAbortCtrl
        );

        setStatusCode(response.status);
        if (!response.ok) {
          throw new Error(
            responseData.message ||
              `Unknown error occurred. Status ${response.status}`
          );
        }

        setIsLoading(false);
        return responseData;
      } catch (err) {
        setServerError(err.message || "Unknown error occurred");
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
