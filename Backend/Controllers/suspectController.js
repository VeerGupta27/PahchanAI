import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import Suspect from "../models/suspectModel.js";

export const addSuspect = async (req, res) => {
  try {

    const imagePath = req.file.path;

    const formData = new FormData();
    formData.append("file", fs.createReadStream(imagePath));

    // call Python AI service
    const response = await axios.post(
      "http://127.0.0.1:8000/generate-embedding",
      formData,
      { headers: formData.getHeaders() }
    );

    const embeddingPath = response.data.embedding_path;

    const suspect = await Suspect.create({
      name: req.body.name,
      location: req.body.location,
      image: imagePath,
      embedding: embeddingPath
    });

    res.status(201).json(suspect);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add suspect" });
  }
};