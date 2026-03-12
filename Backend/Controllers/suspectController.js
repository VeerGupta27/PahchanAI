import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import Suspect from "../models/suspectModel.js";

export const addSuspect = async (req, res) => {
  try {

    const imagePath = req.file?.path;

    if (!imagePath) {
      return res.status(400).json({
        message: "Image upload failed"
      });
    }

    let embeddingPath = null;

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

      console.log("AI RESPONSE:", response.data);

      if (response.data && response.data.embedding_file) {
        embeddingPath = response.data.embedding_file;
      }

    } catch (aiError) {

      console.error("AI error:", aiError.message);
      console.log("AI service not available, skipping embedding");

    }

    console.log("Embedding to save:", embeddingPath);

    const suspect = await Suspect.create({
      name: req.body.name,
      location: req.body.location,
      reporterEmail: req.body.email,
      image: imagePath,
      embedding: embeddingPath || null
    });

    console.log("Saved suspect:", suspect);

    res.status(201).json({
      message: "Suspect added successfully",
      suspect
    });

  } catch (error) {

    console.error("CREATE SUSPECT ERROR:", error);

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