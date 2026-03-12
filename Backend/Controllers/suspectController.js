import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import Suspect from "../models/suspectModel.js";


export const addSuspect = async (req, res) => {
  try {
    console.log("Suspect routes loaded");

    const imagePath = req.file?.path;

    let embeddingPath = null;

    // Try calling AI service
    try {

      const formData = new FormData();
      formData.append("file", fs.createReadStream(imagePath));

      const response = await axios.post(
        "https://pahchanai-1.onrender.com/generate-embedding",
        formData,
        { headers: formData.getHeaders() }
      );

      embeddingPath = response.data.embedding_path;

    } catch (aiError) {

      console.log("AI service not available, skipping embedding");

    }

    const suspect = await Suspect.create({
      name: req.body.name,
      location: req.body.location,
      image: imagePath,
      embedding: embeddingPath
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