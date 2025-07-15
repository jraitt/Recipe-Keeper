import React, { useState } from 'react';
import { Edit2, Clock, Users, ChefHat, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { Recipe } from '../../types';

interface ImportPreviewProps {
  recipe: Recipe;
  onConfirm: (recipe: Recipe) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const ImportPreview: React.FC<ImportPreviewProps> = ({ recipe, onConfirm, onCancel, loading = false }) => {
  const [editedRecipe, setEditedRecipe] = useState<Recipe>({ ...recipe });
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (field: keyof Recipe, value: any) => {
    setEditedRecipe(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleIngredientChange = (index: number, field: string, value: string) => {
    const newIngredients = [...editedRecipe.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setEditedRecipe(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };

  const handleDirectionChange = (index: number, value: string) => {
    const newDirections = [...editedRecipe.directions];
    newDirections[index] = { ...newDirections[index], instruction: value };
    setEditedRecipe(prev => ({
      ...prev,
      directions: newDirections
    }));
  };

  const handleConfirm = async () => {
    await onConfirm(editedRecipe);
  };

  const confidenceColor = recipe.confidence >= 80 ? 'text-green-600' : 
                         recipe.confidence >= 60 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="space-y-6">
      {/* Header with confidence indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">AI Analysis Complete</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Confidence:</span>
          <span className={`text-sm font-medium ${confidenceColor}`}>
            {recipe.confidence}%
          </span>
        </div>
      </div>

      {/* Confidence warning */}
      {recipe.confidence < 70 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-800">
              AI confidence is low. Please review and edit the extracted information.
            </span>
          </div>
        </div>
      )}

      {/* Recipe Preview */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recipe Preview</h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Edit2 className="w-4 h-4" />
            <span>{isEditing ? 'Done' : 'Edit'}</span>
          </button>
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          {isEditing ? (
            <input
              type="text"
              value={editedRecipe.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-lg font-medium text-gray-900">{editedRecipe.title}</p>
          )}
        </div>

        {/* Recipe Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Servings</p>
              {isEditing ? (
                <input
                  type="number"
                  value={editedRecipe.servings}
                  onChange={(e) => handleInputChange('servings', parseInt(e.target.value))}
                  className="w-16 p-1 border border-gray-300 rounded text-sm"
                />
              ) : (
                <p className="text-sm font-medium text-gray-900">{editedRecipe.servings}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Prep Time</p>
              {isEditing ? (
                <input
                  type="number"
                  value={editedRecipe.prepTime}
                  onChange={(e) => handleInputChange('prepTime', parseInt(e.target.value))}
                  className="w-16 p-1 border border-gray-300 rounded text-sm"
                />
              ) : (
                <p className="text-sm font-medium text-gray-900">{editedRecipe.prepTime}min</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Cook Time</p>
              {isEditing ? (
                <input
                  type="number"
                  value={editedRecipe.cookTime}
                  onChange={(e) => handleInputChange('cookTime', parseInt(e.target.value))}
                  className="w-16 p-1 border border-gray-300 rounded text-sm"
                />
              ) : (
                <p className="text-sm font-medium text-gray-900">{editedRecipe.cookTime}min</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <ChefHat className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Difficulty</p>
              {isEditing ? (
                <select
                  value={editedRecipe.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  className="w-full p-1 border border-gray-300 rounded text-sm"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="expert">Expert</option>
                </select>
              ) : (
                <p className="text-sm font-medium text-gray-900 capitalize">{editedRecipe.difficulty}</p>
              )}
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Ingredients</h4>
          <div className="space-y-2">
            {editedRecipe.ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center space-x-2">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={ingredient.quantity}
                      onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                      className="w-16 p-1 border border-gray-300 rounded text-sm"
                      placeholder="Qty"
                    />
                    <input
                      type="text"
                      value={ingredient.unit}
                      onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                      className="w-20 p-1 border border-gray-300 rounded text-sm"
                      placeholder="Unit"
                    />
                    <input
                      type="text"
                      value={ingredient.item}
                      onChange={(e) => handleIngredientChange(index, 'item', e.target.value)}
                      className="flex-1 p-1 border border-gray-300 rounded text-sm"
                      placeholder="Ingredient"
                    />
                  </>
                ) : (
                  <p className="text-sm text-gray-900">
                    {ingredient.quantity} {ingredient.unit} {ingredient.item}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Directions */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Directions</h4>
          <div className="space-y-2">
            {editedRecipe.directions.map((direction, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-sm font-medium text-gray-500 mt-1">{direction.step}.</span>
                {isEditing ? (
                  <textarea
                    value={direction.instruction}
                    onChange={(e) => handleDirectionChange(index, e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded text-sm resize-none"
                    rows={2}
                  />
                ) : (
                  <p className="text-sm text-gray-900 flex-1">{direction.instruction}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        {editedRecipe.tags && editedRecipe.tags.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {editedRecipe.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Nutrition (if available) */}
        {editedRecipe.nutrition && Object.keys(editedRecipe.nutrition).length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Nutrition (per serving)</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-900">
              {editedRecipe.nutrition.calories && (
                <div>Calories: {editedRecipe.nutrition.calories}</div>
              )}
              {editedRecipe.nutrition.protein && (
                <div>Protein: {editedRecipe.nutrition.protein}g</div>
              )}
              {editedRecipe.nutrition.carbohydrates && (
                <div>Carbs: {editedRecipe.nutrition.carbohydrates}g</div>
              )}
              {editedRecipe.nutrition.fat && (
                <div>Fat: {editedRecipe.nutrition.fat}g</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </div>
          ) : (
            'Save Recipe'
          )}
        </button>
      </div>
    </div>
  );
};

export default ImportPreview;