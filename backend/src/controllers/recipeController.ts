import { Request, Response } from 'express';
import { recipeService } from '../services/recipeService';
import { CreateRecipeRequest } from '../types/recipe';
import { AuthenticatedRequest } from '../types/auth';

export class RecipeController {
  
  /**
   * Create a new recipe
   * POST /api/recipes
   */
  async createRecipe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const recipeData: CreateRecipeRequest = req.body;

      // Validate required fields
      if (!recipeData.title || !recipeData.ingredients || !recipeData.directions) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: title, ingredients, directions',
        });
        return;
      }

      // Provide default values for optional fields
      if (!recipeData.photoUrl) {
        recipeData.photoUrl = '';
      }
      
      // Set default visibility if not provided
      if (!recipeData.visibility) {
        recipeData.visibility = 'private';
      }

      // Validate visibility
      if (recipeData.visibility && !['private', 'public'].includes(recipeData.visibility)) {
        res.status(400).json({
          success: false,
          error: 'Visibility must be either "private" or "public"',
        });
        return;
      }

      // Validate ingredients format
      if (!Array.isArray(recipeData.ingredients) || recipeData.ingredients.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Ingredients must be a non-empty array',
        });
        return;
      }

      // Validate directions format
      if (!Array.isArray(recipeData.directions) || recipeData.directions.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Directions must be a non-empty array',
        });
        return;
      }

      // Convert string values to numbers if needed
      if (recipeData.servings !== undefined) {
        recipeData.servings = typeof recipeData.servings === 'string' ? 
          parseInt(recipeData.servings) : recipeData.servings;
      }
      if (recipeData.prepTime !== undefined) {
        recipeData.prepTime = typeof recipeData.prepTime === 'string' ? 
          parseInt(recipeData.prepTime) : recipeData.prepTime;
      }
      if (recipeData.cookTime !== undefined) {
        recipeData.cookTime = typeof recipeData.cookTime === 'string' ? 
          parseInt(recipeData.cookTime) : recipeData.cookTime;
      }
      if (recipeData.rating !== undefined) {
        recipeData.rating = typeof recipeData.rating === 'string' ? 
          parseFloat(recipeData.rating) : recipeData.rating;
      }

      // Validate rating if provided
      if (recipeData.rating !== undefined && (recipeData.rating < 0 || recipeData.rating > 5)) {
        res.status(400).json({
          success: false,
          error: 'Rating must be between 0 and 5',
        });
        return;
      }

      const recipe = await recipeService.createRecipe(userId, recipeData);

      res.status(201).json({
        success: true,
        data: { recipe },
        message: 'Recipe created successfully',
      });
    } catch (error: any) {
      console.error('Error creating recipe:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create recipe',
      });
    }
  }

  /**
   * Get all recipes for the authenticated user
   * GET /api/recipes
   */
  async getUserRecipes(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100); // Max 100 per page
      const search = req.query.search as string;
      const tags = req.query.tags ? (req.query.tags as string).split(',') : undefined;

      const result = await recipeService.getUserRecipes(userId, page, limit, search, tags);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Error fetching user recipes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch recipes',
      });
    }
  }

  /**
   * Get a single recipe by ID
   * GET /api/recipes/:id
   */
  async getRecipeById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const recipeId = req.params.id;

      if (!recipeId) {
        res.status(400).json({
          success: false,
          error: 'Recipe ID is required',
        });
        return;
      }

      const recipe = await recipeService.getRecipeById(recipeId, userId);

      if (!recipe) {
        res.status(404).json({
          success: false,
          error: 'Recipe not found',
        });
        return;
      }

      res.json({
        success: true,
        data: { recipe },
      });
    } catch (error: any) {
      console.error('Error fetching recipe:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch recipe',
      });
    }
  }

  /**
   * Update a recipe
   * PUT /api/recipes/:id
   */
  async updateRecipe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const recipeId = req.params.id;
      const updateData = req.body;

      // Debug logging for visibility updates
      console.log('Recipe update received:', { recipeId, visibility: updateData.visibility, hasVisibility: 'visibility' in updateData });

      if (!recipeId) {
        res.status(400).json({
          success: false,
          error: 'Recipe ID is required',
        });
        return;
      }

      // Validate rating if provided in update
      if (updateData.rating !== undefined && (updateData.rating < 1 || updateData.rating > 5)) {
        res.status(400).json({
          success: false,
          error: 'Rating must be between 1 and 5',
        });
        return;
      }

      // Validate visibility if provided in update
      if (updateData.visibility && !['private', 'public'].includes(updateData.visibility)) {
        res.status(400).json({
          success: false,
          error: 'Visibility must be either "private" or "public"',
        });
        return;
      }

      const updatedRecipe = await recipeService.updateRecipe(recipeId, userId, updateData);

      if (!updatedRecipe) {
        res.status(404).json({
          success: false,
          error: 'Recipe not found',
        });
        return;
      }

      res.json({
        success: true,
        data: { recipe: updatedRecipe },
        message: 'Recipe updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating recipe:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update recipe',
      });
    }
  }

  /**
   * Delete a recipe (soft delete)
   * DELETE /api/recipes/:id
   */
  async deleteRecipe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const recipeId = req.params.id;

      if (!recipeId) {
        res.status(400).json({
          success: false,
          error: 'Recipe ID is required',
        });
        return;
      }

      const deleted = await recipeService.deleteRecipe(recipeId, userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Recipe not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Recipe deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting recipe:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete recipe',
      });
    }
  }

  /**
   * Get recipe statistics for user
   * GET /api/recipes/stats
   */
  async getUserStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const stats = await recipeService.getUserRecipeStats(userId);

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error: any) {
      console.error('Error fetching recipe stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch recipe statistics',
      });
    }
  }

  /**
   * Get all public recipes (excluding current user's recipes)
   * GET /api/recipes/public
   */
  async getPublicRecipes(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUserId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const search = req.query.search as string;
      const tags = req.query.tags ? (req.query.tags as string).split(',') : undefined;

      const result = await recipeService.getPublicRecipes(page, limit, search, tags, currentUserId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Error fetching public recipes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch public recipes',
      });
    }
  }

  /**
   * Search public recipes
   * GET /api/recipes/search/public
   */
  async searchPublicRecipes(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUserId = req.user!.id;
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

      if (!query) {
        res.status(400).json({
          success: false,
          error: 'Search query is required',
        });
        return;
      }

      const result = await recipeService.searchPublicRecipes(query, page, limit, currentUserId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Error searching public recipes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search recipes',
      });
    }
  }
}

export const recipeController = new RecipeController();