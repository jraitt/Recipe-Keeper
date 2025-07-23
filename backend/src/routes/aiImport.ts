import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth';
import { uploadSingle, uploadMultiple } from '../middleware/upload';
import { geminiService } from '../services/geminiService';
import { imageDownloadService } from '../services/imageDownloadService';
import { logger } from '../utils/logger';
import fs from 'fs';
import sharp from 'sharp';
import axios from 'axios';
import { JSDOM } from 'jsdom';

const router = Router();

console.log('DEBUG: aiImport router created');

// Test route to verify aiImport module is working
router.get('/test', (_req: Request, res: Response) => {
  logger.info('DEBUG: Test route hit');
  res.json({ success: true, message: 'AI Import module is working' });
});

// Debug route to test frontend connectivity
router.post('/debug', (req: Request, res: Response) => {
  console.log('DEBUG: /debug route hit');
  console.log('DEBUG: Headers:', req.headers);
  console.log('DEBUG: Body:', req.body);
  res.json({ 
    success: true, 
    message: 'Debug route hit successfully',
    headers: req.headers,
    body: req.body,
    url: req.url,
    method: req.method
  });
});

// Image preprocessing middleware
const preprocessImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
      return;
    }

    const inputPath = req.file.path;
    const outputPath = inputPath.replace(/\.[^/.]+$/, '-processed.jpg');

    // Process image for AI analysis
    await sharp(inputPath)
      .resize(1024, 1024, { 
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toFile(outputPath);

    // Read processed image as buffer
    const imageBuffer = fs.readFileSync(outputPath);
    
    // Attach buffer to request
    req.imageBuffer = imageBuffer;

    // Clean up files
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    next();
  } catch (error) {
    logger.error('Image preprocessing failed:', error);
    
    // Clean up files on error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to process image'
    });
    return;
  }
};

// Multi-image preprocessing middleware
const preprocessMultipleImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('DEBUG: preprocessMultipleImages called');
    console.log('DEBUG: req.files:', req.files);
    console.log('DEBUG: req.files type:', typeof req.files);
    console.log('DEBUG: req.files length:', req.files ? (req.files as any).length : 'undefined');
    
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      console.log('DEBUG: No files provided, returning 400');
      res.status(400).json({
        success: false,
        error: 'No image files provided'
      });
      return;
    }

    const imageBuffers: Buffer[] = [];
    const tempFiles: string[] = [];

    for (const file of req.files) {
      const inputPath = file.path;
      const outputPath = inputPath.replace(/\.[^/.]+$/, '-processed.jpg');
      tempFiles.push(inputPath, outputPath);

      // Process image for AI analysis
      await sharp(inputPath)
        .resize(1024, 1024, { 
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toFile(outputPath);

      // Read processed image as buffer
      const imageBuffer = fs.readFileSync(outputPath);
      imageBuffers.push(imageBuffer);
    }

    // Attach buffers to request
    req.imageBuffers = imageBuffers;

    // Clean up files
    tempFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });

    next();
  } catch (error) {
    logger.error('Multi-image preprocessing failed:', error);
    
    // Clean up files on error
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach(file => {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    // Provide better error messages for common issues
    let errorMessage = 'Failed to process images';
    if (error instanceof Error) {
      if (error.message.includes('unsupported image format')) {
        errorMessage = 'Please upload valid image files (JPG, PNG, WEBP)';
      } else if (error.message.includes('Input file is missing')) {
        errorMessage = 'No image files received';
      } else if (error.message.includes('too large')) {
        errorMessage = 'Image files are too large (max 15MB each)';
      }
    }
    
    res.status(400).json({
      success: false,
      error: errorMessage
    });
    return;
  }
};

// Import recipe from photo
router.post('/photo', authenticateToken, uploadSingle, preprocessImage, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required'
      });
    }

    const imageBuffer = req.imageBuffer;
    if (!imageBuffer) {
      return res.status(400).json({
        success: false,
        error: 'Image processing failed'
      });
    }

    logger.info(`Processing photo import for user ${userId}`);

    // Check rate limits
    const rateLimitStatus = geminiService.getRateLimitStatus(userId);
    if (rateLimitStatus.minuteRemaining <= 0 || rateLimitStatus.dayRemaining <= 0) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
        rateLimitStatus
      });
    }

    // Analyze photo with Gemini
    const analysisResult = await geminiService.analyzeRecipeFromPhoto(imageBuffer, userId);

    // Check confidence level
    if (analysisResult.confidence < 50) {
      return res.status(400).json({
        success: false,
        error: 'Could not reliably identify a recipe in this image',
        confidence: analysisResult.confidence,
        rateLimitStatus: geminiService.getRateLimitStatus(userId)
      });
    }

    logger.info(`Photo analysis completed for user ${userId} with confidence ${analysisResult.confidence}%`);

    return res.json({
      success: true,
      data: analysisResult,
      rateLimitStatus: geminiService.getRateLimitStatus(userId)
    });

  } catch (error) {
    logger.error('Photo import failed:', error);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Photo analysis failed',
      rateLimitStatus: geminiService.getRateLimitStatus(req.user?.id || 'unknown')
    });
  }
});

// Import recipe from multiple photos
router.post('/photos', authenticateToken, uploadMultiple, preprocessMultipleImages, async (req: Request, res: Response) => {
  try {
    console.log('DEBUG: /photos route handler called');
    logger.info('DEBUG: Starting multi-photo import handler');
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required'
      });
    }

    const imageBuffers = req.imageBuffers;
    if (!imageBuffers || imageBuffers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Image processing failed'
      });
    }

    logger.info(`Processing multi-photo import for user ${userId} with ${imageBuffers.length} images`);

    // Check rate limits
    const rateLimitStatus = geminiService.getRateLimitStatus(userId);
    if (rateLimitStatus.minuteRemaining <= 0 || rateLimitStatus.dayRemaining <= 0) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
        rateLimitStatus
      });
    }

    // Analyze photos with Gemini
    const analysisResult = await geminiService.analyzeRecipeFromMultiplePhotos(imageBuffers, userId);

    // Check confidence level
    if (analysisResult.confidence < 50) {
      return res.status(400).json({
        success: false,
        error: 'Could not reliably identify a recipe in these images',
        confidence: analysisResult.confidence,
        rateLimitStatus: geminiService.getRateLimitStatus(userId)
      });
    }

    logger.info(`Multi-photo analysis completed for user ${userId} with confidence ${analysisResult.confidence}%`);

    return res.json({
      success: true,
      data: analysisResult,
      rateLimitStatus: geminiService.getRateLimitStatus(userId)
    });

  } catch (error) {
    logger.error('Multi-photo import failed:', error);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Multi-photo analysis failed',
      rateLimitStatus: geminiService.getRateLimitStatus(req.user?.id || 'unknown')
    });
  }
});

// Import recipe from URL
router.post('/url', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required'
      });
    }

    const { url } = req.body;
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format'
      });
    }

    logger.info(`Processing URL import for user ${userId}: ${url}`);

    // Check rate limits
    const rateLimitStatus = geminiService.getRateLimitStatus(userId);
    if (rateLimitStatus.minuteRemaining <= 0 || rateLimitStatus.dayRemaining <= 0) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
        rateLimitStatus
      });
    }

    // Fetch webpage content
    const webContent = await fetchWebpageContent(url);
    
    // Analyze content with Gemini
    const analysisResult = await geminiService.analyzeRecipeFromUrl(webContent, userId, url);

    // Check confidence level
    if (analysisResult.confidence < 50) {
      return res.status(400).json({
        success: false,
        error: 'Could not reliably extract a recipe from this URL',
        confidence: analysisResult.confidence,
        rateLimitStatus: geminiService.getRateLimitStatus(userId)
      });
    }

    logger.info(`URL analysis completed for user ${userId} with confidence ${analysisResult.confidence}%`);

    // Download and store the recipe image locally if available
    if (analysisResult.imageUrl) {
      logger.info(`Downloading recipe image from: ${analysisResult.imageUrl}`);
      const localImageUrl = await imageDownloadService.downloadAndStoreImage(
        analysisResult.imageUrl, 
        analysisResult.title
      );
      
      if (localImageUrl) {
        logger.info(`Recipe image stored locally: ${localImageUrl}`);
        analysisResult.imageUrl = localImageUrl;
      } else {
        logger.warn(`Failed to download recipe image, keeping original URL: ${analysisResult.imageUrl}`);
        // Keep the original URL as fallback
      }
    }

    // Add the source URL to the analysis result
    analysisResult.sourceUrl = url;
    logger.info(`Added source URL to analysis result: ${url}`);

    return res.json({
      success: true,
      data: analysisResult,
      rateLimitStatus: geminiService.getRateLimitStatus(userId)
    });

  } catch (error) {
    logger.error('URL import failed:', error);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'URL analysis failed',
      rateLimitStatus: geminiService.getRateLimitStatus(req.user?.id || 'unknown')
    });
  }
});

// Get rate limit status
router.get('/rate-limit', authenticateToken, (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'User authentication required'
    });
  }

  const rateLimitStatus = geminiService.getRateLimitStatus(userId);
  
  return res.json({
    success: true,
    data: rateLimitStatus
  });
});

// Fetch webpage content
async function fetchWebpageContent(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // Parse HTML content
    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    // Try to extract structured data first
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
    let structuredData = '';
    
    for (const script of jsonLdScripts) {
      try {
        const data = JSON.parse(script.textContent || '');
        if (data['@type'] === 'Recipe' || data.recipe) {
          structuredData = JSON.stringify(data, null, 2);
          break;
        }
      } catch {
        // Continue if JSON parsing fails
      }
    }

    // Extract text content
    const title = document.querySelector('title')?.textContent || '';
    const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    
    // Extract image URLs
    const imageUrls: string[] = [];
    
    // Try to find recipe images from various sources
    const imageSelectors = [
      'img[src*="recipe"]',
      'img[alt*="recipe"]',
      'article img',
      '.recipe img',
      '[class*="recipe"] img',
      'img[src*="food"]',
      'img[alt*="food"]',
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
      'img[itemprop="image"]',
      'img[data-src]',
      'img[srcset]'
    ];
    
    for (const selector of imageSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        let imageUrl = '';
        
        if (element.tagName === 'META') {
          imageUrl = element.getAttribute('content') || '';
        } else if (element.tagName === 'IMG') {
          imageUrl = element.getAttribute('src') || 
                    element.getAttribute('data-src') || 
                    element.getAttribute('srcset')?.split(',')[0]?.trim().split(' ')[0] || '';
        }
        
        if (imageUrl) {
          // Convert relative URLs to absolute
          if (imageUrl.startsWith('/')) {
            const urlObj = new URL(url);
            imageUrl = `${urlObj.protocol}//${urlObj.host}${imageUrl}`;
          } else if (imageUrl.startsWith('//')) {
            const urlObj = new URL(url);
            imageUrl = `${urlObj.protocol}${imageUrl}`;
          }
          
          // Only add valid URLs
          if (imageUrl.startsWith('http') && !imageUrls.includes(imageUrl)) {
            imageUrls.push(imageUrl);
          }
        }
      }
    }
    
    // Remove script and style elements
    const scripts = document.querySelectorAll('script, style');
    scripts.forEach(el => el.remove());
    
    const bodyText = document.body?.textContent || '';
    
    // Log extracted image URLs for debugging
    logger.info(`Extracted ${imageUrls.length} image URLs from ${url}:`, imageUrls);
    
    // Combine all content
    const content = `
Title: ${title}
Description: ${metaDescription}
${structuredData ? `Structured Data: ${structuredData}` : ''}
${imageUrls.length > 0 ? `Images: ${imageUrls.join(', ')}` : ''}
Content: ${bodyText}
    `.trim();

    return content;
  } catch (error) {
    logger.error('Failed to fetch webpage content:', error);
    throw new Error('Failed to fetch webpage content');
  }
}

// Extend Request interface to include imageBuffer and imageBuffers
declare global {
  namespace Express {
    interface Request {
      imageBuffer?: Buffer;
      imageBuffers?: Buffer[];
    }
  }
}

export default router;