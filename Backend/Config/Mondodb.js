
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      family: 4,
    });
    console.log("MongoDB Connected (Direct Mode) ✅");
  } catch (err) {
    console.error("Connection Error:", err.message);
  }
};

export default connectDB;