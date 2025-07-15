import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Recipe } from '../../types';
import { IngredientInput, Ingredient } from './IngredientInput';
import { DirectionInput, Direction } from './DirectionInput';
import { FileUpload } from '../common/FileUpload';
import { uploadFile } from '../../services/upload';

// Zod validation schema
const recipeSchema = z.object({
  title: z.string().min(1, 'Recipe title is required').max(200, 'Title must be less than 200 characters'),
  photoUrl: z.string().min(1, 'Recipe image is required'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5').optional(),
  prepTime: z.number().min(0, 'Prep time must be positive').optional(),
  cookTime: z.number().min(0, 'Cook time must be positive').optional(),
  servings: z.number().min(1, 'Servings must be at least 1').optional(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']).optional(),
  ingredients: z.array(z.object({
    quantity: z.string().min(1, 'Quantity is required'),
    unit: z.string(),
    item: z.string().min(1, 'Ingredient name is required')
  })).min(1, 'At least one ingredient is required'),
  directions: z.array(z.object({
    step: z.number(),
    instruction: z.string().min(1, 'Instruction is required')
  })).min(1, 'At least one direction is required'),
  nutrition: z.object({
    calories: z.number().min(0).optional(),
    protein: z.number().min(0).optional(),
    carbohydrates: z.number().min(0).optional(),
    fat: z.number().min(0).optional(),
    fiber: z.number().min(0).optional(),
    sodium: z.number().min(0).optional(),
  }).optional(),
  tags: z.array(z.string()).optional(),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

interface RecipeFormProps {
  recipe?: Recipe;
  onSubmit: (data: RecipeFormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export const RecipeForm = ({ 
  recipe, 
  onSubmit, 
  isLoading = false, 
  submitLabel = 'Save Recipe' 
}: RecipeFormProps) => {
  const navigate = useNavigate();
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: '',
      photoUrl: '',
      rating: undefined,
      prepTime: undefined,
      cookTime: undefined,
      servings: undefined,
      difficulty: undefined,
      ingredients: [],
      directions: [],
      nutrition: {},
      tags: [],
    },
  });

  const watchedIngredients = watch('ingredients') || [];
  const watchedDirections = watch('directions') || [];
  const watchedTags = watch('tags') || [];

  // Populate form if editing existing recipe
  useEffect(() => {
    if (recipe) {
      reset({
        title: recipe.title,
        photoUrl: recipe.photoUrl,
        rating: recipe.rating || undefined,
        prepTime: recipe.prepTime || undefined,
        cookTime: recipe.cookTime || undefined,
        servings: recipe.servings || undefined,
        difficulty: recipe.difficulty as any || undefined,
        ingredients: recipe.ingredients,
        directions: recipe.directions,
        nutrition: recipe.nutrition || {},
        tags: recipe.tags || [],
      });
    }
  }, [recipe, reset]);

  const handleFormSubmit = async (data: RecipeFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission failed:', error);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
      setValue('tags', [...watchedTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file) {
      setValue('photoUrl', '');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const result = await uploadFile(file);
      
      if (result.success && result.data) {
        setValue('photoUrl', result.data.url);
      } else {
        setUploadError(result.error || 'Upload failed');
      }
    } catch (error) {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {recipe ? 'Edit Recipe' : 'Create New Recipe'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipe Title *
                  </label>
                  <input
                    type="text"
                    {...register('title')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter recipe title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipe Image *
                  </label>
                  <FileUpload
                    onFileSelect={handleFileUpload}
                    currentUrl={watch('photoUrl')}
                    loading={uploading}
                    error={uploadError}
                    maxSize={5}
                  />
                  {errors.photoUrl && (
                    <p className="mt-1 text-sm text-red-600">{errors.photoUrl.message}</p>
                  )}
                </div>

                {/* Recipe Metadata Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rating
                    </label>
                    <select
                      {...register('rating', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select...</option>
                      <option value={1}>1 ⭐</option>
                      <option value={2}>2 ⭐⭐</option>
                      <option value={3}>3 ⭐⭐⭐</option>
                      <option value={4}>4 ⭐⭐⭐⭐</option>
                      <option value={5}>5 ⭐⭐⭐⭐⭐</option>
                    </select>
                    {errors.rating && (
                      <p className="mt-1 text-xs text-red-600">{errors.rating.message}</p>
                    )}
                  </div>

                  {/* Prep Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prep Time (min)
                    </label>
                    <input
                      type="number"
                      {...register('prepTime', { valueAsNumber: true })}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="15"
                    />
                    {errors.prepTime && (
                      <p className="mt-1 text-xs text-red-600">{errors.prepTime.message}</p>
                    )}
                  </div>

                  {/* Cook Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cook Time (min)
                    </label>
                    <input
                      type="number"
                      {...register('cookTime', { valueAsNumber: true })}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="30"
                    />
                    {errors.cookTime && (
                      <p className="mt-1 text-xs text-red-600">{errors.cookTime.message}</p>
                    )}
                  </div>

                  {/* Servings */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Servings
                    </label>
                    <input
                      type="number"
                      {...register('servings', { valueAsNumber: true })}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="4"
                    />
                    {errors.servings && (
                      <p className="mt-1 text-xs text-red-600">{errors.servings.message}</p>
                    )}
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    {...register('difficulty')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select difficulty...</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                  </select>
                  {errors.difficulty && (
                    <p className="mt-1 text-sm text-red-600">{errors.difficulty.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Controller
                name="ingredients"
                control={control}
                render={({ field }) => (
                  <IngredientInput
                    ingredients={field.value}
                    onChange={field.onChange}
                    error={errors.ingredients?.message}
                  />
                )}
              />
            </div>

            {/* Directions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Controller
                name="directions"
                control={control}
                render={({ field }) => (
                  <DirectionInput
                    directions={field.value}
                    onChange={field.onChange}
                    error={errors.directions?.message}
                  />
                )}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tags */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              
              {/* Current Tags */}
              {watchedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {watchedTags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add Tag Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  placeholder="Add tag..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={!tagInput.trim()}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Press Enter or comma to add tags
              </p>
            </div>

            {/* Nutrition (Optional) */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nutrition (Optional)</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Calories
                  </label>
                  <input
                    type="number"
                    {...register('nutrition.calories', { valueAsNumber: true })}
                    min="0"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="250"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    {...register('nutrition.protein', { valueAsNumber: true })}
                    min="0"
                    step="0.1"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    {...register('nutrition.carbohydrates', { valueAsNumber: true })}
                    min="0"
                    step="0.1"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    {...register('nutrition.fat', { valueAsNumber: true })}
                    min="0"
                    step="0.1"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="8"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Fiber (g)
                  </label>
                  <input
                    type="number"
                    {...register('nutrition.fiber', { valueAsNumber: true })}
                    min="0"
                    step="0.1"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Sodium (mg)
                  </label>
                  <input
                    type="number"
                    {...register('nutrition.sodium', { valueAsNumber: true })}
                    min="0"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="300"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Saving...' : submitLabel}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};