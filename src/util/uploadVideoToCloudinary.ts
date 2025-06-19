import { v2 as cloudinary } from "cloudinary";
import config from "../config";
import multer from "multer";
import fs from "fs/promises";
import path from "path";

export const deleteFile = async (filePath: string) => {
  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
    console.log(`File deleted successfully: ${filePath}`);
  } catch (err: any) {
    console.error(`Error deleting file: ${err.message}`);
  }
};

export const uploadVideoToCloudinary = async (name: string, filePath: string) => {
    cloudinary.config({
      cloud_name: config.CLOUDNAME,
      api_key: config.APIkEY,
      api_secret: config.APISECRET,
    });
  
    try {
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        public_id: `tips/${name}-${Date.now()}`,
        resource_type: "video",
      });
  
      await deleteFile(filePath);
      return uploadResult;
    } catch (error) {
      console.error("Error uploading video to Cloudinary:", error);
      await deleteFile(filePath);
      throw new Error("Video upload failed");
    }
  };
  

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(process.cwd(), "uploads"));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  });
  
  export const uploadVideo = multer({
    storage,
    fileFilter: (req, file, cb) => {
      const allowedTypes = ["video/mp4", "video/webm", "video/ogg"];
      if (!allowedTypes.includes(file.mimetype)) {
        cb(new Error("Only video files are allowed!") as any, false);
        return;
      }
      cb(null, true);
    },
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB
    },
  });
  