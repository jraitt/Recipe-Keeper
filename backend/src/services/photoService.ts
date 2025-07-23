import { createApi } from 'unsplash-js';
import { logger } from '../utils/logger';

interface PhotoSuggestion {
  id: string;
  url: string;
  thumbnailUrl: string;
  description: string;
  photographer: string;
  photographerUrl: string;
}

class PhotoService {
  private unsplash;
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = !!process.env.UNSPLASH_ACCESS_KEY;
    
    if (this.isEnabled) {
      this.unsplash = createApi({
        accessKey: process.env.UNSPLASH_ACCESS_KEY!,
      });
    } else {
      logger.info('Unsplash API not configured - photo suggestions disabled');
    }
  }

  /**
   * Generate search terms from recipe title and ingredients using AI
   */
  private generateSearchTerms(title: string, ingredients: string[]): string[] {
    const searchTerms = [];
    
    // Add the main recipe title
    searchTerms.push(title);
    
    // Extract main ingredients (first few words, common food items)
    const mainIngredients = ingredients
      .slice(0, 3) // Take first 3 ingredients
      .map(ingredient => {
        // Extract the main ingredient name (remove quantities/adjectives)
        const match = ingredient.match(/\b(chicken|beef|salmon|pasta|rice|bread|cheese|tomato|onion|garlic|mushroom|pepper|broccoli|carrot|potato|egg|flour|butter|oil|milk|cream|yogurt|chocolate|vanilla|strawberry|apple|banana|lemon)\b/i);
        return match ? match[0] : null;
      })
      .filter(Boolean);
    
    searchTerms.push(...mainIngredients);
    
    // Add generic food terms
    searchTerms.push('food', 'dish', 'meal');
    
    return searchTerms;
  }

  /**
   * Search for photos based on recipe data
   */
  async findPhotosForRecipe(title: string, ingredients: string[] = []): Promise<PhotoSuggestion[]> {
    if (!this.isEnabled) {
      logger.warn('Unsplash API not configured - returning empty photo suggestions');
      return [];
    }

    try {
      const searchTerms = this.generateSearchTerms(title, ingredients);
      const searchQuery = searchTerms.slice(0, 3).join(' '); // Limit query length
      
      logger.info(`Searching Unsplash for photos: "${searchQuery}"`);
      
      const result = await this.unsplash.search.getPhotos({
        query: searchQuery,
        page: 1,
        perPage: 5,
        orientation: 'landscape'
      });

      if (result.type === 'error') {
        logger.error('Unsplash API error:', result.errors);
        return [];
      }

      const photos = result.response.results.map(photo => ({
        id: photo.id,
        url: photo.urls.regular,
        thumbnailUrl: photo.urls.small,
        description: photo.alt_description || photo.description || title,
        photographer: photo.user.name,
        photographerUrl: photo.user.links.html
      }));

      logger.info(`Found ${photos.length} photo suggestions for "${title}"`);
      return photos;

    } catch (error) {
      logger.error('Error searching for photos:', error);
      return [];
    }
  }

  /**
   * Get fallback photos for when specific search doesn't yield good results
   */
  async getFallbackPhotos(): Promise<PhotoSuggestion[]> {
    if (!this.isEnabled) {
      return [];
    }

    try {
      const result = await this.unsplash.search.getPhotos({
        query: 'delicious food meal',
        page: 1,
        perPage: 5,
        orientation: 'landscape'
      });

      if (result.type === 'error') {
        logger.error('Unsplash API error for fallback photos:', result.errors);
        return [];
      }

      return result.response.results.map(photo => ({
        id: photo.id,
        url: photo.urls.regular,
        thumbnailUrl: photo.urls.small,
        description: photo.alt_description || photo.description || 'Delicious food',
        photographer: photo.user.name,
        photographerUrl: photo.user.links.html
      }));

    } catch (error) {
      logger.error('Error getting fallback photos:', error);
      return [];
    }
  }

  /**
   * Check if photo service is available
   */
  isAvailable(): boolean {
    return this.isEnabled;
  }
}

export const photoService = new PhotoService();
export { PhotoSuggestion };