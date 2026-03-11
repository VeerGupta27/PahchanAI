import express from "express";
import { addSuspect } from "../Controllers/suspectController.js";
import upload from "../middleware/uploads.js";

const routerSuspect = express.Router();

routerSuspect.post("/add-suspect", upload.single("image"), addSuspect);

export default router;