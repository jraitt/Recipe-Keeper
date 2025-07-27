import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useRecipeStore } from '../store/recipeStore';
import { useAuthStore } from '../store/authStore';
import { RecipeGrid } from '../components/recipe/RecipeGrid';
import { RecipeSearch } from '../components/recipe/RecipeSearch';

export const RecipesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const {
    recipes,
    isLoading,
    error,
    pagination,
    searchQuery,
    selectedTags,
    fetchRecipes,
    deleteRecipe,
    setSearchQuery,
    setSelectedTags,
    clearError,
  } = useRecipeStore();

  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const hasInitialFetched = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Prevent duplicate calls
    if (hasInitialFetched.current) {
      return;
    }

    hasInitialFetched.current = true;
    fetchRecipes({ page: 1, search: '', tags: [] });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Extract available tags from recipes
    const tags = new Set<string>();
    recipes.forEach(recipe => {
      recipe.tags.forEach(tag => tags.add(tag));
    });
    setAvailableTags(Array.from(tags).sort());
  }, [recipes]);

  const handleSearch = () => {
    fetchRecipes({ page: 1, search: searchQuery, tags: selectedTags });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRecipe(id);
    } catch (error) {
      console.error('Failed to delete recipe:', error);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/recipes/${id}/edit`);
  };

  const handleAddRecipe = () => {
    navigate('/recipes/new');
  };


  const handleLoadMore = () => {
    if (pagination?.hasNext) {
      fetchRecipes({ 
        page: pagination.page + 1, 
        search: searchQuery, 
        tags: selectedTags 
      });
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-full bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
          My Recipes
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAddRecipe}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Recipe
          </button>
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
            Showing {recipes.length} of {pagination.total} recipes
            {searchQuery && ` for "${searchQuery}"`}
            {selectedTags.length > 0 && ` with tags: ${selectedTags.join(', ')}`}
          </p>
        </div>
      )}

      {/* Recipe Grid */}
      <RecipeGrid
        recipes={recipes}
        isLoading={isLoading}
        onDelete={handleDelete}
        onEdit={handleEdit}
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

      </div>
    </div>
  );
};