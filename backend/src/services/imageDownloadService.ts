import axios from 'axios';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { logger } from '../utils/logger';

class ImageDownloadService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads');
    
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Download an image from a URL and store it locally
   */
  async downloadAndStoreImage(imageUrl: string, recipeTitle?: string): Promise<string | null> {
    if (!imageUrl || !this.isValidImageUrl(imageUrl)) {
      logger.warn(`Invalid image URL provided: ${imageUrl}`);
      return null;
    }

    try {
      logger.info(`Downloading image from: ${imageUrl}`);

      // Generate a unique filename
      const timestamp = Date.now();
      const randomSuffix = Math.round(Math.random() * 1E9);
      const sanitizedTitle = recipeTitle 
        ? this.sanitizeFilename(recipeTitle).substring(0, 30)
        : 'recipe';
      const filename = `${sanitizedTitle}-${timestamp}-${randomSuffix}.webp`;
      const filepath = path.join(this.uploadDir, filename);

      // Download the image with proper headers
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Recipe-Keeper/1.0 (Recipe management application)',
          'Accept': 'image/*',
        },
        timeout: 30000, // 30 second timeout
        maxContentLength: 15 * 1024 * 1024, // 15MB max
      });

      // Validate content type
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.startsWith('image/')) {
        logger.warn(`Invalid content type for image: ${contentType}`);
        return null;
      }

      // Process and optimize the image with Sharp
      await sharp(Buffer.from(response.data))
        .resize(800, 600, { 
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: 80 })
        .toFile(filepath);

      const relativeUrl = `/api/uploads/${filename}`;
      logger.info(`Image successfully downloaded and stored: ${relativeUrl}`);
      
      return relativeUrl;

    } catch (error) {
      logger.error(`Failed to download and store image from ${imageUrl}:`, error);
      
      // Log specific error types for debugging
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          logger.error('Image download timed out');
        } else if (error.response?.status) {
          logger.error(`Image download failed with status: ${error.response.status}`);
        }
      }
      
      return null;
    }
  }

  /**
   * Download multiple images (for recipes with multiple photos)
   */
  async downloadMultipleImages(imageUrls: string[], recipeTitle?: string): Promise<string[]> {
    const downloadPromises = imageUrls.map((url, index) => 
      this.downloadAndStoreImage(url, `${recipeTitle}-${index + 1}`)
    );

    const results = await Promise.allSettled(downloadPromises);
    
    return results
      .map((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          return result.value;
        } else {
          logger.warn(`Failed to download image ${index + 1} from ${imageUrls[index]}`);
          return null;
        }
      })
      .filter((url): url is string => url !== null);
  }

  /**
   * Check if URL appears to be a valid image URL
   */
  private isValidImageUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      
      // Check protocol
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return false;
      }

      // Check for common image extensions (optional, many URLs don't have extensions)
      const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;
      const hasImageExtension = imageExtensions.test(parsedUrl.pathname);
      
      // Allow URLs without extensions (many CDNs serve images without file extensions)
      return true;
      
    } catch (error) {
      return false;
    }
  }

  /**
   * Sanitize filename for safe storage
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Check if an image exists locally
   */
  imageExists(relativeUrl: string): boolean {
    if (!relativeUrl.startsWith('/api/uploads/')) {
      return false;
    }
    
    const filename = relativeUrl.replace('/api/uploads/', '');
    const filepath = path.join(this.uploadDir, filename);
    
    return fs.existsSync(filepath);
  }

  /**
   * Delete a local image file
   */
  deleteImage(relativeUrl: string): boolean {
    try {
      if (!relativeUrl.startsWith('/api/uploads/')) {
        return false;
      }
      
      const filename = relativeUrl.replace('/api/uploads/', '');
      const filepath = path.join(this.uploadDir, filename);
      
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        logger.info(`Deleted image: ${relativeUrl}`);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error(`Failed to delete image ${relativeUrl}:`, error);
      return false;
    }
  }
}

export const imageDownloadService = new ImageDownloadService();