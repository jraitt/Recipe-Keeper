import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { uploadSingle, processUploadedImage, getFileUrl } from '../middleware/upload';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const uploadDir = path.join(__dirname, '../../uploads');

// Upload endpoint
router.post('/', authenticateToken, uploadSingle, processUploadedImage, (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const fileUrl = getFileUrl(req.file.filename);
    
    return res.json({
      success: true,
      data: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      error: 'Upload failed'
    });
  }
});

// Serve uploaded files
router.get('/:filename', (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(uploadDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    
    // Send file
    return res.sendFile(filepath);
  } catch (error) {
    console.error('File serving error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error serving file'
    });
  }
});

export default router;