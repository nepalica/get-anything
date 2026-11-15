import "dotenv/config";
import mongoose from "mongoose";
import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";
import { fetchDummyJsonProducts } from "./dummyJsonApi.js";
import { fetchFakeStoreProducts } from "./fakeStoreApi.js";

const legacySampleProducts = [
  {
    name: "Sona Mansuli Rice - 25 kg",
    brand: "Nepali Pantry",
  },
  {
    name: "Masoor Dal - 1 kg",
    brand: "Nepali Pantry",
  },
  {
    name: "Mustard Oil - 1 L",
    brand: "Kitchen Basic",
  },
  {
    name: "Ilam Tea - 250 g",
    brand: "Eastern Hills",
  },
  {
    name: "Aluminium Pressure Cooker - 5 L",
    brand: "Kitchen Basic",
  },
  {
    name: "Single-Burner LPG Gas Stove",
    brand: "Home Utility",
  },
  {
    name: "Stainless Steel Dinner Plates - Set of 6",
    brand: "Home Utility",
  },
  {
    name: "Water Bucket with Lid - 20 L",
    brand: "Home Utility",
  },
  {
    name: "Dishwashing Liquid - 1 L",
    brand: "Clean Home",
  },
  {
    name: "Laundry Detergent Powder - 1 kg",
    brand: "Clean Home",
  },
];

const seedProducts = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required to seed the sample catalog.");
  }

  const externalProducts = [
    ...(await fetchFakeStoreProducts()),
    ...(await fetchDummyJsonProducts()),
  ];
  await mongoose.connect(process.env.MONGO_URI);

  try {
    const categories = new Map();

    for (const product of externalProducts) {
      if (!categories.has(product.category)) {
        const category = await Category.findOneAndUpdate(
          { name: product.category },
          { $setOnInsert: { name: product.category } },
          { new: true, upsert: true }
        );
        categories.set(product.category, category._id);
      }

      const { category, ...productFields } = product;
      const productQuery = {
        source: product.source,
        sourceId: product.sourceId,
      };
      const productFieldsToSet = { ...productFields };
      const setOnInsert = {};

      setOnInsert.rating = productFieldsToSet.rating;
      setOnInsert.numReviews = productFieldsToSet.numReviews;
      setOnInsert.countInStock = productFieldsToSet.countInStock;
      delete productFieldsToSet.rating;
      delete productFieldsToSet.numReviews;
      delete productFieldsToSet.countInStock;

      await Product.findOneAndUpdate(
        productQuery,
        {
          $set: {
            ...productFieldsToSet,
            category: categories.get(category),
          },
          $setOnInsert: setOnInsert,
        },
        { new: true, upsert: true, runValidators: true }
      );
    }

    const removedLegacyProducts = await Product.deleteMany({
      source: { $exists: false },
      $or: legacySampleProducts,
    });

    console.log(
      `Synced ${externalProducts.length} API products; removed ${removedLegacyProducts.deletedCount} generated household sample products.`
    );
  } finally {
    await mongoose.disconnect();
  }
};

seedProducts().catch((error) => {
  console.error("Could not sync the product catalogs:", error);
  process.exitCode = 1;
});
