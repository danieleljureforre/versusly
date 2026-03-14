import express from "express";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/avatar", upload.single("avatar"), async (req, res) => {
  try {

    const filename = "avatar_" + Date.now() + ".jpg";
    const outputPath = path.join("uploads", filename);

    await sharp(req.file.path)
      .resize(512, 512, { fit: "cover" })
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    fs.unlinkSync(req.file.path);

    res.json({
      url: `/uploads/${filename}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;