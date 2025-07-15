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

    const where: any = {
      userId,
      deletedAt: null,
    };

    // Add search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
      ];
    }

    // Add tags filter
    if (tags && tags.length > 0) {
      where.tags = { hassome: tags };
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
      recipes: recipes.map(recipe => this.formatRecipeResponse(recipe)),
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
        userId,
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
        ...(updateData.prepTime !== undefined && { prepTime: updateData.prepTime }),
        ...(updateData.cookTime !== undefined && { cookTime: updateData.cookTime }),
        ...(updateData.servings !== undefined && { servings: updateData.servings }),
        ...(updateData.difficulty && { difficulty: updateData.difficulty }),
        ...(updateData.ingredients && { ingredients: updateData.ingredients as any }),
        ...(updateData.directions && { directions: updateData.directions as any }),
        ...(updateData.nutrition !== undefined && { nutrition: updateData.nutrition as any }),
        ...(updateData.tags && { tags: updateData.tags }),
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
      byDifficulty: stats.reduce((acc, stat) => {
        if (stat.difficulty) {
          acc[stat.difficulty] = stat._count.id;
        }
        return acc;
      }, {} as Record<string, number>),
    };
  }

  /**
   * Search recipes across all public recipes (future feature)
   */
  async searchPublicRecipes(
    _query: string,
    page: number = 1,
    limit: number = 20
  ) {
    // For now, this returns empty as we don't have public recipes yet
    // This can be implemented later when we add public recipe sharing
    return {
      recipes: [] as RecipeResponse[],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

  /**
   * Format recipe response to match API contract
   */
  private formatRecipeResponse(recipe: any): RecipeResponse {
    return {
      id: recipe.id,
      title: recipe.title,
      rating: recipe.rating,
      photoUrl: recipe.photoUrl,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      ingredients: recipe.ingredients,
      directions: recipe.directions,
      nutrition: recipe.nutrition,
      tags: recipe.tags,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
      user: recipe.user,
    };
  }
}

export const recipeService = new RecipeService();