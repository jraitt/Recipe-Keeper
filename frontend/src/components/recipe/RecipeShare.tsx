import React, { useState } from 'react';
import { Share2, Link, Copy, Facebook, Twitter, Mail, MessageCircle, Check } from 'lucide-react';
import { Recipe } from '../../types';
import { useToast } from '../common/Toast';

interface RecipeShareProps {
  recipe: Recipe;
  className?: string;
}

export const RecipeShare: React.FC<RecipeShareProps> = ({ recipe, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();

  const recipeUrl = `${window.location.origin}/recipes/${recipe.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(recipeUrl);
      setCopied(true);
      addToast({
        type: 'success',
        title: 'Link copied!',
        message: 'Recipe link has been copied to your clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = recipeUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopied(true);
      addToast({
        type: 'success',
        title: 'Link copied!',
        message: 'Recipe link has been copied to your clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: copied ? Check : Copy,
      onClick: handleCopyLink,
      color: 'text-gray-600 hover:text-gray-800',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      onClick: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(recipeUrl)}`,
          '_blank',
          'width=600,height=400'
        );
      },
      color: 'text-blue-600 hover:text-blue-800',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      onClick: () => {
        const text = `Check out this ${recipe.title} recipe!`;
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(recipeUrl)}`,
          '_blank',
          'width=600,height=400'
        );
      },
      color: 'text-blue-400 hover:text-blue-600',
    },
    {
      name: 'Email',
      icon: Mail,
      onClick: () => {
        const subject = `Recipe: ${recipe.title}`;
        const body = `I thought you might enjoy this recipe: ${recipe.title}\n\n${recipeUrl}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      },
      color: 'text-gray-600 hover:text-gray-800',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      onClick: () => {
        const text = `Check out this ${recipe.title} recipe: ${recipeUrl}`;
        window.open(
          `https://wa.me/?text=${encodeURIComponent(text)}`,
          '_blank'
        );
      },
      color: 'text-green-600 hover:text-green-800',
    },
  ];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Share recipe"
        aria-expanded={isOpen}
      >
        <Share2 className="h-4 w-4" />
        <span>Share</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Share menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-200">
              Share Recipe
            </div>
            <div className="py-2">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={option.onClick}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors duration-200"
                  aria-label={`Share via ${option.name}`}
                >
                  <option.icon className={`h-4 w-4 ${option.color}`} />
                  <span className="text-gray-700">{option.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RecipeShare;