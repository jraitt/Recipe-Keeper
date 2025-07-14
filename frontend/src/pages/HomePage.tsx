export const HomePage = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        Welcome to Recipe Keeper
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Store, organize, and discover amazing recipes with AI-powered features
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            AI-Powered Import
          </h3>
          <p className="text-gray-600">
            Extract recipes from photos or URLs using Google's Gemini AI
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Smart Organization
          </h3>
          <p className="text-gray-600">
            Organize your recipes with tags, categories, and powerful search
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Beautiful Interface
          </h3>
          <p className="text-gray-600">
            Clean, modern design that makes cooking a pleasure
          </p>
        </div>
      </div>
    </div>
  );
};