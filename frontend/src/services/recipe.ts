import api from './api';
import { Recipe } from '../types';

export interface CreateRecipeRequest {
  title: string;
  rating?: number;
  photoUrl: string;
  sourceUrl?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: string;
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
}

export interface RecipeListResponse {
  success: boolean;
  data: {
    recipes: Recipe[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface RecipeResponse {
  success: boolean;
  data: {
    recipe: Recipe;
  };
}

export interface RecipeStatsResponse {
  success: boolean;
  data: {
    stats: {
      totalRecipes: number;
      averageRating: number;
      byDifficulty: Record<string, number>;
    };
  };
}

export const recipeService = {
  // Get all recipes for user
  async getRecipes(params?: {
    page?: number;
    limit?: number;
    search?: string;
    tags?: string[];
  }): Promise<RecipeListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.tags?.length) searchParams.append('tags', params.tags.join(','));

    const response = await api.get<RecipeListResponse>(`/recipes?${searchParams}`);
    return response.data;
  },

  // Get single recipe by ID
  async getRecipe(id: string): Promise<RecipeResponse> {
    const response = await api.get<RecipeResponse>(`/recipes/${id}`);
    return response.data;
  },

  // Create new recipe
  async createRecipe(recipeData: CreateRecipeRequest): Promise<RecipeResponse> {
    const response = await api.post<RecipeResponse>('/recipes', recipeData);
    return response.data;
  },

  // Update existing recipe
  async updateRecipe(id: string, recipeData: Partial<CreateRecipeRequest>): Promise<RecipeResponse> {
    const response = await api.put<RecipeResponse>(`/recipes/${id}`, recipeData);
    return response.data;
  },

  // Delete recipe
  async deleteRecipe(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/recipes/${id}`);
    return response.data;
  },

  // Get user recipe statistics
  async getStats(): Promise<RecipeStatsResponse> {
    const response = await api.get<RecipeStatsResponse>('/recipes/stats');
    return response.data;
  },

  // Search public recipes (future feature)
  async searchPublicRecipes(query: string, page?: number, limit?: number): Promise<RecipeListResponse> {
    const searchParams = new URLSearchParams({ q: query });
    if (page) searchParams.append('page', page.toString());
    if (limit) searchParams.append('limit', limit.toString());

    const response = await api.get<RecipeListResponse>(`/recipes/search/public?${searchParams}`);
    return response.data;
  },
};