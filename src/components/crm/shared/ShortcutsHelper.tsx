'use client';

import { useState } from 'react';
import { X, Keyboard } from 'lucide-react';
import { useKeyboardShortcuts, commonShortcuts } from '@/hooks/useKeyboardShortcuts';

interface Shortcut {
  keys: string[];
  description: string;
}

const SHORTCUTS: Shortcut[] = [
  { keys: ['⌘', 'K'], description: 'Global search' },
  { keys: ['⌘', 'N'], description: 'New application' },
  { keys: ['⌘', 'F'], description: 'Find contacts' },
  { keys: ['⌘', 'E'], description: 'Export data' },
  { keys: ['⌘', 'A'], description: 'Select all' },
  { keys: ['Esc'], description: 'Close modal' },
  { keys: ['?'], description: 'Show this help' },
];

export function ShortcutsHelper() {
  const [isOpen, setIsOpen] = useState(false);

  useKeyboardShortcuts({
    shortcuts: [
      commonShortcuts.help(() => setIsOpen(true)),
      commonShortcuts.escape(() => setIsOpen(false)),
    ],
    enabled: true,
  });

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors z-40"
        title="Show keyboard shortcuts (?)"
      >
        <Keyboard className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Keyboard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Keyboard Shortcuts
              </h2>
              <p className="text-sm text-gray-600">Navigate faster</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-3">
          {SHORTCUTS.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
            >
              <span className="text-sm text-gray-700">
                {shortcut.description}
              </span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <span
                    key={keyIndex}
                    className="inline-flex items-center justify-center px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-mono font-semibold text-gray-700 min-w-[2rem]"
                  >
                    {key}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs font-mono">?</kbd> anytime to show this help
          </p>
        </div>
      </div>
    </div>
  );
}
