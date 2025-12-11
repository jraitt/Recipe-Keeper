import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, RotateCcw, RotateCw } from 'lucide-react';
import { fixImageUrl } from '../../utils/imageUtils';

interface FileUploadProps {
  onFileSelect: (file: File | null, rotation?: number) => void;
  currentUrl?: string;
  loading?: boolean;
  error?: string;
  maxSize?: number; // in MB
  accept?: string;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  currentUrl,
  loading = false,
  error,
  maxSize = 5,
  accept = 'image/*',
  className = ''
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when currentUrl changes (for edit mode)
  useEffect(() => {
    if (currentUrl && !preview) {
      setPreview(fixImageUrl(currentUrl));
    }
  }, [currentUrl, preview]);

  // Notify parent when rotation changes (for existing images or new uploads)
  useEffect(() => {
    if ((selectedFile || currentUrl) && rotation !== 0) {
      onFileSelect(selectedFile, rotation);
    }
  }, [rotation]); // Only when rotation changes

  const handleFileSelect = useCallback((file: File | null) => {
    if (file) {
      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setSelectedFile(file);
    } else {
      setPreview(null);
      setSelectedFile(null);
    }

    onFileSelect(file, rotation);
  }, [onFileSelect, maxSize, rotation]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleRemove = useCallback(() => {
    setPreview(null);
    setRotation(0);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileSelect(null, 0);
  }, [onFileSelect]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const rotateLeft = useCallback(() => {
    setRotation((prev) => (prev - 90 + 360) % 360);
  }, []);

  const rotateRight = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  // Determine which URL to display
  const displayUrl = preview || (currentUrl ? fixImageUrl(currentUrl) : null);

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={loading}
        />

        {displayUrl ? (
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">
              {selectedFile ? 'New Image Preview' : 'Current Recipe Image'}
            </div>
            <div className="relative inline-block">
              <img
                src={displayUrl}
                alt="Recipe preview"
                className="max-h-[300px] max-w-full rounded-lg shadow-md object-contain mx-auto"
                style={{ transform: `rotate(${rotation}deg)` }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                disabled={loading}
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  rotateLeft();
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <RotateCcw className="w-4 h-4" />
                Rotate Left
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  rotateRight();
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <RotateCw className="w-4 h-4" />
                Rotate Right
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              {loading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              ) : (
                <ImageIcon className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                {loading ? 'Uploading...' : 'Upload recipe image'}
              </p>
              <p className="text-sm text-gray-500">
                Drag and drop or click to select
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG, WebP up to {maxSize}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;