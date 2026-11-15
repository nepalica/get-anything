import assert from "node:assert/strict";
import { test } from "node:test";
import { authorizeAdmin } from "./authMiddleware.js";
import asyncHandler from "./asyncHandler.js";

const createResponse = () => ({
  statusCode: 200,
  body: undefined,
  status(statusCode) {
    this.statusCode = statusCode;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

test("admin authorization failures use a JSON 403 response", () => {
  const response = createResponse();

  authorizeAdmin({ user: { isAdmin: false } }, response, () => {
    assert.fail("A non-admin must not continue.");
  });

  assert.equal(response.statusCode, 403);
  assert.deepEqual(response.body, {
    message: "Not authorized as an admin.",
  });
});

test("async errors preserve an explicitly selected HTTP status", async () => {
  const response = createResponse();
  const handler = asyncHandler(async (_req, res) => {
    res.status(401);
    throw new Error("Not authorized.");
  });

  await handler({}, response, () => {});

  assert.equal(response.statusCode, 401);
  assert.deepEqual(response.body, { message: "Not authorized." });
});
