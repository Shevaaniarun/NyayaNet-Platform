import { Search, Filter, TrendingUp, Clock, Heart, MessageCircle, X, FileText, HelpCircle, Megaphone } from 'lucide-react';
import { useState } from 'react';

interface PostFiltersProps {
    onFilterChange: (filters: {
        postType?: string;
        tags?: string[];
        sort?: 'newest' | 'popular' | 'liked' | 'discussed';
        q?: string;
    }) => void;
}

export function PostFilters({ onFilterChange }: PostFiltersProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPostType, setSelectedPostType] = useState('');
    const [selectedSort, setSelectedSort] = useState('newest');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    const postTypes = [
        { value: '', label: 'All Types', icon: FileText },
        { value: 'POST', label: 'Post', icon: FileText },
        { value: 'QUESTION', label: 'Question', icon: HelpCircle },
        { value: 'ARTICLE', label: 'Article', icon: FileText },
        { value: 'ANNOUNCEMENT', label: 'Announcement', icon: Megaphone },
    ];

    const sortOptions = [
        { value: 'newest', label: 'Newest', icon: Clock },
        { value: 'popular', label: 'Most Viewed', icon: TrendingUp },
        { value: 'liked', label: 'Most Liked', icon: Heart },
        { value: 'discussed', label: 'Most Discussed', icon: MessageCircle },
    ];

    const handleSearch = () => {
        onFilterChange({
            q: searchQuery || undefined,
            postType: selectedPostType || undefined,
            sort: selectedSort as 'newest' | 'popular' | 'liked' | 'discussed',
            tags: selectedTags.length > 0 ? selectedTags : undefined,
        });
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedPostType('');
        setSelectedSort('newest');
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
                    <span>Filter Posts</span>
                </h3>
                {(selectedPostType || selectedTags.length > 0 || searchQuery) && (
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
                        placeholder="Search posts by title, content, tags, or author..."
                        className="w-full parchment-bg border border-constitution-gold/30 rounded-lg pl-12 pr-4 py-3 text-ink-gray font-body focus:outline-none focus:border-constitution-gold"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Post Type */}
                <div>
                    <label className="block text-ink-gray font-medium mb-2 text-sm">Post Type</label>
                    <select
                        value={selectedPostType}
                        onChange={(e) => setSelectedPostType(e.target.value)}
                        className="w-full parchment-bg border border-constitution-gold/30 rounded-lg px-4 py-2.5 text-ink-gray font-body focus:outline-none focus:border-constitution-gold text-sm appearance-none"
                    >
                        {postTypes.map((type) => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                </div>

                {/* Sort */}
                <div>
                    <label className="block text-ink-gray font-medium mb-2 text-sm">Sort By</label>
                    <div className="grid grid-cols-4 gap-2">
                        {sortOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setSelectedSort(option.value)}
                                    className={`flex flex-col items-center justify-center p-2.5 border rounded-lg transition-all ${selectedSort === option.value ? 'border-constitution-gold bg-constitution-gold/5 text-constitution-gold' : 'border-constitution-gold/20 hover:border-constitution-gold/40 text-ink-gray/70 hover:text-ink-gray'}`}
                                    title={option.label}
                                >
                                    <Icon className="w-4 h-4 mb-1" />
                                    <span className="text-xs hidden lg:block">{option.label.split(' ')[0]}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Tags */}
            <div className="mt-6">
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
