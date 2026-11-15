import assert from "node:assert/strict";
import { test } from "node:test";
import {
  amountsMatch,
  createEsewaSignature,
  getUsdToNprRate,
  usdToNpr,
  verifyEsewaSignature,
} from "./paymentUtils.js";

test("USD totals are converted to NPR using the configured rate", () => {
  const originalRate = process.env.USD_TO_NPR_RATE;
  process.env.USD_TO_NPR_RATE = "134";

  try {
    assert.equal(usdToNpr(10.25), 1373.5);
  } finally {
    if (originalRate === undefined) delete process.env.USD_TO_NPR_RATE;
    else process.env.USD_TO_NPR_RATE = originalRate;
  }
});

test("invalid or missing exchange rates fail explicitly", () => {
  const originalRate = process.env.USD_TO_NPR_RATE;
  delete process.env.USD_TO_NPR_RATE;

  try {
    assert.throws(getUsdToNprRate, /positive USD_TO_NPR_RATE/);
    process.env.USD_TO_NPR_RATE = "0";
    assert.throws(getUsdToNprRate, /positive USD_TO_NPR_RATE/);
  } finally {
    if (originalRate === undefined) delete process.env.USD_TO_NPR_RATE;
    else process.env.USD_TO_NPR_RATE = originalRate;
  }
});

test("eSewa callback signatures reject modified payment details", () => {
  const secret = "sandbox-secret";
  const callback = {
    transaction_code: "TEST-123",
    status: "COMPLETE",
    total_amount: "100.00",
    transaction_uuid: "order-123",
    product_code: "EPAYTEST",
    signed_field_names:
      "transaction_code,status,total_amount,transaction_uuid,product_code,signed_field_names",
  };
  callback.signature = createEsewaSignature(
    callback,
    callback.signed_field_names,
    secret
  );

  assert.equal(verifyEsewaSignature(callback, secret), true);
  assert.equal(
    verifyEsewaSignature({ ...callback, total_amount: "101.00" }, secret),
    false
  );
});

test("gateway amount comparison is precise to paisa", () => {
  assert.equal(amountsMatch(100.001, 100), true);
  assert.equal(amountsMatch(100.01, 100), false);
  assert.equal(amountsMatch(Number.NaN, 100), false);
});
