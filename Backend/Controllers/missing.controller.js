import MissingData from "../models/MissingData.model.js";
import cloudinary   from "../config/cloudinary.js";

/* ── GET /api/missing ─────────────────────────────────────────
   Query params: ?search=&status=&gender=&page=1&limit=12       */
export const getAllCases = async (req, res) => {
  const { search, status, gender, page = 1, limit = 12 } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { name:      { $regex: search, $options: "i" } },
      { last_seen: { $regex: search, $options: "i" } },
    ];
  }
  if (status) query.status = status;
  if (gender) query.gender = gender;

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await MissingData.countDocuments(query);
  const cases = await MissingData.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    total,
    page:  Number(page),
    pages: Math.ceil(total / Number(limit)),
    cases,
  });
};

/* ── GET /api/missing/:id ─────────────────────────────────────  */
export const getCaseById = async (req, res) => {
  const missingCase = await MissingData.findById(req.params.id);

  if (!missingCase) {
    return res.status(404).json({ success: false, message: "Case not found" });
  }

  res.status(200).json({ success: true, case: missingCase });
};

/* ── POST /api/missing ────────────────────────────────────────
   Multipart/form-data — multer handles the photo field         */
export const createCase = async (req, res) => {
  const {
    name, age, gender,
    last_seen, landmark, last_seen_date,
    contact, description, status,
  } = req.body;

  const photo = req.file
    ? { url: req.file.path, public_id: req.file.filename }
    : { url: null, public_id: null };

  const newCase = await MissingData.create({
    name,
    age,
    gender,
    photo,
    last_seen,
    landmark:       landmark       || null,
    last_seen_date: last_seen_date || null,
    contact,
    description:    description    || null,
    status:         status         || "high_priority",
  });

  res.status(201).json({
    success: true,
    message: "Case registered successfully",
    case:    newCase,
  });
};

/* ── PUT /api/missing/:id ─────────────────────────────────────  */
export const updateCase = async (req, res) => {
  const missingCase = await MissingData.findById(req.params.id);

  if (!missingCase) {
    return res.status(404).json({ success: false, message: "Case not found" });
  }

  // If a new photo was uploaded, remove the old one from Cloudinary
  if (req.file && missingCase.photo?.public_id) {
    await cloudinary.uploader.destroy(missingCase.photo.public_id);
  }

  const photo = req.file
    ? { url: req.file.path, public_id: req.file.filename }
    : missingCase.photo;

  const updated = await MissingData.findByIdAndUpdate(
    req.params.id,
    { ...req.body, photo },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Case updated",
    case:    updated,
  });
};

/* ── DELETE /api/missing/:id ──────────────────────────────────  */
export const deleteCase = async (req, res) => {
  const missingCase = await MissingData.findById(req.params.id);

  if (!missingCase) {
    return res.status(404).json({ success: false, message: "Case not found" });
  }

  // Remove photo from Cloudinary
  if (missingCase.photo?.public_id) {
    await cloudinary.uploader.destroy(missingCase.photo.public_id);
  }

  await missingCase.deleteOne();

  res.status(200).json({ success: true, message: "Case deleted" });
};