import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config({ path: "./.env" });

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    const email = "shakibsalehin1123@gmail.com";
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`User with email ${email} not found.`);
      process.exit(1);
    }

    await User.updateOne({ email }, { $set: { role: "admin" } });
    console.log(`Successfully updated ${email} role to admin.`);
    process.exit(0);
  } catch (error) {
    console.error("Error updating user:", error);
    process.exit(1);
  }
};

makeAdmin();
