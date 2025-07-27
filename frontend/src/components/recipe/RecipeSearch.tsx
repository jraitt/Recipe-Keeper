import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface RecipeSearchProps {
  searchQuery: string;
  selectedTags: string[];
  onSearchChange: (query: string) => void;
  onTagsChange: (tags: string[]) => void;
  onSearch: () => void;
  availableTags?: string[];
}

export const RecipeSearch = ({
  searchQuery,
  selectedTags,
  onSearchChange,
  onTagsChange,
  onSearch,
  availableTags = []
}: RecipeSearchProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Sync localSearch with parent searchQuery
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearch);
    onSearch();
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    onSearchChange(value); // Update parent state immediately
  };

  const handleTagToggle = (tag: string) => {
    // Case-insensitive tag comparison
    const isSelected = selectedTags.some(t => t.toLowerCase() === tag.toLowerCase());
    const newTags = isSelected
      ? selectedTags.filter(t => t.toLowerCase() !== tag.toLowerCase())
      : [...selectedTags, tag];
    onTagsChange(newTags);
  };

  const handleClearFilters = () => {
    setLocalSearch('');
    onSearchChange('');
    onTagsChange([]);
    onSearch();
  };

  const hasActiveFilters = searchQuery || selectedTags.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search recipes, ingredients, and tags..."
            value={localSearch}
            onChange={handleSearchInputChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
            showFilters || selectedTags.length > 0
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {selectedTags.length > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {selectedTags.length}
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            title="Clear all filters"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              Search: "{searchQuery}"
              <button
                onClick={() => {
                  setLocalSearch('');
                  onSearchChange('');
                  onSearch();
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
            >
              {tag}
              <button
                onClick={() => handleTagToggle(tag)}
                className="text-green-600 hover:text-green-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Filter by Tags</h4>
          
          {availableTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    selectedTags.some(t => t.toLowerCase() === tag.toLowerCase())
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No tags available. Tags will appear here as you add them to your recipes.</p>
          )}
        </div>
      )}
    </div>
  );
};