import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { RecipeGrid } from '../components/recipe/RecipeGrid';
import { RecipeSearch } from '../components/recipe/RecipeSearch';
import { recipeService } from '../services/recipe';
import { Recipe } from '../types';

// Module-level flag to prevent duplicate initial fetches across StrictMode re-renders
let hasPublicRecipesFetched = false;

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const PublicRecipesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Reset flag and always fetch when component mounts
    hasPublicRecipesFetched = false;
    hasPublicRecipesFetched = true;
    fetchPublicRecipes({ page: 1, search: '', tags: [] });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Extract available tags from recipes
    const tags = new Set<string>();
    recipes.forEach(recipe => {
      recipe.tags.forEach(tag => tags.add(tag));
    });
    setAvailableTags(Array.from(tags).sort());
  }, [recipes]);

  const fetchPublicRecipes = async (params?: { page?: number; search?: string; tags?: string[] }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await recipeService.getPublicRecipes({
        page: params?.page || 1,
        limit: 20,
        search: params?.search || searchQuery,
        tags: params?.tags || selectedTags,
      });

      if (response.success) {
        setRecipes(response.data.recipes);
        setPagination(response.data.pagination);
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to fetch public recipes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchPublicRecipes({ page: 1, search: searchQuery, tags: selectedTags });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags);
  };

  const handleLoadMore = () => {
    if (pagination?.hasNext) {
      fetchPublicRecipes({ 
        page: pagination.page + 1, 
        search: searchQuery, 
        tags: selectedTags 
      });
    }
  };

  const clearError = () => {
    setError(null);
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-full bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Community Recipes
            </h1>
            <p className="text-gray-600">
              Discover amazing recipes shared by the community
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
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

        {/* Search and Filters */}
        <RecipeSearch
          searchQuery={searchQuery}
          selectedTags={selectedTags}
          onSearchChange={handleSearchChange}
          onTagsChange={handleTagsChange}
          onSearch={handleSearch}
          availableTags={availableTags}
        />

        {/* Recipe Stats */}
        {pagination && pagination.total > 0 && (
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {recipes.length} of {pagination.total} community recipes
              {searchQuery && ` for "${searchQuery}"`}
              {selectedTags.length > 0 && ` with tags: ${selectedTags.join(', ')}`}
            </p>
          </div>
        )}

        {/* Recipe Grid */}
        <RecipeGrid
          recipes={recipes}
          isLoading={isLoading}
          onDelete={() => {}} // No delete for public recipes
          onEdit={() => {}} // No edit for public recipes
          showActions={false} // Hide edit/delete actions
        />

        {/* Load More Button */}
        {pagination && pagination.hasNext && (
          <div className="text-center mt-8">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}

        {/* Pagination Info */}
        {pagination && (
          <div className="text-center mt-4 text-sm text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
          </div>
        )}

        {/* Empty State */}
        {recipes.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No community recipes found
            </h2>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedTags.length > 0 
                ? "Try adjusting your search or filters to find more recipes."
                : "Be the first to share a recipe with the community!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};