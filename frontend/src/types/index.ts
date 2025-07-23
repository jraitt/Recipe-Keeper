// Auth types
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Recipe types (for future use)
export interface Recipe {
  id: string;
  title: string;
  rating: number;
  photoUrl: string;
  sourceUrl?: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  ingredients: Ingredient[];
  directions: Direction[];
  nutrition: Nutrition;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface Ingredient {
  quantity: string;
  unit: string;
  item: string;
}

export interface Direction {
  step: number;
  instruction: string;
}

export interface Nutrition {
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  sodium?: number;
}