const express = require("express");
const router = express.Router();

const analyzeResume = require("./analysisResume");
const cloudinary = require("../config/cloudinary");
const Pdf = require("../models/PdfSchema");
const upload = require("../middleware/upload");
const pdfParse = require("pdf-parse");
const { authMidlleware } = require("../middleware/auth");

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "pdfs",
        resource_type: "raw",
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );

    stream.end(buffer);
  });

router.post("/upload", authMidlleware, upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const [result, parsed] = await Promise.all([
      uploadToCloudinary(req.file.buffer),
      pdfParse(req.file.buffer),
    ]);

    // parsed.text = extracted resume text
    const analysis = await analyzeResume(parsed.text);

    const saved = await Pdf.create({
      user: req.user.userId,
      title: req.body.title || req.file.originalname,
      url: result.secure_url,
      publicId: result.public_id,
      content: parsed.text,
      pages: parsed.numpages,
      analysis: analysis,
    });

    res.status(201).json({
      message: "Resume analyzed successfully",
      pdf: saved,
     
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;