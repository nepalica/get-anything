import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/userModel.js";

const grantAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required to grant admin access.");
  }

  if (!email) {
    throw new Error("Set ADMIN_EMAIL in the project-root .env file.");
  }

  await mongoose.connect(process.env.MONGO_URI);

  try {
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { isAdmin: true } },
      { new: true }
    );

    if (!user) {
      throw new Error(
        "No user found for ADMIN_EMAIL. Register that account before granting admin access."
      );
    }

    console.log(`Admin access enabled for ${user.username}.`);
  } finally {
    await mongoose.disconnect();
  }
};

grantAdmin().catch((error) => {
  console.error("Could not grant admin access:", error);
  process.exitCode = 1;
});
