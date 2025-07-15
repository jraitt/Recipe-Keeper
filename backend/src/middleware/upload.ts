import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, uploadDir);
  },
  filename: (_, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// File filter to accept only images
const fileFilter = (_: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only allow 1 file per upload
  }
});

// Middleware to process uploaded image
const processImage = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next();
  }

  try {
    const originalPath = req.file.path;
    const filename = req.file.filename;
    const nameWithoutExt = path.parse(filename).name;
    
    // Process and optimize the image
    const processedPath = path.join(uploadDir, `${nameWithoutExt}-processed.webp`);
    
    await sharp(originalPath)
      .resize(800, 600, { 
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 80 })
      .toFile(processedPath);

    // Delete original file
    fs.unlinkSync(originalPath);
    
    // Update file info
    req.file.path = processedPath;
    req.file.filename = `${nameWithoutExt}-processed.webp`;
    req.file.mimetype = 'image/webp';
    
    next();
  } catch (error) {
    console.error('Error processing image:', error);
    // Clean up files on error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ 
      success: false, 
      error: 'Error processing image' 
    });
  }
};

// Export middleware functions
export const uploadSingle = upload.single('image');
export const processUploadedImage = processImage;

// Helper function to delete file
export const deleteFile = (filepath: string) => {
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
};

// Helper function to get file URL
export const getFileUrl = (filename: string) => {
  return `/api/uploads/${filename}`;
};