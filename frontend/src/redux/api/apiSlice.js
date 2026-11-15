import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../constants";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
  responseHandler: async (response) => {
    const body = await response.text();
    if (!body) return null;
    if (response.headers.get("content-type")?.includes("application/json")) {
      return JSON.parse(body);
    }
    return body;
  },
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ["Product", "Products", "Order", "User", "Category"],
  endpoints: () => ({}),
});
