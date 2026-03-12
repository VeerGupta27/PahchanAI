import express from "express";
import Suspect from "../models/suspectModel.js";

const router = express.Router();

router.get("/embeddings", async (req, res) => {
  const suspects = await Suspect.find({}, {
    name:1,
    embedding:1,
    location:1
  });

  res.json(suspects);
});

export default router;