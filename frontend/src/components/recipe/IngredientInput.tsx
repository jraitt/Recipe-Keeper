import { useState } from 'react';
import { Plus, X } from 'lucide-react';

export interface Ingredient {
  quantity: string;
  unit: string;
  item: string;
}

interface IngredientInputProps {
  ingredients: Ingredient[];
  onChange: (ingredients: Ingredient[]) => void;
  error?: string;
}

const commonUnits = [
  'cup', 'cups', 'tablespoon', 'tbsp', 'teaspoon', 'tsp', 'pound', 'lb', 'ounce', 'oz',
  'gram', 'g', 'kilogram', 'kg', 'milliliter', 'ml', 'liter', 'l', 'pint', 'quart',
  'gallon', 'piece', 'pieces', 'slice', 'slices', 'clove', 'cloves', 'bunch', 'package',
  'can', 'bottle', 'jar', 'bag', 'box', 'dash', 'pinch', 'handful', 'to taste'
];

export const IngredientInput = ({ ingredients, onChange, error }: IngredientInputProps) => {
  const [newIngredient, setNewIngredient] = useState<Ingredient>({
    quantity: '',
    unit: '',
    item: ''
  });

  const addIngredient = () => {
    if (newIngredient.quantity.trim() && newIngredient.item.trim()) {
      onChange([...ingredients, { ...newIngredient }]);
      setNewIngredient({ quantity: '', unit: '', item: '' });
    }
  };

  const removeIngredient = (index: number) => {
    onChange(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = ingredients.map((ingredient, i) => 
      i === index ? { ...ingredient, [field]: value } : ingredient
    );
    onChange(updated);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient();
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Ingredients
      </label>

      {/* Existing Ingredients */}
      {ingredients.length > 0 && (
        <div className="space-y-2">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-2 items-center bg-gray-50 p-3 rounded-md">
              <input
                type="text"
                placeholder="Amount"
                value={ingredient.quantity}
                onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              
              <input
                type="text"
                placeholder="Unit"
                value={ingredient.unit}
                onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                list="units"
                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              
              <input
                type="text"
                placeholder="Ingredient"
                value={ingredient.item}
                onChange={(e) => updateIngredient(index, 'item', e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="text-red-600 hover:text-red-800 p-1"
                title="Remove ingredient"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Ingredient */}
      <div className="flex gap-2 items-center border border-gray-300 rounded-md p-3">
        <input
          type="text"
          placeholder="Amount"
          value={newIngredient.quantity}
          onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })}
          onKeyPress={handleKeyPress}
          className="w-20 px-2 py-1 border-0 focus:ring-0 focus:outline-none text-sm text-gray-900"
        />
        
        <input
          type="text"
          placeholder="Unit"
          value={newIngredient.unit}
          onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
          onKeyPress={handleKeyPress}
          list="units"
          className="w-24 px-2 py-1 border-0 focus:ring-0 focus:outline-none text-sm text-gray-900"
        />
        
        <input
          type="text"
          placeholder="Ingredient name"
          value={newIngredient.item}
          onChange={(e) => setNewIngredient({ ...newIngredient, item: e.target.value })}
          onKeyPress={handleKeyPress}
          className="flex-1 px-2 py-1 border-0 focus:ring-0 focus:outline-none text-sm text-gray-900"
        />
        
        <button
          type="button"
          onClick={addIngredient}
          disabled={!newIngredient.quantity.trim() || !newIngredient.item.trim()}
          className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 p-1"
          title="Add ingredient"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Units datalist */}
      <datalist id="units">
        {commonUnits.map((unit) => (
          <option key={unit} value={unit} />
        ))}
      </datalist>

      {/* Help text */}
      <p className="text-xs text-gray-500">
        Press Enter or click + to add each ingredient. Use common units like cups, tbsp, oz, etc.
      </p>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};