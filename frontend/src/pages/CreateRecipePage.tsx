import { useNavigate } from 'react-router-dom';
import { useRecipeStore } from '../store/recipeStore';
import { useAuthStore } from '../store/authStore';
import { RecipeForm } from '../components/recipe/RecipeForm';
import { CreateRecipeRequest } from '../services/recipe';
import { useEffect } from 'react';

export const CreateRecipePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { createRecipe, isLoading, error, clearError } = useRecipeStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Clear any previous errors when component mounts
    clearError();
  }, [isAuthenticated, navigate, clearError]);

  const handleSubmit = async (data: CreateRecipeRequest) => {
    try {
      const newRecipe = await createRecipe(data);
      navigate(`/recipes/${newRecipe.id}`);
    } catch (error) {
      // Error is handled by the store
      console.error('Failed to create recipe:', error);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div>
      {/* Global Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-600">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <RecipeForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitLabel="Create Recipe"
      />
    </div>
  );
};