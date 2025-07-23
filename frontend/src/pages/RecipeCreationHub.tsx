import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useRecipeStore } from '../store/recipeStore';
import ImportModal from '../components/ai/ImportModal';
import { Recipe } from '../types';
import { 
  Edit3, 
  Camera, 
  Link2, 
  FileText, 
  ArrowLeft,
  Sparkles,
  Clock,
  Zap
} from 'lucide-react';

export const RecipeCreationHub = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { createRecipe } = useRecipeStore();
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const creationMethods = [
    {
      id: 'manual',
      title: 'Manual Entry',
      description: 'Fill out a form with recipe details',
      icon: Edit3,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      path: '/recipes/create/manual',
      features: ['Complete control', 'Add custom details', 'Perfect formatting'],
      time: '5-10 min',
      badge: null
    },
    {
      id: 'url',
      title: 'From URL',
      description: 'Import from any recipe website',
      icon: Link2,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      path: '/recipes/create/url',
      features: ['Instant import', 'Auto-format', 'High accuracy'],
      time: '30 sec',
      badge: { text: 'AI Powered', color: 'bg-green-100 text-green-700' }
    },
    {
      id: 'photo-dish',
      title: 'Photo of Dish',
      description: 'AI analyzes your finished food photo',
      icon: Camera,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      path: '/recipes/create/photo-dish',
      features: ['Visual analysis', 'Ingredient detection', 'Smart suggestions'],
      time: '1-2 min',
      badge: { text: 'AI Powered', color: 'bg-purple-100 text-purple-700' }
    },
    {
      id: 'recipe-card',
      title: 'Recipe Card',
      description: 'Photo of written recipe or cookbook',
      icon: FileText,
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      path: '/recipes/create/recipe-card',
      features: ['Text extraction', 'Multi-photo support', 'Accurate parsing'],
      time: '1-2 min',
      badge: { text: 'AI Powered', color: 'bg-orange-100 text-orange-700' }
    }
  ];

  const handleMethodSelect = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/recipes')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Recipes
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Add a New Recipe
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose how you'd like to add your recipe. Our AI can help speed up the process!
          </p>
        </div>

        {/* Creation Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {creationMethods.map((method) => {
            const IconComponent = method.icon;
            return (
              <div
                key={method.id}
                onClick={() => handleMethodSelect(method.path)}
                className={`relative bg-white rounded-2xl shadow-sm border-2 ${method.borderColor} ${method.hoverColor} hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden`}
              >
                {/* Background Pattern */}
                <div className={`absolute inset-0 ${method.bgColor} opacity-30`} />
                
                {/* Badge */}
                {method.badge && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${method.badge.color}`}>
                      <Sparkles className="w-3 h-3" />
                      <span>{method.badge.text}</span>
                    </div>
                  </div>
                )}

                <div className="relative p-8">
                  {/* Icon */}
                  <div className={`w-16 h-16 ${method.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {method.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {method.description}
                  </p>

                  {/* Features */}
                  <div className="mb-6">
                    <div className="space-y-2">
                      {method.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-700">
                          <div className={`w-1.5 h-1.5 rounded-full ${method.color} mr-3`} />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Time Estimate */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>~{method.time}</span>
                    </div>
                    <div className={`flex items-center text-sm font-medium ${method.textColor} group-hover:translate-x-1 transition-transform duration-200`}>
                      <span>Get Started</span>
                      <Zap className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Help Text */}
        <div className="text-center mt-12">
          <p className="text-gray-500">
            Not sure which method to choose? 
            <span className="font-medium text-gray-700"> URL import</span> is fastest for online recipes, 
            while <span className="font-medium text-gray-700">recipe cards</span> work great for handwritten or printed recipes.
          </p>
        </div>
      </div>
    </div>
  );
};