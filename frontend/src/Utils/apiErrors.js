const BACKEND_CONNECTION_MESSAGE =
  "Could not reach the backend. Start both services with npm run dev from the project folder, then try again.";

export const getApiErrorMessage = (apiError, fallback) => {
  const responseText =
    typeof apiError?.data === "string" ? apiError.data : "";
  const backendUnavailable =
    apiError?.status === "FETCH_ERROR" ||
    (apiError?.status === 500 &&
      (apiError.data == null ||
        /proxy error|econnrefused|failed to fetch/i.test(responseText)));

  if (backendUnavailable) return BACKEND_CONNECTION_MESSAGE;

  return (
    apiError?.data?.message ||
    apiError?.data?.error ||
    responseText ||
    apiError?.error ||
    fallback
  );
};
