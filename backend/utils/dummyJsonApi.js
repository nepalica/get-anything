const DUMMYJSON_PRODUCTS_URL = "https://dummyjson.com/products?limit=30";

export const mapDummyJsonProduct = (product) => {
  const price = Number(product?.price);
  const rating = Number(product?.rating);
  const reviewCount = Array.isArray(product?.reviews)
    ? product.reviews.length
    : 0;
  const stock = Number(product?.stock);
  let imageUrl;

  try {
    imageUrl = new URL(product?.thumbnail || product?.images?.[0]);
  } catch {
    throw new Error(`DummyJSON product ${product?.id} has an invalid image URL.`);
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
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    throw new Error(`DummyJSON product ${product?.id} has invalid product data.`);
  }

  return {
    source: "DummyJSON",
    sourceId: product.id,
    name: product.title.trim(),
    image: imageUrl.toString(),
    brand:
      typeof product.brand === "string" && product.brand.trim()
        ? product.brand.trim()
        : "DummyJSON",
    quantity: 1,
    category: product.category.trim(),
    description: product.description.trim(),
    price,
    rating,
    numReviews: reviewCount,
    countInStock: stock,
  };
};

export const fetchDummyJsonProducts = async () => {
  const response = await fetch(DUMMYJSON_PRODUCTS_URL);
  if (!response.ok) {
    throw new Error(`DummyJSON API request failed with status ${response.status}.`);
  }

  const result = await response.json();
  if (!Array.isArray(result?.products) || result.products.length === 0) {
    throw new Error("DummyJSON API returned no products.");
  }

  return result.products.map(mapDummyJsonProduct);
};
