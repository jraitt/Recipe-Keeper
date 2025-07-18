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
    fileSize: 15 * 1024 * 1024, // 15MB limit for large photos
    files: 5 // Allow up to 5 files per upload for multi-photo imports
  }
});

// Add error handling to multer
const uploadMultipleWithErrorHandling = (req: Request, res: Response, next: NextFunction) => {
  console.log('DEBUG: uploadMultiple called');
  console.log('DEBUG: Content-Type:', req.headers['content-type']);
  console.log('DEBUG: Content-Length:', req.headers['content-length']);
  console.log('DEBUG: req.body before multer:', req.body);
  
  const uploadHandler = upload.array('images', 5);
  
  uploadHandler(req, res, (err) => {
    console.log('DEBUG: req.files after upload:', req.files);
    
    if (err) {
      console.error('DEBUG: Upload error:', err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: 'File size too large (max 15MB per file)'
          });
        } else if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            error: 'Too many files (max 5 files)'
          });
        }
      }
      return res.status(400).json({
        success: false,
        error: err.message || 'Upload failed'
      });
    }
    
    next();
  });
};

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

// Middleware to process multiple uploaded images
const processMultipleImages = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    return next();
  }

  try {
    const processedFiles: Express.Multer.File[] = [];
    
    for (const file of req.files) {
      const originalPath = file.path;
      const filename = file.filename;
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
      const processedFile = {
        ...file,
        path: processedPath,
        filename: `${nameWithoutExt}-processed.webp`,
        mimetype: 'image/webp'
      };
      
      processedFiles.push(processedFile);
    }
    
    // Replace files array with processed files
    req.files = processedFiles;
    
    next();
  } catch (error) {
    console.error('Error processing images:', error);
    // Clean up files on error
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach(file => {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Error processing images' 
    });
  }
};

// Export middleware functions
export const uploadSingle = upload.single('image');
export const uploadMultiple = uploadMultipleWithErrorHandling;
export const processUploadedImage = processImage;
export const processMultipleUploadedImages = processMultipleImages;

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