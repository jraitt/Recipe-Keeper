import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useRecipeStore } from '../store/recipeStore';
import { RecipeCard } from '../components/recipe/RecipeCard';
import { fixImageUrl } from '../utils/imageUtils';
import { 
  Plus, 
  Camera, 
  Link2, 
  Shuffle, 
  TrendingUp, 
  Clock, 
  Star,
  ChefHat,
  BookOpen
} from 'lucide-react';
import { Recipe } from '../types';

export const HomePage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { recipes, fetchRecipes, isLoading } = useRecipeStore();
  const navigate = useNavigate();
  const [recipeOfDay, setRecipeOfDay] = useState<Recipe | null>(null);
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);
  const [topTags, setTopTags] = useState<string[]>([]);
  const [userStats, setUserStats] = useState({ total: 0, favorites: 0, thisMonth: 0 });

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecipes({ page: 1 });
    }
  }, [isAuthenticated, fetchRecipes]);

  useEffect(() => {
    if (recipes.length > 0) {
      // Set recipe of the day (highest rated or random if no ratings)
      const ratedRecipes = recipes.filter(r => r.rating && r.rating >= 4);
      setRecipeOfDay(ratedRecipes.length > 0 ? ratedRecipes[0] : recipes[0]);
      
      // Get recent recipes (last 6)
      setRecentRecipes(recipes.slice(0, 6));
      
      // Calculate top tags
      const tagCounts: { [key: string]: number } = {};
      recipes.forEach(recipe => {
        recipe.tags?.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      const sortedTags = Object.entries(tagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8)
        .map(([tag]) => tag);
      setTopTags(sortedTags);
      
      // Calculate user stats
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      
      const monthlyRecipes = recipes.filter(recipe => {
        const recipeDate = new Date(recipe.createdAt);
        return recipeDate.getMonth() === thisMonth && recipeDate.getFullYear() === thisYear;
      });
      
      setUserStats({
        total: recipes.length,
        favorites: recipes.filter(r => r.rating && r.rating >= 4).length,
        thisMonth: monthlyRecipes.length
      });
    }
  }, [recipes]);

  const handleRandomRecipe = () => {
    if (recipes.length > 0) {
      const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
      navigate(`/recipes/${randomRecipe.id}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Personal
              <span className="text-blue-600 block">Recipe Keeper</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12">
              Store, organize, and discover amazing recipes with AI-powered features
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link 
                to="/register"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Get Started Free
              </Link>
              <Link 
                to="/login"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors"
              >
                Sign In
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-sm">
                <Camera className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  AI-Powered Import
                </h3>
                <p className="text-gray-600">
                  Extract recipes from photos or URLs using Google's Gemini AI
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-sm">
                <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Smart Organization
                </h3>
                <p className="text-gray-600">
                  Organize your recipes with tags, categories, and powerful search
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-sm">
                <ChefHat className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Beautiful Interface
                </h3>
                <p className="text-gray-600">
                  Clean, modern design that makes cooking a pleasure
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600">
            Ready to discover your next favorite recipe?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link 
            to="/recipes/new"
            className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors flex flex-col items-center space-y-2"
          >
            <Plus className="w-6 h-6" />
            <span className="text-sm font-medium">Add Recipe</span>
          </Link>
          
          <Link 
            to="/recipes/create/photo-dish"
            className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors flex flex-col items-center space-y-2"
          >
            <Camera className="w-6 h-6" />
            <span className="text-sm font-medium">From Photo</span>
          </Link>
          
          <Link 
            to="/recipes/create/url"
            className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors flex flex-col items-center space-y-2"
          >
            <Link2 className="w-6 h-6" />
            <span className="text-sm font-medium">From URL</span>
          </Link>
          
          <button 
            onClick={handleRandomRecipe}
            disabled={recipes.length === 0}
            className="bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-700 transition-colors flex flex-col items-center space-y-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Shuffle className="w-6 h-6" />
            <span className="text-sm font-medium">Random</span>
          </button>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Recipes</p>
                <p className="text-2xl font-bold text-blue-600">{userStats.total}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Favorite Recipes</p>
                <p className="text-2xl font-bold text-yellow-600">{userStats.favorites}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Added This Month</p>
                <p className="text-2xl font-bold text-green-600">{userStats.thisMonth}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Recipe of the Day */}
        {recipeOfDay && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Star className="w-6 h-6 text-yellow-500 mr-2" />
              Recipe of the Day
            </h2>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <img 
                    src={fixImageUrl(recipeOfDay.photoUrl)}
                    alt={recipeOfDay.title}
                    className="w-full h-48 md:h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-recipe.svg';
                    }}
                  />
                </div>
                <div className="md:w-2/3 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{recipeOfDay.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    {recipeOfDay.rating && (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span>{recipeOfDay.rating}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{(recipeOfDay.prepTime || 0) + (recipeOfDay.cookTime || 0)} min</span>
                    </div>
                    {recipeOfDay.difficulty && (
                      <div className="flex items-center">
                        <ChefHat className="w-4 h-4 mr-1" />
                        <span className="capitalize">{recipeOfDay.difficulty}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4">
                    {recipeOfDay.ingredients.slice(0, 4).map(ing => ing.item).join(', ')}
                    {recipeOfDay.ingredients.length > 4 && '...'}
                  </p>
                  <Link 
                    to={`/recipes/${recipeOfDay.id}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Recipe
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trending Tags */}
        {topTags.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-6 h-6 text-green-500 mr-2" />
              Trending Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {topTags.map((tag, index) => (
                <Link
                  key={tag}
                  to={`/recipes?tag=${encodeURIComponent(tag)}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    index < 3 
                      ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Recipes */}
        {recentRecipes.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Clock className="w-6 h-6 text-blue-500 mr-2" />
                Recently Added
              </h2>
              <Link 
                to="/recipes"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {recipes.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No recipes yet!
            </h2>
            <p className="text-gray-600 mb-6">
              Start building your recipe collection by adding your first recipe.
            </p>
            <Link 
              to="/recipes/new"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Recipe
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};