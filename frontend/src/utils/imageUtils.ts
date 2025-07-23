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