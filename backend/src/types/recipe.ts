export interface RecipeIngredient {
  quantity: string;
  unit: string;
  item: string;
}

export interface RecipeDirection {
  step: number;
  instruction: string;
}

export interface RecipeNutrition {
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  sodium?: number;
}

export interface CreateRecipeRequest {
  title: string;
  rating?: number;
  photoUrl: string;
  sourceUrl?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: string;
  ingredients: RecipeIngredient[];
  directions: RecipeDirection[];
  nutrition?: RecipeNutrition;
  tags?: string[];
}

export interface UpdateRecipeRequest extends Partial<CreateRecipeRequest> {
  id: string;
}

export interface RecipeResponse {
  id: string;
  title: string;
  rating?: number;
  photoUrl: string;
  sourceUrl?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: string;
  ingredients: RecipeIngredient[];
  directions: RecipeDirection[];
  nutrition?: RecipeNutrition;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name?: string;
    email: string;
  };
}