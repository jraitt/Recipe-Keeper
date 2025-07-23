import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Star, ChefHat, Edit, Trash2, ExternalLink } from 'lucide-react';
import { useRecipeStore } from '../store/recipeStore';
import { useAuthStore } from '../store/authStore';
import { RecipeShare } from '../components/recipe/RecipeShare';
import { RecipeScaling } from '../components/recipe/RecipeScaling';
import { PrintRecipe } from '../components/recipe/PrintRecipe';
import { CookingTimer } from '../components/recipe/CookingTimer';
import { Tooltip } from '../components/common/Tooltip';
import { Loading } from '../components/common/Loading';
import { fixImageUrl } from '../utils/imageUtils';

export const RecipeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [scale, setScale] = useState(1);
  const [showTimer, setShowTimer] = useState(false);
  const {
    currentRecipe,
    isLoading,
    error,
    fetchRecipe,
    deleteRecipe,
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

    return () => {
      clearCurrentRecipe();
    };
  }, [id, isAuthenticated, navigate, fetchRecipe, clearCurrentRecipe]);

  const handleEdit = () => {
    if (currentRecipe) {
      navigate(`/recipes/${currentRecipe.id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (currentRecipe && window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteRecipe(currentRecipe.id);
        navigate('/recipes');
      } catch (error) {
        console.error('Failed to delete recipe:', error);
      }
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <Loading size="lg" text="Loading recipe..." className="py-12" />
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={clearError}
          className="text-blue-600 hover:text-blue-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!currentRecipe) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 mb-4">Recipe not found</div>
        <Link
          to="/recipes"
          className="text-blue-600 hover:text-blue-800"
        >
          Back to Recipes
        </Link>
      </div>
    );
  }

  const totalTime = (currentRecipe.prepTime || 0) + (currentRecipe.cookTime || 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back Button */}
      <Link
        to="/recipes"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Recipes
      </Link>

      {/* Recipe Header */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="relative h-64 md:h-80">
          <img
            src={fixImageUrl(currentRecipe.photoUrl)}
            alt={currentRecipe.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-recipe.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {currentRecipe.title}
            </h1>
            <div className="flex items-center text-white text-sm space-x-4">
              {currentRecipe.rating && (
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 fill-current text-yellow-400" />
                  <span>{currentRecipe.rating}</span>
                </div>
              )}
              {totalTime > 0 && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{totalTime} min</span>
                </div>
              )}
              {currentRecipe.servings && (
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{currentRecipe.servings} servings</span>
                </div>
              )}
              {currentRecipe.difficulty && (
                <div className="flex items-center">
                  <ChefHat className="w-4 h-4 mr-1" />
                  <span className="capitalize">{currentRecipe.difficulty}</span>
                </div>
              )}
            </div>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <Tooltip content="Edit Recipe">
              <button
                onClick={handleEdit}
                className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Edit Recipe"
              >
                <Edit className="w-4 h-4 text-gray-700" />
              </button>
            </Tooltip>
            <Tooltip content="Delete Recipe">
              <button
                onClick={handleDelete}
                className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Delete Recipe"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </Tooltip>
          </div>
        </div>
        
        {/* Source URL if available */}
        {currentRecipe.sourceUrl && (
          <div className="px-4 py-3 bg-gray-50 border-t">
            <div className="text-sm text-gray-600">
              <span className="font-medium">URL Source:</span>{' '}
              <a
                href={currentRecipe.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
              >
                <span className="truncate max-w-xs">{currentRecipe.sourceUrl}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <RecipeShare recipe={currentRecipe} />
        <PrintRecipe recipe={currentRecipe} scale={scale} />
        <button
          onClick={() => setShowTimer(!showTimer)}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Clock className="h-4 w-4" />
          <span>Timer</span>
        </button>
      </div>

      {/* Cooking Timer */}
      {showTimer && (
        <div className="mb-6">
          <CookingTimer />
        </div>
      )}

      {/* Recipe Info Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {currentRecipe.prepTime !== undefined && currentRecipe.prepTime > 0 && (
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Prep Time:</h3>
              <p className="text-2xl font-bold text-blue-600">{currentRecipe.prepTime} mins</p>
            </div>
          )}
          {currentRecipe.cookTime !== undefined && currentRecipe.cookTime > 0 && (
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Cook Time:</h3>
              <p className="text-2xl font-bold text-blue-600">{currentRecipe.cookTime} mins</p>
            </div>
          )}
          {totalTime > 0 && (
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Total Time:</h3>
              <p className="text-2xl font-bold text-blue-600">{totalTime} mins</p>
            </div>
          )}
          {currentRecipe.servings && currentRecipe.servings > 0 && (
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Servings:</h3>
              <p className="text-2xl font-bold text-blue-600">{currentRecipe.servings}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ingredients */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ingredients</h2>
            <ul className="space-y-2">
              {currentRecipe.ingredients.map((ingredient, index) => {
                const scaledQuantity = ingredient.quantity 
                  ? (parseFloat(ingredient.quantity) * scale).toFixed(2).replace(/\.?0+$/, '')
                  : ingredient.quantity;
                return (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">
                      {scaledQuantity} {ingredient.unit} {ingredient.item}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Tags */}
          {currentRecipe.tags && currentRecipe.tags.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {currentRecipe.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Nutrition */}
          {currentRecipe.nutrition && (
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Nutrition</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {currentRecipe.nutrition.calories !== undefined && currentRecipe.nutrition.calories !== null && (
                  <div>
                    <span className="text-gray-600">Calories:</span>
                    <span className="ml-1 font-medium text-gray-900">{currentRecipe.nutrition.calories}</span>
                  </div>
                )}
                {currentRecipe.nutrition.protein !== undefined && currentRecipe.nutrition.protein !== null && (
                  <div>
                    <span className="text-gray-600">Protein:</span>
                    <span className="ml-1 font-medium text-gray-900">{currentRecipe.nutrition.protein}g</span>
                  </div>
                )}
                {currentRecipe.nutrition.carbohydrates !== undefined && currentRecipe.nutrition.carbohydrates !== null && (
                  <div>
                    <span className="text-gray-600">Carbs:</span>
                    <span className="ml-1 font-medium text-gray-900">{currentRecipe.nutrition.carbohydrates}g</span>
                  </div>
                )}
                {currentRecipe.nutrition.fat !== undefined && currentRecipe.nutrition.fat !== null && (
                  <div>
                    <span className="text-gray-600">Fat:</span>
                    <span className="ml-1 font-medium text-gray-900">{currentRecipe.nutrition.fat}g</span>
                  </div>
                )}
                {currentRecipe.nutrition.fiber !== undefined && currentRecipe.nutrition.fiber !== null && (
                  <div>
                    <span className="text-gray-600">Fiber:</span>
                    <span className="ml-1 font-medium text-gray-900">{currentRecipe.nutrition.fiber}g</span>
                  </div>
                )}
                {currentRecipe.nutrition.sodium !== undefined && currentRecipe.nutrition.sodium !== null && (
                  <div>
                    <span className="text-gray-600">Sodium:</span>
                    <span className="ml-1 font-medium text-gray-900">{currentRecipe.nutrition.sodium}mg</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recipe Scaling */}
          <div className="mt-6">
            <RecipeScaling recipe={currentRecipe} onScaleChange={setScale} />
          </div>
        </div>

        {/* Directions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Directions</h2>
            <ol className="space-y-4">
              {currentRecipe.directions.map((direction, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-4">
                    {direction.step}
                  </span>
                  <p className="text-gray-700 leading-relaxed">{direction.instruction}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};