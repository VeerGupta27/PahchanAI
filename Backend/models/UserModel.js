import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  
  role:{
    type: String,
    enum: ["citizen", "partner", "police"],
    default: "citizen",
    required: true
  },


  password: {
    type: String,
    required: true
  }

}, {
  timestamps: true
});

const User = mongoose.model("User", userSchema);

export default User;