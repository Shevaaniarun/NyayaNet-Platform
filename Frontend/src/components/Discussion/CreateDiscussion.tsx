import { useState } from 'react';
import { Send, FileText, Hash, Lock, Globe, Gavel, MessageSquare, Users, Type } from 'lucide-react';

interface CreateDiscussionProps {
  onSubmit: (data: {
    title: string;
    description: string;
    discussionType: 'GENERAL' | 'CASE_ANALYSIS' | 'LEGAL_QUERY' | 'OPINION_POLL';
    category: string;
    tags: string[];
    isPublic: boolean;
  }) => void;
  onCancel?: () => void;
}

export function CreateDiscussion({ onSubmit, onCancel }: CreateDiscussionProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discussionType, setDiscussionType] = useState<'GENERAL' | 'CASE_ANALYSIS' | 'LEGAL_QUERY' | 'OPINION_POLL'>('GENERAL');
  const [category, setCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);

  const discussionTypes = [
    { value: 'GENERAL', label: 'General Discussion', icon: MessageSquare, color: 'text-ink-gray' },
    { value: 'CASE_ANALYSIS', label: 'Case Analysis', icon: Gavel, color: 'text-seal-red' },
    { value: 'LEGAL_QUERY', label: 'Legal Query', icon: Type, color: 'text-constitution-gold' },
    { value: 'OPINION_POLL', label: 'Opinion Poll', icon: Users, color: 'text-judge-ivory' },
  ];

  const categories = [
    'CONSTITUTIONAL_LAW',
    'CRIMINAL_LAW',
    'CIVIL_LAW',
    'CORPORATE_LAW',
    'INTELLECTUAL_PROPERTY',
    'TAX_LAW',
    'FAMILY_LAW',
    'CONSUMER_LAW',
    'CYBER_LAW',
    'ARBITRATION',
    'PROPERTY_LAW',
    'LEGAL_ETHICS',
    'INTERNATIONAL_LAW',
  ];

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-add any pending text in tagInput as tags
    let finalTags = [...tags];
    if (tagInput.trim()) {
      const newTags = tagInput.split(',')
        .map(t => t.trim())
        .filter(t => t && !finalTags.includes(t));
      finalTags = [...finalTags, ...newTags];
    }

    onSubmit({
      title,
      description,
      discussionType,
      category,
      tags: finalTags,
      isPublic,
    });
  };

  return (
    <div className="aged-paper rounded-lg p-8 relative max-w-4xl mx-auto">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-constitution-gold to-transparent"></div>

      <h2 className="font-heading font-bold text-ink-gray text-2xl mb-6">Start a New Legal Discussion</h2>

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="mb-6">
          <label className="block text-ink-gray font-medium mb-2">
            Discussion Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a clear, descriptive title for your discussion..."
            className="w-full parchment-bg border border-constitution-gold/30 rounded-lg p-4 text-ink-gray font-body focus:outline-none focus:border-constitution-gold"
            required
            maxLength={200}
          />
          <div className="text-right text-ink-gray/60 text-sm mt-1">
            {title.length}/200 characters
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-ink-gray font-medium mb-2">
            Detailed Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide detailed context, legal questions, or analysis points. The more specific, the better responses you'll receive..."
            className="w-full parchment-bg border border-constitution-gold/30 rounded-lg p-4 text-ink-gray font-body focus:outline-none focus:border-constitution-gold resize-none"
            rows={6}
            required
            maxLength={5000}
          />
          <div className="text-right text-ink-gray/60 text-sm mt-1">
            {description.length}/5000 characters
          </div>
        </div>

        {/* Discussion Type */}
        <div className="mb-6">
          <label className="block text-ink-gray font-medium mb-3">
            Discussion Type *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {discussionTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setDiscussionType(type.value as any)}
                  className={`p-4 border rounded-lg transition-all ${discussionType === type.value ? 'border-constitution-gold bg-constitution-gold/5' : 'border-constitution-gold/20 hover:border-constitution-gold/40'}`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Icon className={`w-6 h-6 ${type.color}`} />
                    <span className="text-ink-gray font-medium text-sm text-center">{type.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category */}
        <div className="mb-6">
          <label className="block text-ink-gray font-medium mb-2">
            Legal Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full parchment-bg border border-constitution-gold/30 rounded-lg p-4 text-ink-gray font-body focus:outline-none focus:border-constitution-gold appearance-none"
            required
          >
            <option value="">Select a legal category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div className="mb-6">
          <label className="block text-ink-gray font-medium mb-2">
            Tags
          </label>
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex-1">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add tags (e.g., Article14, ConsumerProtection, SupremeCourt)"
                className="w-full parchment-bg border border-constitution-gold/30 rounded-lg p-4 text-ink-gray font-body focus:outline-none focus:border-constitution-gold"
              />
            </div>
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-4 bg-constitution-gold/10 border border-constitution-gold/30 rounded-lg text-constitution-gold hover:bg-constitution-gold/20 transition-colors"
            >
              <Hash className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1.5 bg-constitution-gold/10 border border-constitution-gold/30 rounded-full text-ink-gray/80"
              >
                <Hash className="w-3 h-3 mr-1" />
                {tag}
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
        </div>

        {/* Visibility */}
        <div className="mb-8">
          <label className="block text-ink-gray font-medium mb-3">
            Visibility
          </label>
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <div className="relative">
                <input
                  type="radio"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 ${isPublic ? 'border-constitution-gold' : 'border-constitution-gold/30'}`}>
                  {isPublic && <div className="w-2.5 h-2.5 bg-constitution-gold rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-constitution-gold" />
                <span className="text-ink-gray">Public</span>
              </div>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <div className="relative">
                <input
                  type="radio"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 ${!isPublic ? 'border-constitution-gold' : 'border-constitution-gold/30'}`}>
                  {!isPublic && <div className="w-2.5 h-2.5 bg-constitution-gold rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-constitution-gold" />
                <span className="text-ink-gray">Private</span>
              </div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-constitution-gold/20">
          <div>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border border-constitution-gold/30 text-constitution-gold rounded-lg hover:bg-constitution-gold/5 transition-colors font-medium"
              >
                Cancel
              </button>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={!title.trim() || !description.trim() || !category}
              className="px-8 py-3 bg-constitution-gold text-justice-black rounded-lg font-bold hover:bg-constitution-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Start Discussion</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}