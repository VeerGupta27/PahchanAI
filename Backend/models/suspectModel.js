import mongoose from "mongoose";

const suspectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  location: {
    type: String
  },

  image: {
    type: String
  },

  embedding: {
    type: [Number],  // ← changed from String to array of numbers
    default: null
  },

  reporterEmail: {
    type: String,
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Suspect = mongoose.model("Suspect", suspectSchema);

export default Suspect;