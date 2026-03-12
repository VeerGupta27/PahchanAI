import express from "express";
import {
  getAllCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
} from "../controllers/missing.controller.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

router.get("/",     getAllCases);
router.get("/:id",  getCaseById);

// "photo" must match the field name used in FormData on the frontend
router.post(  "/",    upload.single("photo"), createCase);
router.put(   "/:id", upload.single("photo"), updateCase);
router.delete("/:id", deleteCase);

export default router;
