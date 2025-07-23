import { useState, useEffect } from 'react';
import { PhotoSuggestion, photoSuggestionService } from '../../services/photoService';
import { Loader2, Camera, ExternalLink, User } from 'lucide-react';

interface PhotoSelectorProps {
  title: string;
  ingredients?: string[];
  onSelect: (photoUrl: string) => void;
  onSkip: () => void;
  loading?: boolean;
}

export const PhotoSelector = ({ title, ingredients, onSelect, onSkip, loading: externalLoading }: PhotoSelectorProps) => {
  const [photos, setPhotos] = useState<PhotoSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [downloadingPhoto, setDownloadingPhoto] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      try {
        const result = await photoSuggestionService.getPhotoSuggestions(title, ingredients);
        console.log('Photo suggestions result:', result);
        setPhotos(result.photos || []);
        setMessage(result.message || 'No message provided');
      } catch (error) {
        console.error('Error loading photo suggestions:', error);
        setPhotos([]);
        setMessage('Failed to load photo suggestions');
      } finally {
        setLoading(false);
      }
    };

    if (title) {
      fetchPhotos();
    }
  }, [title, ingredients]);

  const handlePhotoSelect = async (photo: PhotoSuggestion) => {
    setSelectedPhoto(photo.id);
    setDownloadingPhoto(photo.id);
    
    try {
      // Download and store the photo locally
      const response = await photoSuggestionService.downloadPhoto(photo.url, title);
      
      if (response.success && response.localUrl) {
        // Use the local URL
        onSelect(response.localUrl);
      } else {
        // Fallback to original URL if download fails
        console.warn('Failed to download photo locally, using original URL');
        onSelect(photo.url);
      }
    } catch (error) {
      console.error('Error downloading photo:', error);
      // Fallback to original URL on error
      onSelect(photo.url);
    } finally {
      setDownloadingPhoto(null);
    }
  };

  const handleSkip = () => {
    setSelectedPhoto(null);
    onSkip();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Finding Photos</h3>
        <p className="text-sm text-gray-500 text-center">
          Searching for beautiful photos to match your recipe...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <Camera className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Choose a Photo for Your Recipe
        </h3>
        <p className="text-gray-600">
          Select a photo that best represents "{title}" or skip to use a default image
        </p>
      </div>

      {/* Photo Grid */}
      {photos && photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                selectedPhoto === photo.id
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handlePhotoSelect(photo)}
            >
              <div className="aspect-square">
                <img
                  src={photo.thumbnailUrl}
                  alt={photo.description}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              
              {/* Photo Attribution Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1 truncate">
                    <User className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{photo.photographer}</span>
                  </div>
                  <a
                    href={photo.photographerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-300 hover:text-blue-100 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Selection Indicator or Loading Spinner */}
              {downloadingPhoto === photo.id ? (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Loader2 className="w-3 h-3 text-white animate-spin" />
                </div>
              ) : selectedPhoto === photo.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-600 mb-2">No Photos Found</h4>
          <p className="text-sm text-gray-500">{message}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <button
          onClick={handleSkip}
          disabled={externalLoading}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
        >
          Skip Photo
        </button>
        
        {selectedPhoto && (
          <div className="text-center flex-1">
            <p className="text-sm text-green-600 font-medium">
              ✓ Photo selected! Click "Continue" to proceed.
            </p>
          </div>
        )}
      </div>

      {/* Attribution Notice */}
      {photos.length > 0 && (
        <div className="text-xs text-gray-500 text-center pt-4 border-t">
          Photos provided by{' '}
          <a
            href="https://unsplash.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Unsplash
          </a>
        </div>
      )}
    </div>
  );
};