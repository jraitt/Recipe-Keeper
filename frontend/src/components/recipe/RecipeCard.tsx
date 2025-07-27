import { Link } from 'react-router-dom';
import { Clock, Users, Star, ChefHat, Eye, Lock } from 'lucide-react';
import { Recipe } from '../../types';
import { fixImageUrl } from '../../utils/imageUtils';

interface RecipeCardProps {
  recipe: Recipe;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  showActions?: boolean;
}

export const RecipeCard = ({ recipe, onDelete, onEdit, showActions = true }: RecipeCardProps) => {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete && window.confirm('Are you sure you want to delete this recipe?')) {
      onDelete(recipe.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(recipe.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <Link to={`/recipes/${recipe.id}`} className="block">
        {/* Image */}
        <div className="relative h-48 bg-gray-200">
          <img
            src={fixImageUrl(recipe.photoUrl)}
            alt={recipe.title}
            className="w-full h-full object-cover"
            onLoad={(e) => {
              const target = e.target as HTMLImageElement;
              console.log('✅ Image loaded successfully:', target.src);
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              console.error('❌ Image failed to load:', target.src, 'Original URL:', recipe.photoUrl);
              target.src = '/placeholder-recipe.svg';
            }}
          />
          {recipe.rating && (
            <div className="absolute top-2 right-2 bg-white bg-opacity-95 rounded-full px-2 py-1 flex items-center shadow-sm">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-sm font-bold text-gray-800">{recipe.rating}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {recipe.title}
          </h3>

          {/* Recipe Info */}
          <div className="flex items-center text-sm text-gray-600 mb-3 space-x-4">
            {totalTime > 0 && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{totalTime} min</span>
              </div>
            )}
            
            {recipe.servings && (
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>{recipe.servings} servings</span>
              </div>
            )}
            
            {recipe.difficulty && (
              <div className="flex items-center">
                <ChefHat className="w-4 h-4 mr-1" />
                <span className="capitalize">{recipe.difficulty}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {recipe.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {recipe.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{recipe.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Visibility Badge */}
          <div className="flex items-center mb-2">
            {recipe.visibility === 'public' ? (
              <div className="flex items-center text-green-600 text-xs">
                <Eye className="w-3 h-3 mr-1" />
                <span>Public</span>
              </div>
            ) : (
              <div className="flex items-center text-gray-500 text-xs">
                <Lock className="w-3 h-3 mr-1" />
                <span>Private</span>
              </div>
            )}
          </div>

          {/* Ingredients Preview */}
          <p className="text-sm text-gray-600 line-clamp-2">
            {recipe.ingredients.slice(0, 3).map(ing => ing.item).join(', ')}
            {recipe.ingredients.length > 3 && ', ...'}
          </p>
        </div>
      </Link>

      {/* Action Buttons */}
      {showActions && (onEdit || onDelete) && (
        <div className="border-t bg-gray-50 px-4 py-3 flex justify-end space-x-2">
          {onEdit && (
            <button
              onClick={handleEdit}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};