import Alert from "../models/alertModel.js";
export const createAlert = async (req, res) => {

  try {

    const alert = await Alert.create({
      name: req.body.name,
      location: req.body.location,
      confidence: req.body.confidence
    });

    res.json({
      success: true,
      alert
    });

  } catch (err) {

    res.status(500).json({
      message: "Alert failed"
    });

  }

};