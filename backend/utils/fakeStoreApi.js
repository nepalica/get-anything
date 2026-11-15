const FAKE_STORE_PRODUCTS_URL = "https://fakestoreapi.com/products";

export const mapFakeStoreProduct = (product) => {
  const price = Number(product?.price);
  const rating = Number(product?.rating?.rate);
  const reviewCount = Number(product?.rating?.count);
  let imageUrl;

  try {
    imageUrl = new URL(product?.image);
  } catch {
    throw new Error(`Fake Store product ${product?.id} has an invalid image URL.`);
  }

  if (
    !Number.isInteger(product?.id) ||
    product.id < 1 ||
    typeof product.title !== "string" ||
    !product.title.trim() ||
    typeof product.category !== "string" ||
    !product.category.trim() ||
    typeof product.description !== "string" ||
    !product.description.trim() ||
    imageUrl.protocol !== "https:" ||
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isFinite(rating) ||
    rating < 0 ||
    rating > 5 ||
    !Number.isInteger(reviewCount) ||
    reviewCount < 0
  ) {
    throw new Error(`Fake Store product ${product?.id} has invalid product data.`);
  }

  return {
    source: "FakeStore",
    sourceId: product.id,
    name: product.title.trim(),
    image: imageUrl.toString(),
    brand: "Fake Store",
    quantity: 1,
    category: product.category.trim(),
    description: product.description.trim(),
    price,
    rating,
    numReviews: reviewCount,
    countInStock: 20,
  };
};

export const fetchFakeStoreProducts = async () => {
  const response = await fetch(FAKE_STORE_PRODUCTS_URL);
  if (!response.ok) {
    throw new Error(`Fake Store API request failed with status ${response.status}.`);
  }

  const products = await response.json();
  if (!Array.isArray(products) || products.length === 0) {
    throw new Error("Fake Store API returned no products.");
  }

  return products.map(mapFakeStoreProduct);
};
