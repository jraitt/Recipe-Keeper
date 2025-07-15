import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  text,
  fullScreen = false,
  className = ''
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'md':
        return 'h-8 w-8';
      case 'lg':
        return 'h-12 w-12';
      default:
        return 'h-8 w-8';
    }
  };

  const getSpinner = () => (
    <div
      className={`animate-spin rounded-full border-2 border-gray-200 border-t-blue-600 ${getSizeClasses()}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );

  const getDots = () => (
    <div className="flex space-x-1" role="status" aria-label="Loading">
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      <span className="sr-only">Loading...</span>
    </div>
  );

  const getPulse = () => (
    <div className="flex space-x-2" role="status" aria-label="Loading">
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      <span className="sr-only">Loading...</span>
    </div>
  );

  const getLoadingElement = () => {
    switch (variant) {
      case 'spinner':
        return getSpinner();
      case 'dots':
        return getDots();
      case 'pulse':
        return getPulse();
      default:
        return getSpinner();
    }
  };

  const loadingContent = (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {getLoadingElement()}
      {text && (
        <p className="text-sm text-gray-600 font-medium" aria-live="polite">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {loadingContent}
      </div>
    );
  }

  return loadingContent;
};

// Skeleton loading component for content placeholders
export const SkeletonLoader: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} role="status" aria-label="Loading content">
    <span className="sr-only">Loading content...</span>
  </div>
);

// Recipe card skeleton
export const RecipeCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <SkeletonLoader className="h-48 w-full" />
    <div className="p-4 space-y-3">
      <SkeletonLoader className="h-4 w-3/4" />
      <SkeletonLoader className="h-3 w-1/2" />
      <div className="flex justify-between items-center">
        <SkeletonLoader className="h-3 w-1/4" />
        <SkeletonLoader className="h-3 w-1/4" />
      </div>
    </div>
  </div>
);

export default Loading;