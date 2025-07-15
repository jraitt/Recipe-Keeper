import { create } from 'zustand';
import { Recipe } from '../types';
import { recipeService, CreateRecipeRequest } from '../services/recipe';

interface RecipeState {
  recipes: Recipe[];
  currentRecipe: Recipe | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  searchQuery: string;
  selectedTags: string[];
  
  // Actions
  fetchRecipes: (params?: { page?: number; search?: string; tags?: string[] }) => Promise<void>;
  fetchRecipe: (id: string) => Promise<void>;
  createRecipe: (recipeData: CreateRecipeRequest) => Promise<Recipe>;
  updateRecipe: (id: string, recipeData: Partial<CreateRecipeRequest>) => Promise<Recipe>;
  deleteRecipe: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  clearCurrentRecipe: () => void;
  clearError: () => void;
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: [],
  currentRecipe: null,
  isLoading: false,
  error: null,
  pagination: null,
  searchQuery: '',
  selectedTags: [],

  fetchRecipes: async (params) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await recipeService.getRecipes({
        page: params?.page || 1,
        limit: 20,
        search: params?.search || get().searchQuery,
        tags: params?.tags || get().selectedTags,
      });

      if (response.success) {
        set({
          recipes: response.data.recipes,
          pagination: response.data.pagination,
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch recipes',
        isLoading: false,
      });
    }
  },

  fetchRecipe: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await recipeService.getRecipe(id);
      
      if (response.success) {
        set({
          currentRecipe: response.data.recipe,
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch recipe',
        isLoading: false,
      });
    }
  },

  createRecipe: async (recipeData: CreateRecipeRequest) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await recipeService.createRecipe(recipeData);
      
      if (response.success) {
        const newRecipe = response.data.recipe;
        
        // Add to recipes list
        set((state) => ({
          recipes: [newRecipe, ...state.recipes],
          isLoading: false,
        }));
        
        return newRecipe;
      }
      
      throw new Error('Failed to create recipe');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create recipe';
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  updateRecipe: async (id: string, recipeData: Partial<CreateRecipeRequest>) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await recipeService.updateRecipe(id, recipeData);
      
      if (response.success) {
        const updatedRecipe = response.data.recipe;
        
        // Update in recipes list
        set((state) => ({
          recipes: state.recipes.map(recipe => 
            recipe.id === id ? updatedRecipe : recipe
          ),
          currentRecipe: state.currentRecipe?.id === id ? updatedRecipe : state.currentRecipe,
          isLoading: false,
        }));
        
        return updatedRecipe;
      }
      
      throw new Error('Failed to update recipe');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update recipe';
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  deleteRecipe: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await recipeService.deleteRecipe(id);
      
      // Remove from recipes list
      set((state) => ({
        recipes: state.recipes.filter(recipe => recipe.id !== id),
        currentRecipe: state.currentRecipe?.id === id ? null : state.currentRecipe,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to delete recipe',
        isLoading: false,
      });
      throw error;
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setSelectedTags: (tags: string[]) => {
    set({ selectedTags: tags });
  },

  clearCurrentRecipe: () => {
    set({ currentRecipe: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));