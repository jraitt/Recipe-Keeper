import { useNavigate, useLocation } from 'react-router-dom';
import { useRecipeStore } from '../store/recipeStore';
import { useAuthStore } from '../store/authStore';
import { RecipeForm } from '../components/recipe/RecipeForm';
import { CreateRecipeRequest } from '../services/recipe';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import UrlImport from '../components/ai/UrlImport';
import PhotoImport from '../components/ai/PhotoImport';
import ImportPreview from '../components/ai/ImportPreview';
import { PhotoSelector } from '../components/ai/PhotoSelector';
import { aiService } from '../services/aiService';
import { uploadFile, getImageUrl } from '../services/upload';
import { Recipe } from '../types';

export const CreateRecipePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const { createRecipe, isLoading, error, clearError } = useRecipeStore();
  
  // Determine creation method from route
  const getCreationMethod = () => {
    if (location.pathname.includes('/manual')) return 'manual';
    if (location.pathname.includes('/url')) return 'url';
    if (location.pathname.includes('/photo-dish')) return 'photo-dish';
    if (location.pathname.includes('/recipe-card')) return 'recipe-card';
    return 'manual'; // default fallback
  };
  
  const [creationMethod] = useState(getCreationMethod());
  const [importStep, setImportStep] = useState<'input' | 'importing' | 'photo-selection' | 'preview'>('input');
  const [importedRecipe, setImportedRecipe] = useState<Recipe | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importLoading, setImportLoading] = useState(false);

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

  const getPageTitle = () => {
    switch (creationMethod) {
      case 'url': return 'Import from URL';
      case 'photo-dish': return 'Import from Food Photo';
      case 'recipe-card': return 'Import from Recipe Card';
      default: return 'Create Recipe Manually';
    }
  };

  const getPageDescription = () => {
    switch (creationMethod) {
      case 'url': return 'Enter the URL of any recipe website to automatically import the recipe details.';
      case 'photo-dish': return 'Upload a photo of your finished dish and our AI will analyze it to create a recipe.';
      case 'recipe-card': return 'Upload photos of your written recipe cards or cookbook pages.';
      default: return 'Fill out the form below to create your recipe.';
    }
  };

  const handleUrlImport = async (url: string) => {
    setImportLoading(true);
    setImportStep('importing');
    setImportError(null);

    try {
      const result = await aiService.importFromUrl(url);
      console.log('URL import result from AI service:', result);
      console.log('Image URL from result:', result.imageUrl);
      console.log('Source URL from result:', result.sourceUrl);
      
      // Convert ImportedRecipe to Recipe format for ImportPreview
      const recipeForPreview: Recipe = {
        id: '', // Will be set when created
        userId: '', // Will be set when created
        title: result.title,
        photoUrl: result.imageUrl || '',
        sourceUrl: result.sourceUrl,
        rating: 0,
        prepTime: result.prepTime || 0,
        cookTime: result.cookTime || 0,
        servings: result.servings || 0,
        difficulty: result.difficulty || 'medium',
        ingredients: result.ingredients || [],
        directions: result.directions || [],
        nutrition: result.nutrition || {},
        tags: result.tags || [],
        createdAt: '',
        updatedAt: '',
        confidence: result.confidence,
        aiGenerated: result.aiGenerated,
        generatedAt: result.generatedAt
      } as any;
      
      console.log('Converted recipe for preview:', recipeForPreview);
      console.log('Final photoUrl:', recipeForPreview.photoUrl);
      setImportedRecipe(recipeForPreview);
      setImportStep('preview');
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to import recipe');
      setImportStep('input');
    } finally {
      setImportLoading(false);
    }
  };

  const handleImportConfirm = async (recipe: Recipe) => {
    try {
      console.log('Creating recipe from preview:', recipe);
      
      // Since ImportPreview already gives us a Recipe-like object,
      // we can create the recipe directly with the proper format
      const recipeData = {
        title: recipe.title,
        photoUrl: recipe.photoUrl, // This should contain our uploaded image URL
        sourceUrl: recipe.sourceUrl,
        rating: recipe.rating,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        ingredients: recipe.ingredients,
        directions: recipe.directions,
        nutrition: recipe.nutrition,
        tags: recipe.tags || [],
      };
      
      console.log('Recipe data for creation:', recipeData);
      const newRecipe = await createRecipe(recipeData);
      console.log('Created recipe:', newRecipe);
      navigate(`/recipes/${newRecipe.id}`);
    } catch (error) {
      console.error('Failed to create recipe:', error);
    }
  };

  const handlePhotoImport = async (file: File) => {
    setImportLoading(true);
    setImportStep('importing');
    setImportError(null);

    try {
      let uploadedImageUrl = '';
      
      // For "photo-dish", upload the image first to use as recipe photo
      if (creationMethod === 'photo-dish') {
        console.log('Uploading photo for photo-dish...', file.name);
        const uploadResult = await uploadFile(file);
        console.log('Upload result:', uploadResult);
        
        if (!uploadResult.success || !uploadResult.data) {
          throw new Error('Failed to upload image');
        }
        // Use relative path to avoid CORS issues
        const relativePath = uploadResult.data.url;
        uploadedImageUrl = relativePath; // Keep as relative path
        console.log('Uploaded image URL (relative):', relativePath);
        console.log('Using relative URL to avoid CORS:', uploadedImageUrl);
      }

      console.log('Analyzing photo with AI...');
      const result = await aiService.importFromPhoto(file);
      console.log('AI analysis result:', result);
      
      // For photo-dish, override the imageUrl with our uploaded image
      if (creationMethod === 'photo-dish' && uploadedImageUrl) {
        console.log('Overriding imageUrl:', result.imageUrl, '->', uploadedImageUrl);
        result.imageUrl = uploadedImageUrl;
      }
      
      // Convert ImportedRecipe to Recipe format for ImportPreview
      const recipeForPreview: Recipe = {
        id: '', // Will be set when created
        userId: '', // Will be set when created
        title: result.title,
        photoUrl: result.imageUrl || '',
        rating: 0,
        prepTime: result.prepTime || 0,
        cookTime: result.cookTime || 0,
        servings: result.servings || 0,
        difficulty: result.difficulty || 'medium',
        ingredients: result.ingredients || [],
        directions: result.directions || [],
        nutrition: result.nutrition || {},
        tags: result.tags || [],
        createdAt: '',
        updatedAt: '',
        confidence: result.confidence,
        aiGenerated: result.aiGenerated,
        generatedAt: result.generatedAt
      } as any;
      
      console.log('Final recipe data for preview:', recipeForPreview);
      setImportedRecipe(recipeForPreview);
      
      // For recipe cards, go to photo selection step (unless it's photo-dish which already has a photo)
      if (creationMethod === 'recipe-card') {
        setImportStep('photo-selection');
      } else {
        setImportStep('preview');
      }
    } catch (err) {
      console.error('Photo import error:', err);
      setImportError(err instanceof Error ? err.message : 'Failed to import recipe from photo');
      setImportStep('input');
    } finally {
      setImportLoading(false);
    }
  };

  const handleMultiPhotoImport = async (files: File[]) => {
    setImportLoading(true);
    setImportStep('importing');
    setImportError(null);

    try {
      let uploadedImageUrl = '';
      
      // For "photo-dish", upload the first image to use as recipe photo
      if (creationMethod === 'photo-dish' && files.length > 0) {
        const uploadResult = await uploadFile(files[0]);
        if (!uploadResult.success || !uploadResult.data) {
          throw new Error('Failed to upload image');
        }
        // Use relative path to avoid CORS issues
        const relativePath = uploadResult.data.url;
        uploadedImageUrl = relativePath; // Keep as relative path
        console.log('Multi-photo uploaded image URL (relative):', relativePath);
        console.log('Using relative URL to avoid CORS:', uploadedImageUrl);
      }

      const result = await aiService.importFromMultiplePhotos(files);
      
      // For photo-dish, override the imageUrl with our uploaded image
      if (creationMethod === 'photo-dish' && uploadedImageUrl) {
        console.log('Overriding imageUrl for multi-photo:', result.imageUrl, '->', uploadedImageUrl);
        result.imageUrl = uploadedImageUrl;
      }
      
      // Convert ImportedRecipe to Recipe format for ImportPreview
      const recipeForPreview: Recipe = {
        id: '', // Will be set when created
        userId: '', // Will be set when created
        title: result.title,
        photoUrl: result.imageUrl || '',
        rating: 0,
        prepTime: result.prepTime || 0,
        cookTime: result.cookTime || 0,
        servings: result.servings || 0,
        difficulty: result.difficulty || 'medium',
        ingredients: result.ingredients || [],
        directions: result.directions || [],
        nutrition: result.nutrition || {},
        tags: result.tags || [],
        createdAt: '',
        updatedAt: '',
        confidence: result.confidence,
        aiGenerated: result.aiGenerated,
        generatedAt: result.generatedAt
      } as any;
      
      console.log('Final multi-photo recipe data for preview:', recipeForPreview);
      setImportedRecipe(recipeForPreview);
      
      // For recipe cards, go to photo selection step (unless it's photo-dish which already has a photo)
      if (creationMethod === 'recipe-card') {
        setImportStep('photo-selection');
      } else {
        setImportStep('preview');
      }
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to import recipe from multiple photos');
      setImportStep('input');
    } finally {
      setImportLoading(false);
    }
  };

  const handlePhotoSelect = (photoUrl: string) => {
    if (importedRecipe) {
      setImportedRecipe({
        ...importedRecipe,
        photoUrl
      });
      setImportStep('preview');
    }
  };

  const handlePhotoSkip = () => {
    // Keep the current recipe without a photo (will use placeholder)
    setImportStep('preview');
  };

  const handleImportCancel = () => {
    setImportStep('input');
    setImportedRecipe(null);
    setImportError(null);
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/recipes/new')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Recipe Options
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {getPageTitle()}
          </h1>
          <p className="text-gray-600 max-w-2xl">
            {getPageDescription()}
          </p>
        </div>

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

        {/* URL Import Interface */}
        {creationMethod === 'url' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            {importStep === 'input' && (
              <div>
                {importError && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-red-600">{importError}</p>
                  </div>
                )}
                <UrlImport
                  onImport={handleUrlImport}
                  onCancel={() => navigate('/recipes/new')}
                  loading={importLoading}
                />
              </div>
            )}

            {importStep === 'importing' && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Recipe</h3>
                <p className="text-sm text-gray-500 text-center">
                  Our AI is extracting recipe information from the URL. This may take a moment...
                </p>
              </div>
            )}

            {importStep === 'preview' && importedRecipe && (
              <ImportPreview
                recipe={importedRecipe}
                onConfirm={handleImportConfirm}
                onCancel={handleImportCancel}
                loading={isLoading}
              />
            )}
          </div>
        )}

        {/* Recipe Card Import Interface */}
        {creationMethod === 'recipe-card' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            {importStep === 'input' && (
              <div>
                {importError && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-red-600">{importError}</p>
                  </div>
                )}
                {/* Custom styling for recipe card import */}
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Recipe Cards</h3>
                    <p className="text-gray-600">
                      Upload photos of your written recipes, recipe cards, or cookbook pages
                    </p>
                  </div>
                  <PhotoImport
                    onImport={handlePhotoImport}
                    onMultiImport={handleMultiPhotoImport}
                    onCancel={() => navigate('/recipes/new')}
                    loading={importLoading}
                  />
                </div>
              </div>
            )}

            {importStep === 'importing' && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Recipe Card</h3>
                <p className="text-sm text-gray-500 text-center">
                  Our AI is extracting recipe information from your photo{importedRecipe ? 's' : ''}. This may take a moment...
                </p>
              </div>
            )}

            {importStep === 'photo-selection' && importedRecipe && (
              <PhotoSelector
                title={importedRecipe.title}
                ingredients={importedRecipe.ingredients?.map(ing => ing.item)}
                onSelect={handlePhotoSelect}
                onSkip={handlePhotoSkip}
                loading={importLoading}
              />
            )}

            {importStep === 'preview' && importedRecipe && (
              <ImportPreview
                recipe={importedRecipe}
                onConfirm={handleImportConfirm}
                onCancel={handleImportCancel}
                loading={isLoading}
              />
            )}
          </div>
        )}

        {/* Photo of Dish Import Interface */}
        {creationMethod === 'photo-dish' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            {importStep === 'input' && (
              <div>
                {importError && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-red-600">{importError}</p>
                  </div>
                )}
                {/* Custom styling for food photo import */}
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Food Photos</h3>
                    <p className="text-gray-600">
                      Upload photos of your finished dish and our AI will analyze them to create a recipe
                    </p>
                  </div>
                  <PhotoImport
                    onImport={handlePhotoImport}
                    onMultiImport={handleMultiPhotoImport}
                    onCancel={() => navigate('/recipes/new')}
                    loading={importLoading}
                  />
                </div>
              </div>
            )}

            {importStep === 'importing' && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Food Photo</h3>
                <p className="text-sm text-gray-500 text-center">
                  Our AI is analyzing your dish photo{importedRecipe ? 's' : ''} to create a recipe. This may take a moment...
                </p>
              </div>
            )}

            {importStep === 'preview' && importedRecipe && (
              <ImportPreview
                recipe={importedRecipe}
                onConfirm={handleImportConfirm}
                onCancel={handleImportCancel}
                loading={isLoading}
              />
            )}
          </div>
        )}

        {/* Manual Recipe Form */}
        {creationMethod === 'manual' && (
          <div className="bg-white rounded-lg shadow-sm">
            <RecipeForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              submitLabel="Create Recipe"
            />
          </div>
        )}
      </div>
    </div>
  );
};