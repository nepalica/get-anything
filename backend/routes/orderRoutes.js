import express from "express";
const router = express.Router();

import {
  createOrder,
  getAllOrders,
  getUserOrders,
  countTotalOrders,
  calculateTotalSales,
  calcualteTotalSalesByDate,
  findOrderById,
  markOrderAsDelivered,
} from "../controllers/orderController.js";
import {
  completeEsewaPayment,
  completeKhaltiPayment,
  startEsewaPayment,
  startKhaltiPayment,
  submitEsewaQrClaim,
  approveEsewaQrClaim,
  rejectEsewaQrClaim,
} from "../controllers/paymentController.js";

import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

router
  .route("/")
  .post(authenticate, createOrder)
  .get(authenticate, authorizeAdmin, getAllOrders);

router.get("/payment/esewa/return", completeEsewaPayment);
router.get("/payment/khalti/return", completeKhaltiPayment);
router.post("/:id/payments/esewa", authenticate, startEsewaPayment);
router.post("/:id/payments/esewa/claim", authenticate, submitEsewaQrClaim);
router.put(
  "/:id/payments/esewa/approve",
  authenticate,
  authorizeAdmin,
  approveEsewaQrClaim
);
router.put(
  "/:id/payments/esewa/reject",
  authenticate,
  authorizeAdmin,
  rejectEsewaQrClaim
);
router.post("/:id/payments/khalti", authenticate, startKhaltiPayment);
router.route("/mine").get(authenticate, getUserOrders);
router.route("/total-orders").get(countTotalOrders);
router.route("/total-sales").get(calculateTotalSales);
router.route("/total-sales-by-date").get(calcualteTotalSalesByDate);
router.route("/:id").get(authenticate, findOrderById);
router
  .route("/:id/deliver")
  .put(authenticate, authorizeAdmin, markOrderAsDelivered);

export default router;
