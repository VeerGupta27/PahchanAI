import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./Config/Mondodb.js";

const app = express();

const port = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

connectDB();

app.listen(port, () => console.log("server started " + port));