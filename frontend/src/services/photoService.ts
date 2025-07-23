import { api } from './api';

export interface PhotoSuggestion {
  id: string;
  url: string;
  thumbnailUrl: string;
  description: string;
  photographer: string;
  photographerUrl: string;
}

export interface PhotoSuggestionsResponse {
  photos: PhotoSuggestion[];
  message: string;
}

class PhotoSuggestionService {
  async getPhotoSuggestions(title: string, ingredients?: string[]): Promise<PhotoSuggestionsResponse> {
    try {
      const response = await api.post<{success: boolean; data: PhotoSuggestionsResponse}>('/photos/suggest', {
        title,
        ingredients
      });
      return response.data.data || { photos: [], message: 'No data received' };
    } catch (error) {
      console.error('Error fetching photo suggestions:', error);
      return {
        photos: [],
        message: 'Failed to load photo suggestions'
      };
    }
  }

  async downloadPhoto(photoUrl: string, recipeTitle?: string): Promise<{success: boolean; localUrl?: string; originalUrl?: string}> {
    try {
      const response = await api.post<{success: boolean; data: {localUrl: string; originalUrl: string}}>('/photos/download', {
        photoUrl,
        recipeTitle
      });
      
      return {
        success: response.data.success,
        localUrl: response.data.data?.localUrl,
        originalUrl: response.data.data?.originalUrl
      };
    } catch (error) {
      console.error('Error downloading photo:', error);
      return {
        success: false
      };
    }
  }
}

export const photoSuggestionService = new PhotoSuggestionService();