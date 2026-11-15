import { apiSlice } from "./apiSlice";
import { ORDERS_URL, PAYMENT_CONFIG_URL } from "../constants";

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (order) => ({
        url: ORDERS_URL,
        method: "POST",
        body: order,
      }),
      invalidatesTags: ["Order"],
    }),

    getOrderDetails: builder.query({
      query: (id) => ({
        url: `${ORDERS_URL}/${id}`,
      }),
      providesTags: ["Order"],
    }),

    startEsewaPayment: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/payments/esewa`,
        method: "POST",
      }),
    }),

    submitEsewaQrClaim: builder.mutation({
      query: ({ orderId, transactionReference }) => ({
        url: `${ORDERS_URL}/${orderId}/payments/esewa/claim`,
        method: "POST",
        body: { transactionReference },
      }),
      invalidatesTags: ["Order"],
    }),

    approveEsewaQrClaim: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/payments/esewa/approve`,
        method: "PUT",
      }),
      invalidatesTags: ["Order"],
    }),

    rejectEsewaQrClaim: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/payments/esewa/reject`,
        method: "PUT",
      }),
      invalidatesTags: ["Order"],
    }),

    startKhaltiPayment: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/payments/khalti`,
        method: "POST",
      }),
    }),

    getPaymentConfig: builder.query({
      query: () => PAYMENT_CONFIG_URL,
    }),

    getMyOrders: builder.query({
      query: () => ({
        url: `${ORDERS_URL}/mine`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Order"],
    }),

    getOrders: builder.query({
      query: () => ({
        url: ORDERS_URL,
      }),
      providesTags: ["Order"],
    }),

    deliverOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/deliver`,
        method: "PUT",
      }),
    }),

    getTotalOrders: builder.query({
      query: () => `${ORDERS_URL}/total-orders`,
    }),

    getTotalSales: builder.query({
      query: () => `${ORDERS_URL}/total-sales`,
    }),

    getTotalSalesByDate: builder.query({
      query: () => `${ORDERS_URL}/total-sales-by-date`,
    }),
  }),
});

export const {
  useGetTotalOrdersQuery,
  useGetTotalSalesQuery,
  useGetTotalSalesByDateQuery,
  // ------------------
  useCreateOrderMutation,
  useGetOrderDetailsQuery,
  useStartEsewaPaymentMutation,
  useSubmitEsewaQrClaimMutation,
  useApproveEsewaQrClaimMutation,
  useRejectEsewaQrClaimMutation,
  useStartKhaltiPaymentMutation,
  useGetPaymentConfigQuery,
  useGetMyOrdersQuery,
  useDeliverOrderMutation,
  useGetOrdersQuery,
} = orderApiSlice;
