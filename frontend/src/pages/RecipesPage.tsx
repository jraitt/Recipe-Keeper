export const RecipesPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        My Recipes
      </h1>
      
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-600 mb-4">
          No recipes yet. Start by adding your first recipe!
        </p>
        
        <div className="space-x-4">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
            Add Recipe
          </button>
          <button className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700">
            Import from Photo
          </button>
          <button className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700">
            Import from URL
          </button>
        </div>
      </div>
    </div>
  );
};