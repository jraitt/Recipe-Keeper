import React, { useState } from 'react';
import { Link, X, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

interface UrlImportProps {
  onImport: (url: string) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const UrlImport: React.FC<UrlImportProps> = ({ onImport, onCancel, loading = false }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid URL');
      return;
    }

    try {
      setError(null);
      await onImport(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import recipe');
    }
  };

  const popularSites = [
    { name: 'AllRecipes', domain: 'allrecipes.com' },
    { name: 'Food Network', domain: 'foodnetwork.com' },
    { name: 'Epicurious', domain: 'epicurious.com' },
    { name: 'Serious Eats', domain: 'seriouseats.com' },
    { name: 'Bon Appétit', domain: 'bonappetit.com' },
    { name: 'Taste of Home', domain: 'tasteofhome.com' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Import from URL</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
          disabled={loading}
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="recipe-url" className="block text-sm font-medium text-gray-700 mb-2">
            Recipe URL
          </label>
          <div className="relative">
            <input
              type="url"
              id="recipe-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/recipe"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <Link className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!url.trim() || loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing...
              </div>
            ) : (
              'Import Recipe'
            )}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Popular Recipe Sites</h4>
        <div className="grid grid-cols-2 gap-2">
          {popularSites.map((site) => (
            <div
              key={site.domain}
              className="flex items-center p-2 bg-gray-50 rounded-md text-sm"
            >
              <ExternalLink className="w-3 h-3 text-gray-400 mr-2" />
              <span className="text-gray-600">{site.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        AI will extract recipe information from the webpage
      </div>
    </div>
  );
};

export default UrlImport;