import { api } from './api';

interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  rateLimitStatus?: {
    minuteRemaining: number;
    dayRemaining: number;
  };
}

interface ImportedRecipe {
  title: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  ingredients: Array<{
    quantity: string;
    unit: string;
    item: string;
  }>;
  directions: Array<{
    step: number;
    instruction: string;
  }>;
  nutrition?: {
    calories?: number;
    protein?: number;
    carbohydrates?: number;
    fat?: number;
    fiber?: number;
    sodium?: number;
  };
  tags?: string[];
  imageUrl?: string;
  confidence: number;
  aiGenerated: boolean;
  generatedAt: string;
}

export const aiService = {
  /**
   * Import recipe from photo
   */
  async importFromPhoto(file: File): Promise<ImportedRecipe> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post<AIResponse>('/ai/import/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to import recipe from photo');
    }

    return response.data.data as ImportedRecipe;
  },

  /**
   * Import recipe from URL
   */
  async importFromUrl(url: string): Promise<ImportedRecipe> {
    const response = await api.post<AIResponse>('/ai/import/url', {
      url,
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to import recipe from URL');
    }

    return response.data.data as ImportedRecipe;
  },

  /**
   * Get current rate limit status
   */
  async getRateLimitStatus(): Promise<{
    minuteRemaining: number;
    dayRemaining: number;
  }> {
    const response = await api.get<AIResponse>('/ai/import/rate-limit');

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to get rate limit status');
    }

    return response.data.data;
  },

  /**
   * Check if AI import is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const rateLimitStatus = await this.getRateLimitStatus();
      return rateLimitStatus.minuteRemaining > 0 && rateLimitStatus.dayRemaining > 0;
    } catch (error) {
      console.error('Failed to check AI availability:', error);
      return false;
    }
  },

  /**
   * Convert imported recipe to our Recipe format
   */
  convertToRecipe(importedRecipe: ImportedRecipe): Omit<any, 'id' | 'userId' | 'createdAt' | 'updatedAt'> {
    return {
      title: importedRecipe.title,
      servings: importedRecipe.servings,
      prepTime: importedRecipe.prepTime,
      cookTime: importedRecipe.cookTime,
      difficulty: importedRecipe.difficulty,
      ingredients: importedRecipe.ingredients,
      directions: importedRecipe.directions,
      nutrition: importedRecipe.nutrition || {},
      tags: importedRecipe.tags || [],
      photoUrl: importedRecipe.imageUrl || '', // Use extracted image URL
      // rating: 0 - Don't set rating initially, user will set this later
      aiGenerated: true,
      confidence: importedRecipe.confidence,
      generatedAt: importedRecipe.generatedAt
    };
  },

  /**
   * Validate imported recipe data
   */
  validateImportedRecipe(recipe: ImportedRecipe): string[] {
    const errors: string[] = [];

    if (!recipe.title || recipe.title.trim().length === 0) {
      errors.push('Recipe title is required');
    }

    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      errors.push('Recipe must have at least one ingredient');
    }

    if (!recipe.directions || recipe.directions.length === 0) {
      errors.push('Recipe must have at least one direction');
    }

    if (recipe.confidence < 30) {
      errors.push('AI confidence is too low, please review the extracted information');
    }

    return errors;
  },

  /**
   * Get confidence level description
   */
  getConfidenceDescription(confidence: number): string {
    if (confidence >= 90) return 'Excellent';
    if (confidence >= 80) return 'Very Good';
    if (confidence >= 70) return 'Good';
    if (confidence >= 60) return 'Fair';
    if (confidence >= 50) return 'Poor';
    return 'Very Poor';
  },

  /**
   * Get confidence level color
   */
  getConfidenceColor(confidence: number): string {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }
};

export type { ImportedRecipe, AIResponse };