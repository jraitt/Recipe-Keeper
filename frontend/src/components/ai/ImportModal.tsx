import React, { useState } from 'react';
import { X, Camera, Link, Sparkles } from 'lucide-react';
import PhotoImport from './PhotoImport';
import UrlImport from './UrlImport';
import ImportPreview from './ImportPreview';
import { Recipe } from '../../types';
import { aiService } from '../../services/aiService';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (recipe: Recipe) => Promise<void>;
}

type ImportMethod = 'select' | 'photo' | 'url';
type ImportStep = 'method' | 'importing' | 'preview' | 'success';

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [importMethod, setImportMethod] = useState<ImportMethod>('select');
  const [importStep, setImportStep] = useState<ImportStep>('method');
  const [loading, setLoading] = useState(false);
  const [importedRecipe, setImportedRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setImportMethod('select');
    setImportStep('method');
    setLoading(false);
    setImportedRecipe(null);
    setError(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handlePhotoImport = async (file: File) => {
    setLoading(true);
    setImportStep('importing');
    setError(null);

    try {
      const result = await aiService.importFromPhoto(file);
      setImportedRecipe(result);
      setImportStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import recipe');
      setImportStep('method');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlImport = async (url: string) => {
    setLoading(true);
    setImportStep('importing');
    setError(null);

    try {
      const result = await aiService.importFromUrl(url);
      setImportedRecipe(result);
      setImportStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import recipe');
      setImportStep('method');
    } finally {
      setLoading(false);
    }
  };

  const handleImportConfirm = async (recipe: Recipe) => {
    setLoading(true);
    
    try {
      await onImport(recipe);
      setImportStep('success');
      
      // Close modal after success
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleImportCancel = () => {
    handleReset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">AI Recipe Import</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {importStep === 'method' && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-6">
                  Choose how you'd like to import your recipe
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setImportMethod('photo')}
                  className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <Camera className="w-12 h-12 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">From Photo</h3>
                  <p className="text-sm text-gray-500 text-center">
                    Upload a photo of your recipe and let AI extract the details
                  </p>
                </button>

                <button
                  onClick={() => setImportMethod('url')}
                  className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <Link className="w-12 h-12 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">From URL</h3>
                  <p className="text-sm text-gray-500 text-center">
                    Enter a recipe URL and let AI extract the information
                  </p>
                </button>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
          )}

          {importStep === 'importing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Recipe</h3>
              <p className="text-sm text-gray-500 text-center">
                Our AI is extracting recipe information. This may take a moment...
              </p>
            </div>
          )}

          {importStep === 'preview' && importedRecipe && (
            <ImportPreview
              recipe={importedRecipe}
              onConfirm={handleImportConfirm}
              onCancel={handleImportCancel}
              loading={loading}
            />
          )}

          {importStep === 'success' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Recipe Imported Successfully!</h3>
              <p className="text-sm text-gray-500 text-center">
                Your recipe has been saved and is ready to use.
              </p>
            </div>
          )}
        </div>

        {/* Method Selection */}
        {importMethod === 'photo' && importStep === 'method' && (
          <div className="p-6 border-t">
            <PhotoImport
              onImport={handlePhotoImport}
              onCancel={() => setImportMethod('select')}
              loading={loading}
            />
          </div>
        )}

        {importMethod === 'url' && importStep === 'method' && (
          <div className="p-6 border-t">
            <UrlImport
              onImport={handleUrlImport}
              onCancel={() => setImportMethod('select')}
              loading={loading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportModal;