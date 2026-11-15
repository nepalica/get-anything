import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
      },
    ],

    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },

    paymentMethod: {
      type: String,
      required: true,
    },

    paymentResult: {
      provider: { type: String, enum: ["eSewa", "Khalti"] },
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
      transactionId: { type: String },
      amountNpr: { type: Number },
    },

    paymentClaim: {
      status: {
        type: String,
        enum: ["not_submitted", "pending_review", "rejected", "approved"],
        default: "not_submitted",
      },
      transactionReference: { type: String, trim: true, maxlength: 100 },
      amountNpr: { type: Number },
      submittedAt: { type: Date },
      reviewedAt: { type: Date },
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },

    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },

    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },

    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },

    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },

    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },

    paidAt: {
      type: Date,
    },

    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },

    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
