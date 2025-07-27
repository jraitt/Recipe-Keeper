import { useState } from 'react';
import { Plus, X, GripVertical } from 'lucide-react';

export interface Direction {
  step: number;
  instruction: string;
}

interface DirectionInputProps {
  directions: Direction[];
  onChange: (directions: Direction[]) => void;
  error?: string;
}

export const DirectionInput = ({ directions, onChange, error }: DirectionInputProps) => {
  const [newInstruction, setNewInstruction] = useState('');

  const addDirection = () => {
    if (newInstruction.trim()) {
      const newStep = directions.length + 1;
      onChange([...directions, { step: newStep, instruction: newInstruction.trim() }]);
      setNewInstruction('');
    }
  };

  const removeDirection = (index: number) => {
    const updated = directions
      .filter((_, i) => i !== index)
      .map((direction, i) => ({ ...direction, step: i + 1 }));
    onChange(updated);
  };

  const updateDirection = (index: number, instruction: string) => {
    const updated = directions.map((direction, i) => 
      i === index ? { ...direction, instruction } : direction
    );
    onChange(updated);
  };

  const moveDirection = (index: number, newIndex: number) => {
    if (newIndex < 0 || newIndex >= directions.length) return;
    
    const updated = [...directions];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    
    // Renumber steps
    const renumbered = updated.map((direction, i) => ({ ...direction, step: i + 1 }));
    onChange(renumbered);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      addDirection();
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Directions
      </label>

      {/* Existing Directions */}
      {directions.length > 0 && (
        <div className="space-y-3">
          {directions.map((direction, index) => (
            <div key={index} className="flex gap-3 items-start bg-gray-50 p-4 rounded-md">
              {/* Step Number */}
              <div className="flex items-center gap-2">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {direction.step}
                </span>
                
                {/* Move buttons */}
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => moveDirection(index, index - 1)}
                    disabled={index === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <GripVertical className="w-3 h-3 rotate-90" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDirection(index, index + 1)}
                    disabled={index === directions.length - 1}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <GripVertical className="w-3 h-3 -rotate-90" />
                  </button>
                </div>
              </div>
              
              {/* Instruction */}
              <textarea
                value={direction.instruction}
                onChange={(e) => updateDirection(index, e.target.value)}
                placeholder="Describe this step..."
                rows={2}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              
              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeDirection(index)}
                className="text-red-600 hover:text-red-800 p-1 mt-1"
                title="Remove step"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Direction */}
      <div className="border border-gray-300 rounded-md p-4">
        <div className="flex gap-3 items-start">
          <span className="flex-shrink-0 w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
            {directions.length + 1}
          </span>
          
          <div className="flex-1">
            <textarea
              value={newInstruction}
              onChange={(e) => setNewInstruction(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe the next step... (Ctrl+Enter to add)"
              rows={2}
              className="w-full px-3 py-2 border-0 focus:ring-0 focus:outline-none text-sm text-gray-900 resize-none"
            />
          </div>
          
          <button
            type="button"
            onClick={addDirection}
            disabled={!newInstruction.trim()}
            className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 p-1 mt-1"
            title="Add step"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Help text */}
      <p className="text-xs text-gray-500">
        Add step-by-step cooking instructions. Use Ctrl+Enter or click + to add each step. 
        You can reorder steps using the arrow buttons.
      </p>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};