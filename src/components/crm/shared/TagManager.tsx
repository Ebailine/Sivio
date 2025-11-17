'use client';

import { useState } from 'react';
import { X, Plus, Tag, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface TagManagerProps {
  selectedTags?: string[];
  onTagsChange?: (tags: string[]) => void;
  allTags?: string[];
  placeholder?: string;
}

const DEFAULT_TAG_COLORS = [
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-green-100 text-green-700 border-green-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-orange-100 text-orange-700 border-orange-200',
  'bg-pink-100 text-pink-700 border-pink-200',
  'bg-yellow-100 text-yellow-700 border-yellow-200',
  'bg-red-100 text-red-700 border-red-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
];

const POPULAR_TAGS = [
  'High Priority',
  'Follow Up',
  'Urgent',
  'Technical',
  'Remote',
  'Startup',
  'Enterprise',
  'Hot Lead',
  'Cold',
  'Networking',
  'Referral',
  'Direct Application',
];

export function TagManager({
  selectedTags = [],
  onTagsChange,
  allTags = POPULAR_TAGS,
  placeholder = 'Add tags...',
}: TagManagerProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const getTagColor = (tag: string) => {
    const index = Math.abs(
      tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    ) % DEFAULT_TAG_COLORS.length;
    return DEFAULT_TAG_COLORS[index];
  };

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;

    if (selectedTags.includes(trimmedTag)) {
      toast.error('Tag already added');
      return;
    }

    const newTags = [...selectedTags, trimmedTag];
    onTagsChange?.(newTags);
    setInputValue('');
    setShowSuggestions(false);
    toast.success('Tag added');
  };

  const handleRemoveTag = (tag: string) => {
    const newTags = selectedTags.filter((t) => t !== tag);
    onTagsChange?.(newTags);
    toast.success('Tag removed');
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setInputValue('');
    }
  };

  const filteredSuggestions = allTags.filter(
    (tag) =>
      !selectedTags.includes(tag) &&
      tag.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getTagColor(
                tag
              )}`}
            >
              <Tag className="h-3.5 w-3.5" />
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:bg-white/50 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleInputKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (inputValue || filteredSuggestions.length > 0) && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {/* Create New Option */}
            {inputValue.trim() && !allTags.includes(inputValue.trim()) && (
              <button
                onClick={() => handleAddTag(inputValue)}
                className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors flex items-center gap-2 border-b border-gray-100"
              >
                <Plus className="h-4 w-4 text-blue-600" />
                <span className="text-sm">
                  Create <strong>{inputValue}</strong>
                </span>
              </button>
            )}

            {/* Suggestions */}
            {filteredSuggestions.length > 0 ? (
              <div className="py-1">
                <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Suggested Tags
                </p>
                {filteredSuggestions.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleAddTag(tag)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
                  >
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getTagColor(
                        tag
                      )}`}
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                    <Plus className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            ) : inputValue && !inputValue.trim() ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                Type to create a new tag
              </div>
            ) : null}

            {/* Popular Tags */}
            {!inputValue && allTags.length > 0 && (
              <div className="py-1">
                <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Popular Tags
                </p>
                {allTags.slice(0, 8).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleAddTag(tag)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
                  >
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getTagColor(
                        tag
                      )}`}
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                    <Plus className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Click Outside to Close */}
        {showSuggestions && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => {
              setShowSuggestions(false);
              setInputValue('');
            }}
          />
        )}
      </div>

      {/* Helper Text */}
      <p className="text-xs text-gray-500">
        Press Enter to add a tag, or select from suggestions
      </p>
    </div>
  );
}

// Tag Filter Component
interface TagFilterProps {
  allTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearAll: () => void;
}

export function TagFilter({
  allTags,
  selectedTags,
  onToggleTag,
  onClearAll,
}: TagFilterProps) {
  const getTagColor = (tag: string) => {
    const index = Math.abs(
      tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    ) % DEFAULT_TAG_COLORS.length;
    return DEFAULT_TAG_COLORS[index];
  };

  if (allTags.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Filter by Tags</h3>
        {selectedTags.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => onToggleTag(tag)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                isSelected
                  ? getTagColor(tag)
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              <Tag className="h-3.5 w-3.5" />
              {tag}
              {isSelected && <Check className="h-3.5 w-3.5" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
