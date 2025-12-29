import { Search, Filter, TrendingUp, Clock, Star, Users, X } from 'lucide-react';
import { useState } from 'react';

interface DiscussionFiltersProps {
  onFilterChange: (filters: {
    category?: string;
    type?: string;
    tags?: string[];
    status?: 'resolved' | 'active';
    sort?: 'newest' | 'active' | 'popular' | 'upvoted';
    following?: boolean;
    q?: string;
  }) => void;
  availableCategories: string[];
}

export function DiscussionFilters({ onFilterChange, availableCategories }: DiscussionFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [followingOnly, setFollowingOnly] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const discussionTypes = [
    { value: '', label: 'All Types' },
    { value: 'GENERAL', label: 'General' },
    { value: 'CASE_ANALYSIS', label: 'Case Analysis' },
    { value: 'LEGAL_QUERY', label: 'Legal Query' },
    { value: 'OPINION_POLL', label: 'Opinion Poll' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest', icon: Clock },
    { value: 'active', label: 'Most Active', icon: TrendingUp },
    { value: 'popular', label: 'Most Popular', icon: Users },
    { value: 'upvoted', label: 'Most Upvoted', icon: Star },
  ];

  const handleSearch = () => {
    onFilterChange({
      q: searchQuery,
      category: selectedCategory || undefined,
      type: selectedType || undefined,
      status: selectedStatus as 'resolved' | 'active' || undefined,
      sort: selectedSort as 'newest' | 'active' | 'popular' | 'upvoted',
      following: followingOnly || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedType('');
    setSelectedStatus('');
    setSelectedSort('newest');
    setFollowingOnly(false);
    setSelectedTags([]);
    onFilterChange({});
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
      setSelectedTags([...selectedTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  return (
    <div className="aged-paper rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-bold text-ink-gray flex items-center space-x-2">
          <Filter className="w-5 h-5" />
          <span>Filter Discussions</span>
        </h3>
        {(selectedCategory || selectedType || selectedStatus || followingOnly || selectedTags.length > 0 || searchQuery) && (
          <button
            onClick={handleClearFilters}
            className="text-constitution-gold hover:text-gavel-bronze transition-colors text-sm flex items-center space-x-1"
          >
            <X className="w-4 h-4" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ink-gray/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search discussions, topics, or authors..."
            className="w-full parchment-bg border border-constitution-gold/30 rounded-lg pl-12 pr-4 py-3 text-ink-gray font-body focus:outline-none focus:border-constitution-gold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Category */}
        <div>
          <label className="block text-ink-gray font-medium mb-2 text-sm">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full parchment-bg border border-constitution-gold/30 rounded-lg px-4 py-2.5 text-ink-gray font-body focus:outline-none focus:border-constitution-gold text-sm appearance-none"
          >
            <option value="">All Categories</option>
            {availableCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div>
          <label className="block text-ink-gray font-medium mb-2 text-sm">Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full parchment-bg border border-constitution-gold/30 rounded-lg px-4 py-2.5 text-ink-gray font-body focus:outline-none focus:border-constitution-gold text-sm appearance-none"
          >
            {discussionTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-ink-gray font-medium mb-2 text-sm">Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full parchment-bg border border-constitution-gold/30 rounded-lg px-4 py-2.5 text-ink-gray font-body focus:outline-none focus:border-constitution-gold text-sm appearance-none"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-ink-gray font-medium mb-2 text-sm">Sort By</label>
          <div className="flex space-x-2">
            {sortOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedSort(option.value)}
                  className={`flex-1 flex flex-col items-center justify-center p-2.5 border rounded-lg transition-all ${selectedSort === option.value ? 'border-constitution-gold bg-constitution-gold/5 text-constitution-gold' : 'border-constitution-gold/20 hover:border-constitution-gold/40 text-ink-gray/70 hover:text-ink-gray'}`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span className="text-xs">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tags & Following */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Tags */}
        <div>
          <label className="block text-ink-gray font-medium mb-2 text-sm">Tags</label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              placeholder="Add tags..."
              className="flex-1 parchment-bg border border-constitution-gold/30 rounded-lg px-4 py-2 text-ink-gray font-body focus:outline-none focus:border-constitution-gold text-sm"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-constitution-gold/10 border border-constitution-gold/30 rounded-lg text-constitution-gold hover:bg-constitution-gold/20 transition-colors"
            >
              Add
            </button>
          </div>
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 bg-constitution-gold/10 border border-constitution-gold/30 rounded-full text-ink-gray/80 text-sm"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-ink-gray/60 hover:text-constitution-gold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Following Toggle */}
        <div className="flex items-center justify-end">
          <label className="flex items-center space-x-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={followingOnly}
                onChange={(e) => setFollowingOnly(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-12 h-6 rounded-full transition-colors ${followingOnly ? 'bg-constitution-gold' : 'bg-constitution-gold/20'}`}>
                <div className={`w-5 h-5 bg-parchment-cream rounded-full absolute top-0.5 transition-transform ${followingOnly ? 'transform translate-x-7' : 'translate-x-0.5'}`}></div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-constitution-gold" />
              <span className="text-ink-gray font-medium">Following Only</span>
            </div>
          </label>
        </div>
      </div>

      {/* Apply Button */}
      <div className="mt-6 pt-6 border-t border-constitution-gold/20 flex justify-end">
        <button
          onClick={handleSearch}
          className="px-8 py-3 bg-constitution-gold text-justice-black rounded-lg font-bold hover:bg-constitution-gold/90 transition-colors flex items-center space-x-2"
        >
          <Search className="w-4 h-4" />
          <span>Apply Filters</span>
        </button>
      </div>
    </div>
  );
}