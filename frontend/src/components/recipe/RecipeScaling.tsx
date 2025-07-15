import React, { useState, useEffect } from 'react';
import { Calculator, Minus, Plus } from 'lucide-react';
import { Recipe } from '../../types';

interface RecipeScalingProps {
  recipe: Recipe;
  onScaleChange: (scale: number) => void;
  className?: string;
}

export const RecipeScaling: React.FC<RecipeScalingProps> = ({
  recipe,
  onScaleChange,
  className = ''
}) => {
  const [scale, setScale] = useState(1);
  const [customServings, setCustomServings] = useState(recipe.servings || 4);

  useEffect(() => {
    onScaleChange(scale);
  }, [scale, onScaleChange]);

  const handleScaleChange = (newScale: number) => {
    if (newScale > 0 && newScale <= 10) {
      setScale(newScale);
      setCustomServings(Math.round((recipe.servings || 4) * newScale));
    }
  };

  const handleServingsChange = (servings: number) => {
    if (servings > 0 && servings <= 50) {
      setCustomServings(servings);
      const newScale = servings / (recipe.servings || 4);
      setScale(newScale);
    }
  };

  const presetScales = [
    { label: '1/2', value: 0.5 },
    { label: '1x', value: 1 },
    { label: '2x', value: 2 },
    { label: '3x', value: 3 },
  ];

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Calculator className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Recipe Scaling</h3>
      </div>

      <div className="space-y-4">
        {/* Preset Scale Buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Scale
          </label>
          <div className="flex space-x-2">
            {presetScales.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handleScaleChange(preset.value)}
                className={`px-3 py-1 text-sm rounded-md border transition-colors duration-200 ${
                  scale === preset.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                aria-label={`Scale recipe to ${preset.label}`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Servings */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Servings
          </label>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleServingsChange(customServings - 1)}
              className="p-1 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
              disabled={customServings <= 1}
              aria-label="Decrease servings"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              value={customServings}
              onChange={(e) => handleServingsChange(parseInt(e.target.value) || 1)}
              min="1"
              max="50"
              className="w-16 text-center px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Number of servings"
            />
            <button
              onClick={() => handleServingsChange(customServings + 1)}
              className="p-1 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
              disabled={customServings >= 50}
              aria-label="Increase servings"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scale Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-800">
              Original: {recipe.servings || 4} servings
            </span>
            <span className="text-blue-800">
              Scaled: {customServings} servings
            </span>
          </div>
          <div className="mt-1 text-sm text-blue-700">
            Scale factor: {scale.toFixed(2)}x
          </div>
        </div>

        {/* Time Adjustment Note */}
        {scale !== 1 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Cooking times may need adjustment when scaling recipes. 
              Monitor your dish carefully and adjust as needed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeScaling;