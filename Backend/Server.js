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
app.get('/',(res,req)=>{
    res.send("running bacend")
})
connectDB();

app.listen(port, () => console.log("server started " + port));