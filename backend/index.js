// packages
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// Utiles
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import { getPaymentConfig } from "./controllers/paymentController.js";

const backendDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(backendDirectory, "../.env") });
const port = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);

app.get("/api/config/payments", getPaymentConfig);

const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

await connectDB();
app.listen(port, () => console.log(`Server running on port: ${port}`));
