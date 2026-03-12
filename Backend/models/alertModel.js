import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({

  name: String,
  location: String,
  confidence: Number,

  createdAt: {
    type: Date,
    default: Date.now
  }

});

export default mongoose.model("Alert", alertSchema);