import assert from "node:assert/strict";
import { test } from "node:test";
import Order from "../models/orderModel.js";
import {
  approveEsewaQrClaim,
  submitEsewaQrClaim,
} from "./paymentController.js";

const orderId = "507f1f77bcf86cd799439011";
const buyerId = "507f1f77bcf86cd799439012";
const adminId = "507f1f77bcf86cd799439013";

const withOrderStubs = async (stubs, callback) => {
  const originalFindById = Order.findById;
  const originalFindOneAndUpdate = Order.findOneAndUpdate;

  if (stubs.findById) Order.findById = stubs.findById;
  if (stubs.findOneAndUpdate) {
    Order.findOneAndUpdate = stubs.findOneAndUpdate;
  }

  try {
    await callback();
  } finally {
    Order.findById = originalFindById;
    Order.findOneAndUpdate = originalFindOneAndUpdate;
  }
};

const responseRecorder = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

test("eSewa QR claims use the order amount and trim the transaction reference", async () => {
  const originalRate = process.env.USD_TO_NPR_RATE;
  process.env.USD_TO_NPR_RATE = "134";
  let updateFilter;
  let update;

  try {
    await withOrderStubs(
      {
        findById: async () => ({
          _id: orderId,
          user: { toString: () => buyerId },
          isPaid: false,
          paymentMethod: "eSewa",
          totalPrice: 10,
        }),
        findOneAndUpdate: async (filter, changes) => {
          updateFilter = filter;
          update = changes;
          return { _id: orderId };
        },
      },
      async () => {
        const response = responseRecorder();
        await submitEsewaQrClaim(
          {
            params: { id: orderId },
            user: { _id: buyerId },
            body: { transactionReference: "  receipt-123  " },
          },
          response
        );

        assert.equal(response.statusCode, 200);
      }
    );

    assert.equal(updateFilter.user, buyerId);
    assert.equal(update.$set["paymentClaim.status"], "pending_review");
    assert.equal(update.$set["paymentClaim.transactionReference"], "receipt-123");
    assert.equal(update.$set["paymentClaim.amountNpr"], 1340);
  } finally {
    if (originalRate === undefined) delete process.env.USD_TO_NPR_RATE;
    else process.env.USD_TO_NPR_RATE = originalRate;
  }
});

test("a buyer cannot submit a payment claim for another user's order", async () => {
  let updateAttempted = false;

  await withOrderStubs(
    {
      findById: async () => ({
        _id: orderId,
        user: { toString: () => buyerId },
        isPaid: false,
        paymentMethod: "eSewa",
        totalPrice: 10,
      }),
      findOneAndUpdate: async () => {
        updateAttempted = true;
      },
    },
    async () => {
      const response = responseRecorder();
      await submitEsewaQrClaim(
        {
          params: { id: orderId },
          user: { _id: adminId },
          body: {},
        },
        response
      );

      assert.equal(response.statusCode, 403);
      assert.equal(response.body.message, "You cannot pay for this order.");
    }
  );

  assert.equal(updateAttempted, false);
});

test("admin approval marks a pending QR claim as paid and processed", async () => {
  let update;

  await withOrderStubs(
    {
      findById: async () => ({
        _id: orderId,
        isPaid: false,
        paymentMethod: "eSewa",
        paymentClaim: {
          status: "pending_review",
          amountNpr: 1340,
          transactionReference: "receipt-123",
        },
      }),
      findOneAndUpdate: async (_filter, changes) => {
        update = changes;
        return { _id: orderId };
      },
    },
    async () => {
      const response = responseRecorder();
      await approveEsewaQrClaim(
        { params: { id: orderId }, user: { _id: adminId } },
        response
      );

      assert.equal(response.statusCode, 200);
    }
  );

  assert.equal(update.$set.isPaid, true);
  assert.equal(update.$set["paymentClaim.status"], "approved");
  assert.equal(update.$set.paymentResult.transactionId, "receipt-123");
  assert.equal(update.$set.paymentResult.amountNpr, 1340);
});
