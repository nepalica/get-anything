import mongoose from "mongoose";
import { randomUUID } from "crypto";
import Order from "../models/orderModel.js";
import {
  amountsMatch,
  createEsewaSignature,
  getBackendUrl,
  getFrontendUrl,
  getUsdToNprRate,
  parseGatewayAmount,
  usdToNpr,
  verifyEsewaSignature,
} from "../utils/paymentUtils.js";

const ESEWA_FORM_URL = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const ESEWA_STATUS_URL = "https://rc.esewa.com.np/api/epay/transaction/status/";
const KHALTI_API_URL = "https://dev.khalti.com/api/v2";

const makeError = (statusCode, message) =>
  Object.assign(new Error(message), { statusCode });

const paymentFailureUrl = (orderId) =>
  orderId
    ? `${getFrontendUrl()}/order/${encodeURIComponent(orderId)}?payment=failed`
    : `${getFrontendUrl()}/?payment=failed`;

const paymentSuccessUrl = (orderId) =>
  `${getFrontendUrl()}/order/${encodeURIComponent(orderId)}?payment=success`;

const sendPaymentError = (res, error, fallbackMessage) => {
  const statusCode = error.statusCode || 500;
  if (statusCode === 500) {
    console.error(fallbackMessage, error);
  }
  return res.status(statusCode).json({
    message: statusCode === 500 ? fallbackMessage : error.message,
  });
};

const getOrderForPayment = async (req, orderId, provider) => {
  if (!mongoose.isValidObjectId(orderId)) {
    throw makeError(400, "Invalid order.");
  }

  const order = await Order.findById(orderId);
  if (!order) throw makeError(404, "Order not found.");
  if (order.user.toString() !== req.user._id.toString()) {
    throw makeError(403, "You cannot pay for this order.");
  }
  if (order.isPaid) throw makeError(409, "This order has already been paid.");
  if (order.paymentMethod !== provider) {
    throw makeError(400, `This order is not set to pay with ${provider}.`);
  }
  return order;
};

const recordVerifiedPayment = async (order, result) => {
  order.isPaid = true;
  order.paidAt = new Date();
  order.paymentResult = {
    ...order.paymentResult,
    ...result,
    status: "Completed",
  };
  await order.save();
};

export const getPaymentConfig = (_req, res) => {
  try {
    res.json({ usdToNprRate: getUsdToNprRate() });
  } catch (error) {
    res.status(503).json({ message: error.message });
  }
};

export const startEsewaPayment = async (req, res) => {
  const secret = process.env.ESEWA_SECRET_KEY;
  const productCode = process.env.ESEWA_PRODUCT_CODE;
  if (!secret || !productCode) {
    return res.status(503).json({
      message: "Set ESEWA_SECRET_KEY and ESEWA_PRODUCT_CODE in the project-root .env.",
    });
  }

  try {
    const order = await getOrderForPayment(req, req.params.id, "eSewa");
    const amountNpr = usdToNpr(order.totalPrice);
    const transactionUuid = randomUUID();
    const signedFieldNames = "total_amount,transaction_uuid,product_code";
    const signedFields = {
      total_amount: amountNpr.toFixed(2),
      transaction_uuid: transactionUuid,
      product_code: productCode,
    };

    order.paymentResult = {
      provider: "eSewa",
      id: transactionUuid,
      status: "Initiated",
      amountNpr,
    };
    await order.save();

    return res.json({
      actionUrl: ESEWA_FORM_URL,
      formData: {
        amount: amountNpr.toFixed(2),
        tax_amount: "0",
        total_amount: signedFields.total_amount,
        transaction_uuid: transactionUuid,
        product_code: productCode,
        product_service_charge: "0",
        product_delivery_charge: "0",
        success_url: `${getBackendUrl()}/api/orders/payment/esewa/return`,
        failure_url: paymentFailureUrl(order._id),
        signed_field_names: signedFieldNames,
        signature: createEsewaSignature(signedFields, signedFieldNames, secret),
      },
    });
  } catch (error) {
    return sendPaymentError(res, error, "Could not start eSewa payment.");
  }
};

export const submitEsewaQrClaim = async (req, res) => {
  try {
    const order = await getOrderForPayment(req, req.params.id, "eSewa");
    const reference = req.body?.transactionReference;
    if (reference !== undefined && typeof reference !== "string") {
      throw makeError(400, "The eSewa reference must be text.");
    }

    const transactionReference = (reference || "").trim();
    if (transactionReference.length > 100) {
      throw makeError(400, "The eSewa reference must be 100 characters or fewer.");
    }

    let amountNpr;
    try {
      amountNpr = usdToNpr(order.totalPrice);
    } catch (error) {
      throw makeError(503, error.message);
    }

    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        user: req.user._id,
        isPaid: false,
        paymentMethod: "eSewa",
        "paymentClaim.status": { $ne: "pending_review" },
      },
      {
        $set: {
          "paymentClaim.status": "pending_review",
          "paymentClaim.transactionReference": transactionReference,
          "paymentClaim.amountNpr": amountNpr,
          "paymentClaim.submittedAt": new Date(),
          "paymentClaim.reviewedAt": null,
          "paymentClaim.reviewedBy": null,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      throw makeError(409, "This payment request is already being reviewed.");
    }

    return res.json(updatedOrder);
  } catch (error) {
    return sendPaymentError(res, error, "Could not submit the eSewa payment request.");
  }
};

const getOrderForEsewaReview = async (orderId) => {
  if (!mongoose.isValidObjectId(orderId)) {
    throw makeError(400, "Invalid order.");
  }

  const order = await Order.findById(orderId);
  if (!order) throw makeError(404, "Order not found.");
  if (order.paymentMethod !== "eSewa") {
    throw makeError(400, "This order is not set to pay with eSewa.");
  }
  if (order.isPaid || order.paymentClaim?.status !== "pending_review") {
    throw makeError(409, "This order has no eSewa payment request to review.");
  }

  return order;
};

export const approveEsewaQrClaim = async (req, res) => {
  try {
    const order = await getOrderForEsewaReview(req.params.id);
    let amountNpr = order.paymentClaim.amountNpr;
    if (!Number.isFinite(amountNpr)) {
      try {
        amountNpr = usdToNpr(order.totalPrice);
      } catch (error) {
        throw makeError(503, error.message);
      }
    }

    const now = new Date();
    const paymentResult = {
      provider: "eSewa",
      status: "Completed",
      amountNpr,
    };
    if (order.paymentClaim.transactionReference) {
      paymentResult.transactionId = order.paymentClaim.transactionReference;
    }

    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        isPaid: false,
        paymentMethod: "eSewa",
        "paymentClaim.status": "pending_review",
      },
      {
        $set: {
          isPaid: true,
          paidAt: now,
          "paymentClaim.status": "approved",
          "paymentClaim.reviewedAt": now,
          "paymentClaim.reviewedBy": req.user._id,
          paymentResult,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      throw makeError(409, "This eSewa payment request has already been reviewed.");
    }

    return res.json(updatedOrder);
  } catch (error) {
    return sendPaymentError(res, error, "Could not approve the eSewa payment request.");
  }
};

export const rejectEsewaQrClaim = async (req, res) => {
  try {
    const order = await getOrderForEsewaReview(req.params.id);
    const now = new Date();
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        isPaid: false,
        paymentMethod: "eSewa",
        "paymentClaim.status": "pending_review",
      },
      {
        $set: {
          "paymentClaim.status": "rejected",
          "paymentClaim.reviewedAt": now,
          "paymentClaim.reviewedBy": req.user._id,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      throw makeError(409, "This eSewa payment request has already been reviewed.");
    }

    return res.json(updatedOrder);
  } catch (error) {
    return sendPaymentError(
      res,
      error,
      "Could not reject the eSewa payment request."
    );
  }
};

export const startKhaltiPayment = async (req, res) => {
  const secret = process.env.KHALTI_SECRET_KEY;
  if (!secret) {
    return res.status(503).json({
      message: "Set KHALTI_SECRET_KEY in the project-root .env.",
    });
  }

  try {
    const order = await getOrderForPayment(req, req.params.id, "Khalti");
    const amountNpr = usdToNpr(order.totalPrice);
    const amountPaisa = Math.round(amountNpr * 100);
    const response = await fetch(`${KHALTI_API_URL}/epayment/initiate/`, {
      method: "POST",
      headers: {
        Authorization: `Key ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        return_url: `${getBackendUrl()}/api/orders/payment/khalti/return`,
        website_url: getFrontendUrl(),
        amount: amountPaisa,
        purchase_order_id: order._id.toString(),
        purchase_order_name: `Get Anything order ${order._id}`,
        customer_info: {
          name: req.user.username,
          email: req.user.email,
        },
      }),
    });
    const result = await response.json().catch(() => null);

    if (!response.ok || !result?.pidx || !result?.payment_url) {
      throw makeError(
        502,
        result?.detail || "Khalti could not initialize this payment."
      );
    }
    const paymentUrl = new URL(result.payment_url);
    if (
      paymentUrl.protocol !== "https:" ||
      paymentUrl.hostname !== "test-pay.khalti.com"
    ) {
      throw makeError(502, "Khalti returned an unexpected payment URL.");
    }

    order.paymentResult = {
      provider: "Khalti",
      id: result.pidx,
      status: "Initiated",
      amountNpr,
    };
    await order.save();

    return res.json({ paymentUrl: paymentUrl.toString() });
  } catch (error) {
    return sendPaymentError(res, error, "Could not start Khalti payment.");
  }
};

export const completeEsewaPayment = async (req, res) => {
  let order;
  try {
    const encodedData = req.query.data;
    if (typeof encodedData !== "string") {
      return res.redirect(paymentFailureUrl());
    }

    const callback = JSON.parse(
      Buffer.from(encodedData.replace(/ /g, "+"), "base64").toString("utf8")
    );
    const secret = process.env.ESEWA_SECRET_KEY;
    const productCode = process.env.ESEWA_PRODUCT_CODE;
    if (!secret || !productCode || !verifyEsewaSignature(callback, secret)) {
      return res.redirect(paymentFailureUrl());
    }

    order = await Order.findOne({
      "paymentResult.provider": "eSewa",
      "paymentResult.id": callback.transaction_uuid,
    });
    if (!order) return res.redirect(paymentFailureUrl());

    const expectedAmount = Number(order.paymentResult.amountNpr);
    if (
      callback.status !== "COMPLETE" ||
      callback.product_code !== productCode ||
      !amountsMatch(parseGatewayAmount(callback.total_amount), expectedAmount)
    ) {
      return res.redirect(paymentFailureUrl(order._id));
    }

    const statusUrl = new URL(ESEWA_STATUS_URL);
    statusUrl.searchParams.set("product_code", productCode);
    statusUrl.searchParams.set("total_amount", expectedAmount.toFixed(2));
    statusUrl.searchParams.set(
      "transaction_uuid",
      callback.transaction_uuid
    );
    const statusResponse = await fetch(statusUrl);
    const statusResult = await statusResponse.json();

    if (
      !statusResponse.ok ||
      statusResult.status !== "COMPLETE" ||
      statusResult.product_code !== productCode ||
      statusResult.transaction_uuid !== callback.transaction_uuid ||
      !amountsMatch(
        parseGatewayAmount(statusResult.total_amount),
        expectedAmount
      )
    ) {
      return res.redirect(paymentFailureUrl(order._id));
    }

    await recordVerifiedPayment(order, {
      provider: "eSewa",
      transactionId: statusResult.ref_id || callback.transaction_code,
      amountNpr: expectedAmount,
    });
    return res.redirect(paymentSuccessUrl(order._id));
  } catch (error) {
    console.error("Could not verify eSewa payment:", error);
    return res.redirect(paymentFailureUrl(order?._id));
  }
};

export const completeKhaltiPayment = async (req, res) => {
  const { pidx, purchase_order_id: orderId } = req.query;
  if (
    typeof pidx !== "string" ||
    typeof orderId !== "string" ||
    !mongoose.isValidObjectId(orderId)
  ) {
    return res.redirect(paymentFailureUrl());
  }

  try {
    const order = await Order.findById(orderId);
    if (
      !order ||
      order.paymentMethod !== "Khalti" ||
      order.paymentResult?.provider !== "Khalti" ||
      order.paymentResult.id !== pidx
    ) {
      return res.redirect(paymentFailureUrl(orderId));
    }

    const secret = process.env.KHALTI_SECRET_KEY;
    if (!secret) return res.redirect(paymentFailureUrl(order._id));

    const response = await fetch(`${KHALTI_API_URL}/epayment/lookup/`, {
      method: "POST",
      headers: {
        Authorization: `Key ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pidx }),
    });
    const result = await response.json();
    const expectedAmountPaisa = Math.round(
      Number(order.paymentResult.amountNpr) * 100
    );

    if (
      !response.ok ||
      result.status !== "Completed" ||
      result.pidx !== pidx ||
      Number(result.total_amount) !== expectedAmountPaisa
    ) {
      return res.redirect(paymentFailureUrl(order._id));
    }

    await recordVerifiedPayment(order, {
      provider: "Khalti",
      transactionId: result.transaction_id,
      amountNpr: Number(order.paymentResult.amountNpr),
    });
    return res.redirect(paymentSuccessUrl(order._id));
  } catch (error) {
    console.error("Could not verify Khalti payment:", error);
    return res.redirect(paymentFailureUrl(orderId));
  }
};
