import { createHmac, timingSafeEqual } from "crypto";

export const getUsdToNprRate = () => {
  const rate = Number(process.env.USD_TO_NPR_RATE);
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error("Set a positive USD_TO_NPR_RATE in the project-root .env.");
  }
  return rate;
};

export const usdToNpr = (amountUsd) => {
  const amount = Number(amountUsd) * getUsdToNprRate();
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("The order total cannot be converted to NPR.");
  }
  return Math.round((amount + Number.EPSILON) * 100) / 100;
};

export const getFrontendUrl = () =>
  (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");

export const getBackendUrl = () =>
  (
    process.env.BACKEND_URL ||
    `http://localhost:${process.env.PORT || 5000}`
  ).replace(/\/+$/, "");

export const createEsewaSignature = (fields, signedFieldNames, secret) => {
  const message = signedFieldNames
    .split(",")
    .map((fieldName) => `${fieldName}=${fields[fieldName]}`)
    .join(",");
  return createHmac("sha256", secret).update(message).digest("base64");
};

export const verifyEsewaSignature = (fields, secret) => {
  const signedFieldNames = fields.signed_field_names;
  const requiredFields = [
    "transaction_code",
    "status",
    "total_amount",
    "transaction_uuid",
    "product_code",
    "signed_field_names",
  ];

  if (
    typeof signedFieldNames !== "string" ||
    !requiredFields.every((fieldName) =>
      signedFieldNames.split(",").includes(fieldName)
    ) ||
    typeof fields.signature !== "string"
  ) {
    return false;
  }

  const expected = Buffer.from(
    createEsewaSignature(fields, signedFieldNames, secret),
    "base64"
  );
  const received = Buffer.from(fields.signature, "base64");
  return (
    expected.length === received.length &&
    timingSafeEqual(expected, received)
  );
};

export const parseGatewayAmount = (value) => {
  const amount = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(amount) ? amount : NaN;
};

export const amountsMatch = (first, second) =>
  Number.isFinite(first) &&
  Number.isFinite(second) &&
  Math.round(first * 100) === Math.round(second * 100);
