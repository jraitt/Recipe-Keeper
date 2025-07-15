import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Camera, Link as LinkIcon } from 'lucide-react';
import { useRecipeStore } from '../store/recipeStore';
import { useAuthStore } from '../store/authStore';
import { RecipeGrid } from '../components/recipe/RecipeGrid';
import { RecipeSearch } from '../components/recipe/RecipeSearch';
import ImportModal from '../components/ai/ImportModal';
import { recipeService } from '../services/recipe';
import { aiService } from '../services/aiService';

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
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Load recipes on page load
    fetchRecipes();
  }, [isAuthenticated, navigate, fetchRecipes]);

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

  const handleImportFromPhoto = () => {
    setShowImportModal(true);
  };

  const handleImportFromURL = () => {
    setShowImportModal(true);
  };

  const handleImport = async (recipe: any) => {
    try {
      // Convert AI recipe to our format
      const convertedRecipe = aiService.convertToRecipe(recipe);
      
      // Create the recipe
      const response = await recipeService.createRecipe(convertedRecipe);
      
      // Refresh the recipes list
      fetchRecipes();
      
      // Close the modal
      setShowImportModal(false);
      
      // Navigate to the new recipe
      navigate(`/recipes/${response.data.recipe.id}`);
    } catch (error) {
      console.error('Failed to import recipe:', error);
      throw error;
    }
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
    <div>
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
          <button
            onClick={handleImportFromPhoto}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            <Camera className="w-4 h-4" />
            Import from Photo
          </button>
          <button
            onClick={handleImportFromURL}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            <LinkIcon className="w-4 h-4" />
            Import from URL
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
        onSearchChange={setSearchQuery}
        onTagsChange={setSelectedTags}
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

      {/* AI Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />
    </div>
  );
};