import assert from "node:assert/strict";
import test from "node:test";
import { getApiErrorMessage } from "./apiErrors.js";

test("explains how to restore a failed backend connection", () => {
  const message = getApiErrorMessage(
    { status: "FETCH_ERROR", error: "TypeError: Failed to fetch" },
    "Order could not be placed."
  );

  assert.match(message, /npm run dev/);
});

test("recognizes an empty Vite proxy error response", () => {
  const message = getApiErrorMessage(
    { status: 500, data: null },
    "Order could not be placed."
  );

  assert.match(message, /Could not reach the backend/);
});

test("returns backend order errors instead of a generic message", () => {
  const message = getApiErrorMessage(
    { status: 500, data: { error: "Product not found" } },
    "Order could not be placed."
  );

  assert.equal(message, "Product not found");
});
