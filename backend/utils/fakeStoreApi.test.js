import assert from "node:assert/strict";
import { test } from "node:test";
import { mapFakeStoreProduct } from "./fakeStoreApi.js";
import Product from "../models/productModel.js";

test("Fake Store products map to the fields required by the catalog", () => {
  const mapped = mapFakeStoreProduct({
    id: 7,
    title: " Product title ",
    price: 9.99,
    description: " Product description ",
    category: "electronics",
    image: "https://fakestoreapi.com/image.png",
    rating: { rate: 4.2, count: 15 },
  });

  assert.deepEqual(mapped, {
    source: "FakeStore",
    sourceId: 7,
    name: "Product title",
    image: "https://fakestoreapi.com/image.png",
    brand: "Fake Store",
    quantity: 1,
    category: "electronics",
    description: "Product description",
    price: 9.99,
    rating: 4.2,
    numReviews: 15,
    countInStock: 20,
  });
});

test("Fake Store products reject incomplete or non-HTTPS image data", () => {
  assert.throws(
    () =>
      mapFakeStoreProduct({
        id: 7,
        title: "Product",
        price: 10,
        description: "Description",
        category: "electronics",
        image: "http://example.test/image.png",
        rating: { rate: 4, count: 2 },
      }),
    /invalid product data/
  );
});

test("Fake Store source identifiers are product fields", () => {
  assert.ok(Product.schema.path("source"));
  assert.ok(Product.schema.path("sourceId"));
  assert.deepEqual(Product.schema.path("source").enumValues, [
    "FakeStore",
    "DummyJSON",
  ]);
  assert.equal(Product.schema.path("reviews").schema.path("sourceId"), undefined);
});
