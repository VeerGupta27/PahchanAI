import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

import connectDB from "./Config/Mondodb.js";
import userRouter from "./Routes/userRouter.js";
import routerSuspect from "./Routes/suspectRoutes.js";
import router from "./Routes/embeddingsRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

// ── Middleware (must come before routes) ──────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes ────────────────────────────────────────────────────────
app.use("/users", userRouter);
app.use("/api", router);
app.use("/ai", routerSuspect);

// ── Test route ────────────────────────────────────────────────────
app.get("/testdb", async (req, res) => {
  try {
    await mongoose.connection.db.collection("test").insertOne({
      name: "PahchanAI",
      createdAt: new Date(),
    });
    res.send("Data inserted successfully");
  } catch (err) {
    res.status(500).send("DB test failed: " + err.message);
  }
});

// ── Global error handler (must be last) ───────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// ── Start ─────────────────────────────────────────────────────────
connectDB();
app.listen(port, () => console.log("Server started on port " + port));