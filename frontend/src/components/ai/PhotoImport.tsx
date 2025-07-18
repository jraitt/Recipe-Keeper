import React, { useState } from 'react';
import { Upload, Camera, X, AlertCircle, CheckCircle, Plus } from 'lucide-react';

interface PhotoImportProps {
  onImport: (file: File) => Promise<void>;
  onMultiImport: (files: File[]) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const PhotoImport: React.FC<PhotoImportProps> = ({ onImport, onMultiImport, onCancel, loading = false }) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleFileSelect = (files: File[]) => {
    setError(null);
    
    // Validate files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        return false;
      }
      if (file.size > 15 * 1024 * 1024) {
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      setError('Please select valid image files (JPG, PNG, WEBP under 15MB)');
      return;
    }

    if (validFiles.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    setSelectedFiles(validFiles);
    
    // Create previews
    const newPreviews: string[] = [];
    validFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews[index] = e.target?.result as string;
        if (newPreviews.length === validFiles.length) {
          setPreviews([...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleImport = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      setError(null);
      if (selectedFiles.length === 1) {
        await onImport(selectedFiles[0]);
      } else {
        await onMultiImport(selectedFiles);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import recipe');
    }
  };

  const handleClear = () => {
    setSelectedFiles([]);
    setPreviews([]);
    setError(null);
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Import from Photo</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
          disabled={loading}
        >
          <X size={20} />
        </button>
      </div>

      {selectedFiles.length === 0 ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-4">
            <Camera className="w-12 h-12 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop photos here, or click to select
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInput}
                className="hidden"
                id="photo-upload"
                disabled={loading}
              />
              <label
                htmlFor="photo-upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-2" />
                Select Photos
              </label>
            </div>
            <p className="text-xs text-gray-500">
              Supports JPG, PNG, WEBP up to 15MB each. Max 5 photos.
            </p>
            <p className="text-xs text-blue-600 font-medium">
              💡 Perfect for front/back of recipe cards!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              {selectedFiles.length} photo{selectedFiles.length !== 1 ? 's' : ''} selected
            </p>
            <button
              onClick={handleClear}
              className="text-red-500 hover:text-red-600 text-sm"
              disabled={loading}
            >
              Clear all
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {previews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Recipe preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  disabled={loading}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="text-xs text-gray-500">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex justify-between">
                <span>{file.name}</span>
                <span>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      <div className="mt-6 flex space-x-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleImport}
          disabled={selectedFiles.length === 0 || loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Analyzing...
            </div>
          ) : (
            selectedFiles.length > 1 ? 'Import from Multiple Photos' : 'Import Recipe'
          )}
        </button>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        AI will analyze your photo{selectedFiles.length > 1 ? 's' : ''} and extract recipe information
      </div>
    </div>
  );
};

export default PhotoImport;