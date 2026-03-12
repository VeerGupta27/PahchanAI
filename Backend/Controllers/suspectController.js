import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import Suspect from "../models/suspectModel.js";

export const addSuspect = async (req, res) => {
  try {

    const imagePath = req.file?.path;
    if (!imagePath) {
      return res.status(400).json({ message: "Image file is required" });
    }

    let embedding = null;

    try {
      const formData = new FormData();
      formData.append("file", fs.createReadStream(imagePath));

      const response = await axios.post(
        "https://pahchanai-1.onrender.com/generate-embedding",
        formData,
        {
          headers: formData.getHeaders(),
          timeout: 60000
        }
      );

      embedding = response.data.embedding; // ← array of 512 numbers

    } catch (aiError) {
      console.log("AI service not available, skipping embedding");
    }

    const suspect = await Suspect.create({
      name: req.body.name,
      location: req.body.location,
      reporterEmail: req.body.email,
      image: imagePath,
      embedding: embedding  // ← 512 numbers stored directly in MongoDB
    });

    res.status(201).json({
      message: "Suspect added successfully",
      suspect
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to add suspect"
    });
  }
};


export const getAllSuspects = async (req, res) => {
  try {
    const suspects = await Suspect.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: suspects.length,
      suspects
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch suspects"
    });
  }
};