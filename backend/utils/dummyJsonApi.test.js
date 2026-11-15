import assert from "node:assert/strict";
import { test } from "node:test";
import { mapDummyJsonProduct } from "./dummyJsonApi.js";

test("DummyJSON products map to the catalog format", () => {
  const mapped = mapDummyJsonProduct({
    id: 8,
    title: " Product title ",
    price: 19.99,
    description: " Product description ",
    category: "beauty",
    brand: "Example Brand",
    rating: 4.5,
    stock: 12,
    reviews: [{ comment: "Good", rating: 5 }],
    thumbnail: "https://cdn.dummyjson.com/product-images/example.webp",
  });

  assert.deepEqual(mapped, {
    source: "DummyJSON",
    sourceId: 8,
    name: "Product title",
    image: "https://cdn.dummyjson.com/product-images/example.webp",
    brand: "Example Brand",
    quantity: 1,
    category: "beauty",
    description: "Product description",
    price: 19.99,
    rating: 4.5,
    numReviews: 1,
    countInStock: 12,
  });
});

test("DummyJSON products reject invalid image URLs and stock", () => {
  assert.throws(
    () =>
      mapDummyJsonProduct({
        id: 8,
        title: "Product",
        price: 19.99,
        description: "Description",
        category: "beauty",
        rating: 4,
        stock: -1,
        thumbnail: "http://example.test/image.webp",
      }),
    /invalid product data/
  );
});
