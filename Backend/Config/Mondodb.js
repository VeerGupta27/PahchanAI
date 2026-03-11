import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);

    console.log("MongoDB Connected ✅");

  } catch (err) {
    console.error("Connection Error:", err.message);
  }
};

export default connectDB;