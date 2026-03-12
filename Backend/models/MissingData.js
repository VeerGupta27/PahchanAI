import mongoose from "mongoose";

const MissingDataSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, "Name is required"],
      trim:     true,
    },

    age: {
      type:     Number,
      required: [true, "Age is required"],
      min:      [0,   "Age cannot be negative"],
      max:      [120, "Age seems invalid"],
    },

    gender: {
      type:     String,
      enum:     ["male", "female", "other"],
      required: [true, "Gender is required"],
      default:  "male",
    },

    // Cloudinary photo — url is used in the frontend, public_id is used to delete it
    photo: {
      url:       { type: String, default: null },
      public_id: { type: String, default: null },
    },

    last_seen: {
      type:     String,
      required: [true, "Last seen location is required"],
      trim:     true,
    },

    landmark: {
      type:    String,
      trim:    true,
      default: null,
    },

    last_seen_date: {
      type:    Date,
      default: null,
    },

    contact: {
      type:     String,
      required: [true, "Contact number is required"],
      trim:     true,
    },

    description: {
      type:    String,
      trim:    true,
      default: null,
    },

    status: {
      type:    String,
      enum:    ["high_priority", "ai_match_pending", "resolved"],
      default: "high_priority",
    },
  },
  {
    timestamps: true,
  }
);

const MissingData = mongoose.model("MissingData", MissingDataSchema);

export default MissingData;