import Alert from "../models/alertModel.js";
import Suspect from "../models/suspectModel.js";

export const createAlert = async (req, res) => {

  try {

    const { name, location, confidence } = req.body;

    const suspect = await Suspect.findOne({ name });

    const alert = await Alert.create({
      name,
      location,
      confidence
    });

    res.json({
      success: true,
      alert,
      reporterEmail: suspect?.reporterEmail
    });

  } catch (err) {

    res.status(500).json({
      message: "Alert failed"
    });

  }

};