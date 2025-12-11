/**
 * Fix malformed image URLs that have double /api/ paths
 * This handles legacy URLs that were incorrectly stored with double /api/
 * Returns relative URLs to avoid CORS issues
 */
export const fixImageUrl = (url: string): string => {
  if (!url) return '';
  
  // If URL has double /api/, fix it
  if (url.includes('/api/api/uploads/')) {
    url = url.replace('/api/api/uploads/', '/api/uploads/');
  }
  
  // If it's an absolute URL pointing to our backend, make it relative
  if (url.includes('localhost:3021/api/uploads/')) {
    return url.replace(/https?:\/\/[^/]+/, '');
  }
  
  // If it already starts with /api/uploads/, use as-is
  if (url.startsWith('/api/uploads/')) {
    return url;
  }
  
  // If it's some other absolute URL, use as-is (for external images)
  if (url.startsWith('http')) {
    return url;
  }
  
  return url;
};

/**
 * Ensure image URL is absolute for proper display
 */
export const getAbsoluteImageUrl = (url: string): string => {
  if (!url) return '';

  // First fix any malformed URLs
  const fixedUrl = fixImageUrl(url);

  // If already absolute, return as-is
  if (fixedUrl.startsWith('http')) {
    return fixedUrl;
  }

  // If relative, make absolute
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3021/api';
  const domainUrl = baseUrl.replace('/api', ''); // Remove /api suffix
  return `${domainUrl}${fixedUrl}`;
};

/**
 * Rotate an image by specified degrees using Canvas API
 * @param imageUrl - URL of the image to rotate (can be data URL or http URL)
 * @param degrees - Rotation angle (0, 90, 180, 270)
 * @returns Promise<Blob> - Rotated image as Blob
 */
export const rotateImage = async (
  imageUrl: string,
  degrees: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Calculate canvas dimensions based on rotation
      const rad = (degrees * Math.PI) / 180;

      if (degrees === 90 || degrees === 270) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      // Apply rotation and draw image
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rad);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/jpeg',
        0.92
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
};