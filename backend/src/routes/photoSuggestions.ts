import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { photoService } from '../services/photoService';
import { imageDownloadService } from '../services/imageDownloadService';
import { logger } from '../utils/logger';

const router = Router();

// Get photo suggestions for a recipe
router.post('/suggest', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { title, ingredients } = req.body;

    if (!title || typeof title !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Recipe title is required'
      });
    }

    if (!photoService.isAvailable()) {
      return res.json({
        success: true,
        data: {
          photos: [],
          message: 'Photo suggestions are not available (Unsplash API not configured)'
        }
      });
    }

    logger.info(`Searching for photo suggestions for recipe: "${title}"`);

    // Try to find photos based on recipe
    let photos = await photoService.findPhotosForRecipe(title, ingredients || []);

    // If no good results, try fallback search
    if (photos.length === 0) {
      logger.info('No specific photos found, trying fallback search');
      photos = await photoService.getFallbackPhotos();
    }

    return res.json({
      success: true,
      data: {
        photos,
        message: photos.length > 0 ? 'Photo suggestions found' : 'No photo suggestions available'
      }
    });

  } catch (error) {
    logger.error('Error getting photo suggestions:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get photo suggestions'
    });
  }
});

// Download and store a selected photo locally
router.post('/download', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { photoUrl, recipeTitle } = req.body;

    if (!photoUrl || typeof photoUrl !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Photo URL is required'
      });
    }

    logger.info(`Downloading selected photo: ${photoUrl}`);

    const localImageUrl = await imageDownloadService.downloadAndStoreImage(photoUrl, recipeTitle);

    if (!localImageUrl) {
      return res.status(500).json({
        success: false,
        error: 'Failed to download and store photo'
      });
    }

    return res.json({
      success: true,
      data: {
        localUrl: localImageUrl,
        originalUrl: photoUrl
      }
    });

  } catch (error) {
    logger.error('Error downloading photo:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to download photo'
    });
  }
});

export default router;