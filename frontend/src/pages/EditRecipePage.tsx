import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecipeStore } from '../store/recipeStore';
import { useAuthStore } from '../store/authStore';
import { RecipeForm } from '../components/recipe/RecipeForm';
import { CreateRecipeRequest } from '../services/recipe';

export const EditRecipePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const {
    currentRecipe,
    isLoading,
    error,
    fetchRecipe,
    updateRecipe,
    clearCurrentRecipe,
    clearError,
  } = useRecipeStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (id) {
      fetchRecipe(id);
    }

    // Clear any previous errors when component mounts
    clearError();

    return () => {
      clearCurrentRecipe();
    };
  }, [id, isAuthenticated, navigate, fetchRecipe, clearCurrentRecipe, clearError]);

  const handleSubmit = async (data: CreateRecipeRequest) => {
    if (!currentRecipe) return;

    try {
      const updatedRecipe = await updateRecipe(currentRecipe.id, data);
      navigate(`/recipes/${updatedRecipe.id}`);
    } catch (error) {
      // Error is handled by the store
      console.error('Failed to update recipe:', error);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (isLoading && !currentRecipe) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="h-6 bg-gray-200 rounded w-20 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error}</div>
          <div className="space-x-4">
            <button
              onClick={clearError}
              className="text-blue-600 hover:text-blue-800"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/recipes')}
              className="text-gray-600 hover:text-gray-800"
            >
              Back to Recipes
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentRecipe) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="text-gray-600 mb-4">Recipe not found</div>
          <button
            onClick={() => navigate('/recipes')}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Recipes
          </button>
        </div>
      </div>
    );
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
        recipe={currentRecipe}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitLabel="Update Recipe"
      />
    </div>
  );
};