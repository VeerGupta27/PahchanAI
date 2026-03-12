import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");
import mongoose from "mongoose";   

import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./Config/Mondodb.js";
import userRouter from './Routes/userRouter.js'
import routerSuspect from "./Routes/suspectRoutes.js";
const app = express();

import missingRouter from "./Routes/missingroute.js";  



const port = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/users", userRouter);
app.use('/ai', routerSuspect)
app.use("/missing", missingRouter); 
app.get("/testdb", async (req, res) => {
  const data = await mongoose.connection.db.collection("test").insertOne({
    name: "PahchanAI",
    createdAt: new Date()
  });

  res.send("Data inserted successfully");
});
connectDB();

app.listen(port, () => console.log("server started " + port));
