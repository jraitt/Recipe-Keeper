import { PrismaClient } from '@prisma/client';
import { 
  CreateRecipeRequest, 
  RecipeResponse 
} from '../types/recipe';

const prisma = new PrismaClient();

export class RecipeService {
  
  /**
   * Create a new recipe
   */
  async createRecipe(userId: string, recipeData: CreateRecipeRequest): Promise<RecipeResponse> {
    const recipe = await prisma.recipe.create({
      data: {
        title: recipeData.title,
        rating: recipeData.rating,
        photoUrl: recipeData.photoUrl,
        sourceUrl: recipeData.sourceUrl,
        prepTime: recipeData.prepTime,
        cookTime: recipeData.cookTime,
        servings: recipeData.servings,
        difficulty: recipeData.difficulty,
        ingredients: recipeData.ingredients as any,
        directions: recipeData.directions as any,
        nutrition: recipeData.nutrition as any,
        tags: recipeData.tags || [],
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return this.formatRecipeResponse(recipe);
  }

  /**
   * Get all recipes for a user with pagination
   */
  async getUserRecipes(
    userId: string, 
    page: number = 1, 
    limit: number = 20,
    search?: string,
    tags?: string[]
  ) {
    const offset = (page - 1) * limit;

    // If we have search term, use a hybrid approach
    if (search) {
      // First get all user recipes with basic filters
      const allRecipes = await prisma.recipe.findMany({
        where: {
          userId,
          deletedAt: null,
          ...(tags && tags.length > 0 && {
            tags: { hasSome: tags }
          })
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Filter recipes by search term (title, ingredients, or tags)
      const searchLower = search.toLowerCase();
      const filteredRecipes = allRecipes.filter((recipe: any) => {
        // Search in title
        if (recipe.title.toLowerCase().includes(searchLower)) return true;
        
        // Search in tags
        if (recipe.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))) return true;
        
        // Search in ingredients
        if (Array.isArray(recipe.ingredients)) {
          return (recipe.ingredients as any[]).some(ingredient => 
            ingredient.item && ingredient.item.toLowerCase().includes(searchLower)
          );
        }
        
        return false;
      });

      // Apply pagination
      const total = filteredRecipes.length;
      const paginatedRecipes = filteredRecipes.slice(offset, offset + limit);

      return {
        recipes: paginatedRecipes.map((recipe: any) => this.formatRecipeResponse(recipe)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };
    }

    const where: any = {
      userId,
      deletedAt: null,
    };

    // Add search filter for non-ingredient search
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
      ];
    }

    // Add tags filter (case-insensitive)
    if (tags && tags.length > 0) {
      // For case-insensitive matching, we'll get all user recipes first
      // and then filter them programmatically
      const allRecipes = await prisma.recipe.findMany({
        where: {
          userId,
          deletedAt: null,
          ...(search && {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { tags: { hasSome: [search] } },
            ]
          })
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Filter recipes that have matching tags (case-insensitive)
      const filteredRecipes = allRecipes.filter((recipe: any) => 
        tags.some(tag => 
          recipe.tags.some((recipeTag: string) => 
            recipeTag.toLowerCase() === tag.toLowerCase()
          )
        )
      );

      // Apply pagination to filtered results
      const total = filteredRecipes.length;
      const paginatedRecipes = filteredRecipes.slice(offset, offset + limit);

      return {
        recipes: paginatedRecipes.map((recipe: any) => this.formatRecipeResponse(recipe)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };
    }

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.recipe.count({ where }),
    ]);

    return {
      recipes: recipes.map((recipe: any) => this.formatRecipeResponse(recipe)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get a single recipe by ID
   */
  async getRecipeById(recipeId: string, userId: string): Promise<RecipeResponse | null> {
    const recipe = await prisma.recipe.findFirst({
      where: {
        id: recipeId,
        OR: [
          // User can view their own recipes
          { userId },
          // User can view public recipes from others
          { visibility: 'public' }
        ],
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return recipe ? this.formatRecipeResponse(recipe) : null;
  }

  /**
   * Update a recipe
   */
  async updateRecipe(
    recipeId: string, 
    userId: string, 
    updateData: Partial<CreateRecipeRequest>
  ): Promise<RecipeResponse | null> {
    // First check if recipe exists and belongs to user
    const existingRecipe = await prisma.recipe.findFirst({
      where: {
        id: recipeId,
        userId,
        deletedAt: null,
      },
    });

    if (!existingRecipe) {
      return null;
    }

    const updatedRecipe = await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        ...(updateData.title && { title: updateData.title }),
        ...(updateData.rating !== undefined && { rating: updateData.rating }),
        ...(updateData.photoUrl && { photoUrl: updateData.photoUrl }),
        ...(updateData.sourceUrl !== undefined && { sourceUrl: updateData.sourceUrl }),
        ...(updateData.prepTime !== undefined && { prepTime: updateData.prepTime }),
        ...(updateData.cookTime !== undefined && { cookTime: updateData.cookTime }),
        ...(updateData.servings !== undefined && { servings: updateData.servings }),
        ...(updateData.difficulty && { difficulty: updateData.difficulty }),
        ...(updateData.ingredients && { ingredients: updateData.ingredients as any }),
        ...(updateData.directions && { directions: updateData.directions as any }),
        ...(updateData.nutrition !== undefined && { nutrition: updateData.nutrition as any }),
        ...(updateData.tags && { tags: updateData.tags }),
        ...(updateData.visibility && { visibility: updateData.visibility }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return this.formatRecipeResponse(updatedRecipe);
  }

  /**
   * Soft delete a recipe
   */
  async deleteRecipe(recipeId: string, userId: string): Promise<boolean> {
    // First check if recipe exists and belongs to user
    const existingRecipe = await prisma.recipe.findFirst({
      where: {
        id: recipeId,
        userId,
        deletedAt: null,
      },
    });

    if (!existingRecipe) {
      return false;
    }

    await prisma.recipe.update({
      where: { id: recipeId },
      data: { deletedAt: new Date() },
    });

    return true;
  }

  /**
   * Get recipe statistics for a user
   */
  async getUserRecipeStats(userId: string) {
    const stats = await prisma.recipe.groupBy({
      by: ['difficulty'],
      where: {
        userId,
        deletedAt: null,
      },
      _count: {
        id: true,
      },
    });

    const totalRecipes = await prisma.recipe.count({
      where: {
        userId,
        deletedAt: null,
      },
    });

    const avgRating = await prisma.recipe.aggregate({
      where: {
        userId,
        deletedAt: null,
        rating: { not: null },
      },
      _avg: {
        rating: true,
      },
    });

    return {
      totalRecipes,
      averageRating: avgRating._avg.rating || 0,
      byDifficulty: stats.reduce((acc: Record<string, number>, stat: { difficulty: string | null; _count: { id: number } }) => {
        if (stat.difficulty) {
          acc[stat.difficulty] = stat._count.id;
        }
        return acc;
      }, {} as Record<string, number>),
    };
  }

  /**
   * Get all public recipes with pagination and search
   */
  async getPublicRecipes(
    page: number = 1,
    limit: number = 20,
    search?: string,
    tags?: string[],
    excludeUserId?: string
  ) {
    const offset = (page - 1) * limit;

    // If we have search term, use the hybrid approach like getUserRecipes
    if (search) {
      const allRecipes = await prisma.recipe.findMany({
        where: {
          visibility: 'public',
          deletedAt: null,
          ...(excludeUserId && { userId: { not: excludeUserId } }),
          ...(tags && tags.length > 0 && {
            tags: { hasSome: tags }
          })
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Filter recipes by search term (title, ingredients, or tags)
      const searchLower = search.toLowerCase();
      const filteredRecipes = allRecipes.filter((recipe: any) => {
        // Search in title
        if (recipe.title.toLowerCase().includes(searchLower)) return true;
        
        // Search in tags
        if (recipe.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))) return true;
        
        // Search in ingredients
        if (Array.isArray(recipe.ingredients)) {
          return (recipe.ingredients as any[]).some(ingredient => 
            ingredient.item && ingredient.item.toLowerCase().includes(searchLower)
          );
        }
        
        return false;
      });

      // Apply pagination
      const total = filteredRecipes.length;
      const paginatedRecipes = filteredRecipes.slice(offset, offset + limit);

      return {
        recipes: paginatedRecipes.map((recipe: any) => this.formatRecipeResponse(recipe)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };
    }

    // No search term, use direct query
    const where: any = {
      visibility: 'public',
      deletedAt: null,
    };

    // Exclude current user's recipes
    if (excludeUserId) {
      where.userId = { not: excludeUserId };
    }

    // Add tags filter
    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.recipe.count({ where }),
    ]);

    return {
      recipes: recipes.map((recipe: any) => this.formatRecipeResponse(recipe)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Search recipes across all public recipes
   */
  async searchPublicRecipes(
    query: string,
    page: number = 1,
    limit: number = 20,
    excludeUserId?: string
  ) {
    return this.getPublicRecipes(page, limit, query, undefined, excludeUserId);
  }

  /**
   * Admin: Get all recipes from all users with filtering
   */
  async adminGetAllRecipes(
    page: number = 1,
    limit: number = 20,
    userId?: string,
    visibility?: 'public' | 'private',
    search?: string
  ) {
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      deletedAt: null,
    };

    if (userId) {
      where.userId = userId;
    }

    if (visibility) {
      where.visibility = visibility;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.recipe.count({ where }),
    ]);

    return {
      recipes: recipes.map((recipe: any) => this.formatRecipeResponse(recipe)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Format recipe response to match API contract
   */
  private formatRecipeResponse(recipe: any & { user: { id: string; name?: string; email: string; } }): RecipeResponse {
    return {
      id: recipe.id,
      title: recipe.title,
      rating: recipe.rating,
      photoUrl: recipe.photoUrl,
      sourceUrl: recipe.sourceUrl,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      ingredients: recipe.ingredients,
      directions: recipe.directions,
      nutrition: recipe.nutrition,
      tags: recipe.tags,
      visibility: recipe.visibility || 'private',
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
      user: recipe.user,
    };
  }
}

export const recipeService = new RecipeService();
