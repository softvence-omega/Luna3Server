// src/services/uploadService.ts

import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import config from "../config";

// Function to delete a file from the local filesystem
const deleteFile = async (filePath: string) => {
  try {
    await fs.unlink(filePath);
    console.log(`File deleted successfully: ${filePath}`);
  } catch (err: any) {
    console.error(`Error deleting file: ${err.message}`);
  }
};

// Function to upload a file (PDF or other) to Cloudinary
export const uploadFileToCloudinary = async (name: string, filePath: string) => {
  cloudinary.config({
    cloud_name: config.CLOUDNAME,
    api_key: config.APIkEY,
    api_secret: config.APISECRET,
  });

  try {
    // Upload the file to Cloudinary, auto detects file type
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      public_id: name,
      resource_type: "auto",  // Auto-detect file type (PDF, image, etc.)
    });

    // Log upload result
    console.log("Upload result:", uploadResult);

    // Delete the file from local filesystem
    await deleteFile(filePath);

    // Return the upload result with URL
    return uploadResult;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    throw new Error("File upload failed");
  }
};

// Multer storage configuration for local file saving
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "uploads")); // Define folder for temporary file storage
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)); // Preserve the file extension
  },
});

// Multer file filter to only accept PDFs
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = ["application/pdf"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only PDF files are allowed!"), false);
  }
  cb(null, true);
};

// Multer upload setup for PDF files
export const uploadPDF = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit file size to 10 MB
  },
});

// Function to handle single file upload (PDF)
export const uploadResume = (req: any, res: any) => {
  const upload = uploadPDF.single("resume"); // "resume" is the field name in form-data

  upload(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      // The file is available as req.file
      const filePath = req.file?.path;
      if (!filePath) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileName = req.file.filename; // The file's unique name (without extension)

      // Upload the resume to Cloudinary
      const uploadedFile = await uploadFileToCloudinary(fileName, filePath);

      res.status(200).json({
        message: "Resume uploaded successfully",
        fileUrl: uploadedFile.secure_url,
      });
    } catch (uploadError) {
      console.error(uploadError);
      res.status(500).json({ error: "Error uploading file to Cloudinary" });
    }
  });
};
