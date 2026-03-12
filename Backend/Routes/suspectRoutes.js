import express from "express";
import { addSuspect, getAllSuspects } from "../Controllers/suspectController.js";
import upload from "../middleware/uploads.js";
console.log("Suspect routes loaded");
const routerSuspect = express.Router();

routerSuspect.post("/add-suspect", upload.single("image"), addSuspect);
routerSuspect.get("/get-missing" , getAllSuspects)
routerSuspect.get("/test", (req,res)=>{
  res.send("AI route working");
});
export default routerSuspect;