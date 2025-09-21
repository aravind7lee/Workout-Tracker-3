// backend/middleware/upload.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gymtracker-profiles",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "bmp", "tiff", "webp", "svg", "ico", "heic", "avif"],
    transformation: [
      { width: 800, height: 800, crop: "fill", quality: "auto" },
      { fetch_format: "auto" }
    ],
    resource_type: "image",
    public_id: (req, file) => {
      return `profile_${Date.now()}_${Math.round(Math.random() * 1E9)}`;
    }
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('📁 File received:', file.originalname, file.mimetype, file.size);
    
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

export default upload;