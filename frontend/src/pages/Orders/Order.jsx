import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Messsage from "../../components/Message";
import Loader from "../../components/Loader";
import ProductImage from "../../components/ProductImage";
import { NprPrice } from "../../components/CurrencyProvider";
import { formatNpr, useNprCurrency } from "../../components/currencyContext";
import {
  useDeliverOrderMutation,
  useGetOrderDetailsQuery,
  useSubmitEsewaQrClaimMutation,
  useApproveEsewaQrClaimMutation,
  useRejectEsewaQrClaimMutation,
  useStartKhaltiPaymentMutation,
} from "../../redux/api/orderApiSlice";

const Order = () => {
  const { id: orderId } = useParams();
  const [searchParams] = useSearchParams();
  const [transactionReference, setTransactionReference] = useState("");
  const [qrImageUnavailable, setQrImageUnavailable] = useState(false);

  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId, { pollingInterval: 10000 });

  const [submitEsewaQrClaim, { isLoading: submittingEsewaClaim }] =
    useSubmitEsewaQrClaimMutation();
  const [approveEsewaQrClaim, { isLoading: approvingEsewaClaim }] =
    useApproveEsewaQrClaimMutation();
  const [rejectEsewaQrClaim, { isLoading: rejectingEsewaClaim }] =
    useRejectEsewaQrClaimMutation();
  const [startKhaltiPayment, { isLoading: loadingKhalti }] =
    useStartKhaltiPaymentMutation();
  const [deliverOrder, { isLoading: loadingDeliver }] =
    useDeliverOrderMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const {
    rate,
    isLoading: loadingPaymentConfig,
    errorMessage: paymentConfigError,
  } = useNprCurrency();
  const paymentStatus = searchParams.get("payment");
  const amountNpr = rate ? formatNpr(order?.totalPrice, rate) : null;
  const isAdmin = Boolean(userInfo?.isAdmin);
  const claimStatus = order?.paymentClaim?.status || "not_submitted";

  useEffect(() => {
    if (paymentStatus === "success") {
      toast.success("Payment confirmed.");
      refetch();
    } else if (paymentStatus === "failed") {
      toast.error("Payment could not be verified. Please try again.");
      refetch();
    }
  }, [paymentStatus, refetch]);

  useEffect(() => {
    if (!isAdmin && claimStatus === "approved") {
      toast.success("Payment confirmed. Your order is being processed.");
    }
  }, [claimStatus, isAdmin]);

  const submitEsewaPaymentClaim = async (event) => {
    event.preventDefault();
    try {
      await submitEsewaQrClaim({ orderId, transactionReference }).unwrap();
      setTransactionReference("");
      toast.success("Payment request sent to the admin for review.");
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error.message ||
          "Could not submit the payment request."
      );
    }
  };

  const approveEsewaPaymentClaim = async () => {
    try {
      await approveEsewaQrClaim(orderId).unwrap();
      toast.success("Payment confirmed. The order is ready to process.");
    } catch (error) {
      toast.error(
        error?.data?.message || error.message || "Could not approve this payment."
      );
    }
  };

  const rejectEsewaPaymentClaim = async () => {
    try {
      await rejectEsewaQrClaim(orderId).unwrap();
      toast.info("Payment request rejected. The buyer can submit it again.");
    } catch (error) {
      toast.error(
        error?.data?.message || error.message || "Could not reject this payment."
      );
    }
  };

  const payWithKhalti = async () => {
    try {
      const { paymentUrl } = await startKhaltiPayment(orderId).unwrap();
      window.location.assign(paymentUrl);
    } catch (error) {
      toast.error(
        error?.data?.message || error.message || "Could not start Khalti payment."
      );
    }
  };

  const deliverHandler = async () => {
    await deliverOrder(orderId);
    refetch();
  };

  return isLoading ? (
    <Loader />
  ) : error ? (
    <Messsage variant="danger">{error.data.message}</Messsage>
  ) : (
    <div className="container flex flex-col md:flex-row lg:ml-60">
      <div className="md:w-2/3 pr-4">
        <div className="border gray-300 mt-5 pb-4 mb-5">
          {order.orderItems.length === 0 ? (
            <Messsage>Order is empty</Messsage>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-[80%]">
                <thead className="border-b-2">
                  <tr>
                    <th className="p-2">Image</th>
                    <th className="p-2">Product</th>
                    <th className="p-2 text-center">Quantity</th>
                    <th className="p-2">Unit Price</th>
                    <th className="p-2">Total</th>
                  </tr>
                </thead>

                <tbody>
                  {order.orderItems.map((item, index) => (
                    <tr key={index}>
                      <td className="p-2">
                        <ProductImage
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover"
                        />
                      </td>

                      <td className="p-2">
                        <Link to={`/product/${item.product}`}>{item.name}</Link>
                      </td>

                      <td className="p-2 text-center">{item.qty}</td>
                      <td className="p-2 text-center">
                        <NprPrice amount={item.price} />
                      </td>
                      <td className="p-2 text-center">
                        <NprPrice amount={item.qty * item.price} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="md:w-1/3">
        <div className="mt-5 border-gray-300 pb-4 mb-4">
          <h2 className="text-xl font-bold mb-2">Shipping</h2>
          <p className="mb-4 mt-4">
            <strong className="text-pink-500">Order:</strong> {order._id}
          </p>

          <p className="mb-4">
            <strong className="text-pink-500">Name:</strong>{" "}
            {order.user.username}
          </p>

          <p className="mb-4">
            <strong className="text-pink-500">Email:</strong> {order.user.email}
          </p>

          <p className="mb-4">
            <strong className="text-pink-500">Address:</strong>{" "}
            {order.shippingAddress.address}, {order.shippingAddress.city}{" "}
            {order.shippingAddress.postalCode}, {order.shippingAddress.country}
          </p>

          <p className="mb-4">
            <strong className="text-pink-500">Method:</strong>{" "}
            {order.paymentMethod}
          </p>

          {order.isPaid ? (
            <p
              className="rounded-lg bg-green-100 p-3 text-sm text-green-800"
              aria-live="polite"
            >
              {claimStatus === "approved"
                ? "Payment approved. Your order is processed."
                : `Paid on ${order.paidAt}`}
            </p>
          ) : order.paymentMethod === "eSewa" &&
            claimStatus === "pending_review" ? (
            <p
              className="rounded-lg bg-amber-100 p-3 text-sm text-amber-900"
              aria-live="polite"
            >
              eSewa payment submitted. Waiting for admin review.
            </p>
          ) : order.paymentMethod === "eSewa" && claimStatus === "rejected" ? (
            <p className="rounded-lg bg-red-100 p-3 text-sm text-red-800">
              Payment request was not approved. Check your transfer details and
              submit it again.
            </p>
          ) : (
            <Messsage variant="danger">Not paid</Messsage>
          )}
        </div>

        <h2 className="text-xl font-bold mb-2 mt-[3rem]">Order Summary</h2>
        <div className="flex justify-between mb-2">
          <span>Items</span>
          <NprPrice amount={order.itemsPrice} />
        </div>
        <div className="flex justify-between mb-2">
          <span>Shipping</span>
          <NprPrice amount={order.shippingPrice} />
        </div>
        <div className="flex justify-between mb-2">
          <span>Tax</span>
          <NprPrice amount={order.taxPrice} />
        </div>
        <div className="flex justify-between mb-2">
          <span>Total</span>
          <NprPrice amount={order.totalPrice} />
        </div>

        {!order.isPaid && (
          <div className="mt-5">
            {loadingPaymentConfig ? (
              <Loader />
            ) : !rate ? (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {paymentConfigError}
              </p>
            ) : order.paymentMethod === "eSewa" ? (
              <section className="rounded-2xl border border-[#eadfd4] bg-white p-5">
                <h3 className="mb-2 text-lg font-semibold">
                  Pay with eSewa QR
                </h3>
                <p className="mb-4 text-sm text-[#62564d]">
                  Scan the QR code and pay{" "}
                  <strong>
                    NPR{" "}
                    {claimStatus === "pending_review" &&
                    order.paymentClaim?.amountNpr
                      ? formatNpr(order.paymentClaim.amountNpr, 1)
                      : amountNpr}
                  </strong>
                  . After paying, submit the request for admin review.
                </p>
                {qrImageUnavailable ? (
                  <div className="mb-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                    Add your eSewa QR image at{" "}
                    <code>frontend/public/esewa-qr.jpg</code>.
                  </div>
                ) : (
                  <img
                    src="/esewa-qr.jpg"
                    alt="eSewa payment QR code"
                    className="mb-4 mx-auto max-h-72 w-auto rounded-lg border border-[#eadfd4] object-contain"
                    onError={() => setQrImageUnavailable(true)}
                  />
                )}

                {claimStatus === "pending_review" ? (
                  <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                    Your payment request is waiting for the admin to check it.
                    This page will update when it is reviewed.
                  </p>
                ) : !isAdmin ? (
                  <form onSubmit={submitEsewaPaymentClaim} className="space-y-3">
                    <label
                      htmlFor="esewa-transaction-reference"
                      className="block text-sm font-medium"
                    >
                      eSewa transaction reference (optional)
                    </label>
                    <input
                      id="esewa-transaction-reference"
                      type="text"
                      maxLength={100}
                      value={transactionReference}
                      onChange={(event) =>
                        setTransactionReference(event.target.value)
                      }
                      className="w-full rounded-lg border border-[#d9cfc5] px-3 py-2"
                      placeholder="Reference from your eSewa receipt"
                    />
                    <button
                      type="submit"
                      disabled={submittingEsewaClaim}
                      className="w-full rounded-xl bg-[#60bb46] px-4 py-3 font-semibold text-white transition hover:bg-[#4ea637] disabled:opacity-50"
                    >
                      {submittingEsewaClaim
                        ? "Submitting..."
                        : "I have paid — submit for review"}
                    </button>
                  </form>
                ) : (
                  <p className="text-sm text-[#62564d]">
                    The buyer has not submitted a payment request yet.
                  </p>
                )}
              </section>
            ) : (
              <div>
                <p className="mb-3 text-sm text-[#62564d]">
                  Amount to pay:{" "}
                  <strong>NPR {amountNpr}</strong>
                </p>
                {order.paymentMethod === "Khalti" ? (
                  <button
                    type="button"
                    disabled={loadingKhalti}
                    className="w-full rounded-xl bg-[#5c2d91] px-4 py-3 font-semibold text-white transition hover:bg-[#4b2478] disabled:opacity-50"
                    onClick={payWithKhalti}
                  >
                    {loadingKhalti ? "Connecting to Khalti..." : "Pay with Khalti"}
                  </button>
                ) : (
                  <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                    This order uses an unsupported payment method.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {isAdmin &&
          order.paymentMethod === "eSewa" &&
          claimStatus === "pending_review" && (
            <section className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-5">
              <h3 className="mb-3 text-lg font-semibold">
                eSewa payment request
              </h3>
              <p className="mb-2 text-sm">
                Amount: NPR {formatNpr(order.paymentClaim.amountNpr, 1)}
              </p>
              <p className="mb-4 break-all text-sm">
                Transaction reference:{" "}
                {order.paymentClaim.transactionReference || "Not provided"}
              </p>
              <p className="mb-4 text-sm text-[#62564d]">
                Check your eSewa account before confirming the payment.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  disabled={approvingEsewaClaim || rejectingEsewaClaim}
                  onClick={rejectEsewaPaymentClaim}
                  className="w-full rounded-xl border border-red-300 px-4 py-3 font-semibold text-red-700 disabled:opacity-50"
                >
                  {rejectingEsewaClaim ? "Rejecting..." : "Reject request"}
                </button>
                <button
                  type="button"
                  disabled={approvingEsewaClaim || rejectingEsewaClaim}
                  onClick={approveEsewaPaymentClaim}
                  className="w-full rounded-xl bg-green-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
                >
                  {approvingEsewaClaim
                    ? "Confirming..."
                    : "Confirm payment received"}
                </button>
              </div>
            </section>
          )}

        {loadingDeliver && <Loader />}
        {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
          <div>
            <button
              type="button"
              className="bg-pink-500 text-white w-full py-2"
              onClick={deliverHandler}
            >
              Mark As Delivered
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Order;
